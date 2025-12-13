package com.securebank.account.service;

import com.securebank.account.dto.TransactionDTO;
import com.securebank.contracts.dto.TransactionEvent;
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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
     * Effectue un virement entre deux comptes
     * IMPORTANT : Utilise des locks pessimistes pour éviter les problèmes de concurrence
     */
    @Transactional
    public TransactionDTO transfer(Long userId, TransferRequest request) {
        log.info("Processing transfer: from={}, to={}, amount={}", 
                request.getFromAccountId(), request.getToAccountId(), request.getAmount());

        // Validations métier
        validateTransferRequest(request);

        // Récupérer les comptes avec locks pessimistes
        Account fromAccount = accountRepository.findByIdWithLock(request.getFromAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Source account not found: " + request.getFromAccountId()));

        Account toAccount = accountRepository.findByIdWithLock(request.getToAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Destination account not found: " + request.getToAccountId()));

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

        // Créer la transaction
        String reference = generateReference();
        Transaction transaction = Transaction.builder()
                .fromAccountId(fromAccount.getId())
                .toAccountId(toAccount.getId())
                .amount(request.getAmount())
                .currency(fromAccount.getCurrency())
                .type(Transaction.TransactionType.TRANSFER)
                .status(Transaction.TransactionStatus.PENDING)
                .description(request.getDescription())
                .reference(reference)
                .build();

        transaction = transactionRepository.save(transaction);

        try {
            // Effectuer le transfert
            fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
            toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));

            accountRepository.save(fromAccount);
            accountRepository.save(toAccount);

            // Marquer la transaction comme complétée
            transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
            transaction.setCompletedAt(LocalDateTime.now());
            transaction = transactionRepository.save(transaction);

            log.info("Transfer completed successfully: transactionId={}, reference={}", 
                    transaction.getId(), reference);

            // Publier l'événement sur Kafka
            publishTransactionEvent(transaction, userId);

            return mapToDTO(transaction);

        } catch (Exception e) {
            // En cas d'erreur, marquer la transaction comme échouée
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transactionRepository.save(transaction);

            log.error("Transfer failed: transactionId={}", transaction.getId(), e);
            throw new RuntimeException("Transfer failed: " + e.getMessage(), e);
        }
    }

    /**
     * Récupérer l'historique des transactions d'un compte
     */
    public List<TransactionDTO> getAccountTransactions(Long accountId, Long userId) {
        log.info("Fetching transactions for account: {}", accountId);

        // Vérifier que le compte appartient à l'utilisateur
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new InvalidTransferException("Unauthorized: Account does not belong to user");
        }

        List<Transaction> transactions = transactionRepository
                .findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(accountId, accountId);

        return transactions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer l'historique paginé
     */
    public Page<TransactionDTO> getAccountTransactionsPaginated(Long accountId, Long userId, Pageable pageable) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new InvalidTransferException("Unauthorized: Account does not belong to user");
        }

        return transactionRepository
                .findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(accountId, accountId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Validations métier
     */
    private void validateTransferRequest(TransferRequest request) {
        if (request.getFromAccountId().equals(request.getToAccountId())) {
            throw new InvalidTransferException("Cannot transfer to the same account");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransferException("Amount must be greater than zero");
        }

        // Limite de transfert (exemple: 10000 EUR)
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
     * Mapper Transaction → TransactionDTO
     */
    private TransactionDTO mapToDTO(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .fromAccountId(transaction.getFromAccountId())
                .toAccountId(transaction.getToAccountId())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .reference(transaction.getReference())
                .createdAt(transaction.getCreatedAt())
                .completedAt(transaction.getCompletedAt())
                .build();
    }
}