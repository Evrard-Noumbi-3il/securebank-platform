package com.securebank.account.service;

import com.securebank.account.dto.TransactionDTO;
import com.securebank.account.dto.TransactionEvent;
import com.securebank.account.dto.TransferRequest;
import com.securebank.account.exception.AccountNotFoundException;
import com.securebank.account.exception.InsufficientBalanceException;
import com.securebank.account.exception.InvalidTransferException;
import com.securebank.account.model.Account;
import com.securebank.account.model.Transaction;
import com.securebank.account.repository.AccountRepository;
import com.securebank.account.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final KafkaProducerService kafkaProducerService;

    /**
     * ========================================================================
     * CORRECTION MAJEURE : Effectue un virement avec 2 TRANSACTIONS DISTINCTES
     * ========================================================================
     * 
     * Crée maintenant:
     * 1. Transaction TRANSFER_OUT pour le compte émetteur (-100€)
     * 2. Transaction TRANSFER_IN pour le compte récepteur (+100€)
     * 
     * Les 2 transactions partagent le même referenceId pour traçabilité.
     */
    @Transactional
    public TransactionDTO transfer(Long userId, TransferRequest request) {
        log.info("Processing transfer: from={}, to={}, amount={}", 
                request.getFromAccountId(), request.getToAccountNumber(), request.getAmount());

        // Validations métier
        validateTransferRequest(request);

        // Récupérer les comptes avec locks pessimistes (pour éviter race conditions)
        Account fromAccount = accountRepository.findByIdWithLock(request.getFromAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Source account not found: " + request.getFromAccountId()));

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Compte destinataire introuvable"));

        // Vérifier que le compte source appartient à l'utilisateur
        if (!fromAccount.getUserId().equals(userId)) {
            throw new InvalidTransferException("Unauthorized: Account does not belong to user");
        }

        // Vérifier les statuts des comptes
        if (fromAccount.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Source account is not active");
        }

        if (toAccount.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Destination account is not active");
        }

        // Vérifier le solde suffisant
        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Insufficient balance: available=%.2f, required=%.2f", 
                            fromAccount.getBalance(), request.getAmount()));
        }

        // ===== GÉNÉRATION DES RÉFÉRENCES =====
        String reference = generateReference();           // Ex: "TXN-A1B2C3D4"
        String referenceId = generateTransferReferenceId(); // Ex: "TRF-550e8400-e29b"
        LocalDateTime now = LocalDateTime.now();

        // ===== TRANSACTION 1 : SORTIE (TRANSFER_OUT) =====
        Transaction outTransaction = Transaction.builder()
                .fromAccountId(fromAccount.getId())
                .toAccountId(toAccount.getId())
                .amount(request.getAmount())
                .currency(fromAccount.getCurrency())
                .type(Transaction.TransactionType.TRANSFER_OUT)
                .status(Transaction.TransactionStatus.PENDING)
                .description(String.format("Virement vers %s - %s", 
                        maskAccountNumber(toAccount.getAccountNumber()), 
                        request.getDescription()))
                .reference(reference + "-OUT")
                .referenceId(referenceId)  // Même referenceId pour les 2 transactions
                .createdAt(now)
                .build();

        // ===== TRANSACTION 2 : ENTRÉE (TRANSFER_IN) =====
        Transaction inTransaction = Transaction.builder()
                .fromAccountId(fromAccount.getId())
                .toAccountId(toAccount.getId())
                .amount(request.getAmount())
                .currency(toAccount.getCurrency())
                .type(Transaction.TransactionType.TRANSFER_IN)
                .status(Transaction.TransactionStatus.PENDING)
                .description(String.format("Virement depuis %s - %s", 
                        maskAccountNumber(fromAccount.getAccountNumber()), 
                        request.getDescription()))
                .reference(reference + "-IN")
                .referenceId(referenceId)  // Même referenceId
                .createdAt(now)
                .build();

        // Sauvegarder les 2 transactions (statut PENDING)
        outTransaction = transactionRepository.save(outTransaction);
        inTransaction = transactionRepository.save(inTransaction);

        try {
            // ===== EFFECTUER LE TRANSFERT =====
            fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
            toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));

            accountRepository.save(fromAccount);
            accountRepository.save(toAccount);

            // ===== MARQUER LES 2 TRANSACTIONS COMME COMPLÉTÉES =====
            LocalDateTime completedAt = LocalDateTime.now();
            
            outTransaction.setStatus(Transaction.TransactionStatus.COMPLETED);
            outTransaction.setCompletedAt(completedAt);
            outTransaction = transactionRepository.save(outTransaction);

            inTransaction.setStatus(Transaction.TransactionStatus.COMPLETED);
            inTransaction.setCompletedAt(completedAt);
            inTransaction = transactionRepository.save(inTransaction);

            log.info("Transfer completed successfully: referenceId={}, out={}, in={}", 
                    referenceId, outTransaction.getId(), inTransaction.getId());

            // Publier les événements Kafka pour les 2 transactions
            publishTransactionEvent(outTransaction, userId);
            publishTransactionEvent(inTransaction, toAccount.getUserId());

            // Retourner la transaction de sortie (vue de l'émetteur)
            return mapToDTO(outTransaction, fromAccount.getId());

        } catch (Exception e) {
            // En cas d'erreur, marquer les 2 transactions comme échouées
            outTransaction.setStatus(Transaction.TransactionStatus.FAILED);
            inTransaction.setStatus(Transaction.TransactionStatus.FAILED);
            
            transactionRepository.save(outTransaction);
            transactionRepository.save(inTransaction);

            log.error("Transfer failed: referenceId={}", referenceId, e);
            throw new RuntimeException("Transfer failed: " + e.getMessage(), e);
        }
    }

    /**
     * Récupérer l'historique des transactions d'un compte
     * Plus besoin de logique complexe dans mapToDTO car les transactions
     * sont déjà créées avec le bon type (TRANSFER_IN ou TRANSFER_OUT)
     */
    public List<TransactionDTO> getAccountTransactions(Long accountId, Long userId) {
        log.info("Fetching transactions for account: {}", accountId);

        // Vérifier que le compte appartient à l'utilisateur
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new InvalidTransferException("Unauthorized: Account does not belong to user");
        }

        // Récupérer toutes les transactions où le compte est émetteur OU récepteur
        List<Transaction> transactions = transactionRepository
                .findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(accountId, accountId);

        return transactions.stream()
                .map(t -> mapToDTO(t, accountId))
                .collect(Collectors.toList());
    }

    /**
     * Récupérer toutes les transactions de l'utilisateur (tous ses comptes)
     */
    public List<TransactionDTO> getUserTransactions(Long userId) {
        List<Account> userAccounts = accountRepository.findByUserId(userId);
        
        return userAccounts.stream()
                .flatMap(account -> transactionRepository
                        .findByFromAccountIdOrToAccountId(account.getId(), account.getId())
                        .stream()
                        .map(t -> mapToDTO(t, account.getId())))
                .sorted(Comparator.comparing(TransactionDTO::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public Page<TransactionDTO> getUserTransactionsPaginated(Long userId, Pageable pageable) {
        List<TransactionDTO> allTransactions = getUserTransactions(userId);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allTransactions.size());
        
        List<TransactionDTO> pageContent = allTransactions.subList(start, end);
        return new PageImpl<>(pageContent, pageable, allTransactions.size());
    }

    public Page<TransactionDTO> getAccountTransactionsPaginated(Long accountId, Long userId, Pageable pageable) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new InvalidTransferException("Unauthorized: Account does not belong to user");
        }

        return transactionRepository
                .findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(accountId, accountId, pageable)
                .map(t -> mapToDTO(t, accountId));
    }

    /**
     * Validations métier
     */
    private void validateTransferRequest(TransferRequest request) {
        if (request.getFromAccountId().toString().equals(request.getToAccountNumber())) {
            throw new InvalidTransferException("Cannot transfer to the same account");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransferException("Amount must be greater than zero");
        }

        if (request.getAmount().compareTo(new BigDecimal("10000")) > 0) {
            throw new InvalidTransferException("Transfer amount exceeds maximum limit of 10000 EUR");
        }
    }

    /**
     * Génère une référence unique pour la transaction
     */
    private String generateReference() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Génère un ID de référence pour lier les 2 transactions d'un virement
     */
    private String generateTransferReferenceId() {
        return "TRF-" + UUID.randomUUID().toString().substring(0, 13);
    }

    /**
     * Masque un numéro de compte pour la description
     * Ex: FR7612345678901234567890 → FR76****7890
     */
    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 8) {
            return accountNumber;
        }
        String prefix = accountNumber.substring(0, 4);
        String suffix = accountNumber.substring(accountNumber.length() - 4);
        return prefix + "****" + suffix;
    }

    /**
     * Publie l'événement de transaction sur Kafka
     */
    private void publishTransactionEvent(Transaction transaction, Long userId) {
        TransactionEvent event = TransactionEvent.builder()
                .transactionId(transaction.getId())
                .fromAccountId(transaction.getFromAccountId())
                .toAccountId(transaction.getToAccountId())
                .userId(userId)
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .type(transaction.getType().name())
                .status(transaction.getStatus().name())
                .description(transaction.getDescription())
                .timestamp(LocalDateTime.now())
                .build();

        kafkaProducerService.publishTransactionEvent(event);
    }

    /**
     * ===== MAPPER SIMPLIFIÉ =====
     * Plus besoin de logique complexe car les transactions ont déjà le bon type !
     */
    private TransactionDTO mapToDTO(Transaction transaction, Long currentAccountId) {
        // Pour les virements, on filtre pour ne montrer que la transaction pertinente
        Transaction.TransactionType displayType = transaction.getType();
        
        // Si c'est un TRANSFER_OUT et qu'on regarde depuis le compte récepteur, ne pas afficher
        // (cette logique est gérée par la requête qui récupère les bonnes transactions)
        
        // Si c'est un ancien virement avec type TRANSFER (legacy), convertir
        if (transaction.getType() == Transaction.TransactionType.TRANSFER) {
            if (currentAccountId.equals(transaction.getFromAccountId())) {
                displayType = Transaction.TransactionType.TRANSFER_OUT;
            } else if (currentAccountId.equals(transaction.getToAccountId())) {
                displayType = Transaction.TransactionType.TRANSFER_IN;
            }
        }

        return TransactionDTO.builder()
                .id(transaction.getId())
                .fromAccountId(transaction.getFromAccountId())
                .toAccountId(transaction.getToAccountId())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .type(displayType)
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .reference(transaction.getReference())
                .createdAt(transaction.getCreatedAt())
                .completedAt(transaction.getCompletedAt())
                .build();
    }
}