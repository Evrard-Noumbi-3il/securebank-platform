package com.securebank.account.service;

import com.securebank.account.dto.AccountDTO;
import com.securebank.account.dto.CreateAccountRequest;
import com.securebank.account.exception.AccountAlreadyExistsException;
import com.securebank.account.exception.AccountNotFoundException;
import com.securebank.account.model.Account;
import com.securebank.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private static final Random RANDOM = new Random();

    /**
     * Créer un nouveau compte bancaire
     */
    @Transactional
    @CacheEvict(value = "accounts", key = "#userId")
    public AccountDTO createAccount(Long userId, CreateAccountRequest request) {
        log.info("Creating new account for user: {}, type: {}", userId, request.getAccountType());

        // Générer un numéro de compte unique
        String accountNumber = generateAccountNumber();
        
        // Vérifier que le numéro n'existe pas déjà (très peu probable)
        while (accountRepository.existsByAccountNumber(accountNumber)) {
            accountNumber = generateAccountNumber();
        }

        // Créer le compte
        Account account = Account.builder()
                .userId(userId)
                .accountNumber(accountNumber)
                .accountType(request.getAccountType())
                .balance(BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "EUR")
                .status(Account.AccountStatus.ACTIVE)
                .build();

        account = accountRepository.save(account);

        log.info("Account created successfully: accountNumber={}, userId={}", 
                accountNumber, userId);

        return mapToDTO(account);
    }

    /**
     * Récupérer tous les comptes d'un utilisateur
     */
    @Cacheable(value = "accounts", key = "#userId")
    public List<AccountDTO> getUserAccounts(Long userId) {
        log.info("Fetching accounts for user: {}", userId);

        List<Account> accounts = accountRepository.findByUserId(userId);

        return accounts.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer un compte par son ID
     */
    public AccountDTO getAccountById(Long accountId, Long userId) {
        log.info("Fetching account: id={}, userId={}", accountId, userId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        // Vérifier que le compte appartient à l'utilisateur
        if (!account.getUserId().equals(userId)) {
            throw new AccountNotFoundException("Account not found or unauthorized");
        }

        return mapToDTO(account);
    }

    /**
     * Récupérer le solde d'un compte
     */
    public BigDecimal getAccountBalance(Long accountId, Long userId) {
        log.info("Fetching balance: accountId={}, userId={}", accountId, userId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new AccountNotFoundException("Account not found or unauthorized");
        }

        return account.getBalance();
    }

    /**
     * Suspendre un compte
     */
    @Transactional
    @CacheEvict(value = "accounts", key = "#userId")
    public AccountDTO suspendAccount(Long accountId, Long userId) {
        log.info("Suspending account: id={}, userId={}", accountId, userId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new AccountNotFoundException("Account not found or unauthorized");
        }

        account.setStatus(Account.AccountStatus.SUSPENDED);
        account = accountRepository.save(account);

        log.info("Account suspended: accountNumber={}", account.getAccountNumber());

        return mapToDTO(account);
    }

    /**
     * Réactiver un compte
     */
    @Transactional
    @CacheEvict(value = "accounts", key = "#userId")
    public AccountDTO activateAccount(Long accountId, Long userId) {
        log.info("Activating account: id={}, userId={}", accountId, userId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new AccountNotFoundException("Account not found or unauthorized");
        }

        account.setStatus(Account.AccountStatus.ACTIVE);
        account = accountRepository.save(account);

        log.info("Account activated: accountNumber={}", account.getAccountNumber());

        return mapToDTO(account);
    }

    /**
     * Générer un numéro de compte au format IBAN FR
     * Format: FR76 + 10 chiffres bancaires + 11 chiffres compte + 2 clé
     */
    private String generateAccountNumber() {
        StringBuilder accountNumber = new StringBuilder("FR76");
        
        // Code banque (5 chiffres)
        accountNumber.append(String.format("%05d", RANDOM.nextInt(100000)));
        
        // Code guichet (5 chiffres)
        accountNumber.append(String.format("%05d", RANDOM.nextInt(100000)));
        
        // Numéro de compte (11 chiffres)
        accountNumber.append(String.format("%011d", RANDOM.nextInt(1000000000)));
        
        // Clé RIB (2 chiffres)
        accountNumber.append(String.format("%02d", RANDOM.nextInt(100)));
        
        return accountNumber.toString();
    }

    /**
     * Mapper Account → AccountDTO
     */
    private AccountDTO mapToDTO(Account account) {
        return AccountDTO.builder()
                .id(account.getId())
                .userId(account.getUserId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}