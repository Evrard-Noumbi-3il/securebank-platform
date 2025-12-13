package com.securebank.account.service;

import com.securebank.account.dto.TransactionDTO;
import com.securebank.account.dto.TransferRequest;
import com.securebank.account.exception.AccountNotFoundException;
import com.securebank.account.exception.InsufficientBalanceException;
import com.securebank.account.exception.InvalidTransferException;
import com.securebank.account.model.Account;
import com.securebank.account.model.Transaction;
import com.securebank.account.repository.AccountRepository;
import com.securebank.account.repository.TransactionRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    // Supposons que ce service est mocké pour ne pas vraiment envoyer à Kafka pendant le test unitaire
    @Mock
    private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private TransactionService transactionService;

    private Account fromAccount;
    private Account toAccount;
    private TransferRequest transferRequest;

    @BeforeEach
    void setUp() {
        fromAccount = Account.builder()
                .id(1L)
                .userId(100L)
                .accountNumber("FR7612345678901234567890123")
                .accountType(Account.AccountType.CHECKING)
                .balance(new BigDecimal("1000.00"))
                .currency("EUR")
                .status(Account.AccountStatus.ACTIVE)
                .build();

        toAccount = Account.builder()
                .id(2L)
                .userId(200L)
                .accountNumber("FR7698765432109876543210987")
                .accountType(Account.AccountType.CHECKING)
                .balance(new BigDecimal("500.00"))
                .currency("EUR")
                .status(Account.AccountStatus.ACTIVE)
                .build();

        // Requête de transfert standard
        transferRequest = new TransferRequest(1L, 2L, new BigDecimal("100.00"), "Test transfer");
    }

    @Test
    @DisplayName("Should successfully transfer money between accounts")
    void testSuccessfulTransfer() {
        // Given
        // Simuler la récupération des comptes par ID avec un verrou (findByIdWithLock)
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));

        // Simuler l'enregistrement de la transaction et lui attribuer un ID
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setId(1L);
            return t;
        });
        
        // Simuler l'enregistrement des comptes (retourne l'objet Account modifié)
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        TransactionDTO result = transactionService.transfer(100L, transferRequest);

        // Then
        assertNotNull(result);
        assertEquals(Transaction.TransactionStatus.COMPLETED, result.getStatus());
        assertEquals(new BigDecimal("100.00"), result.getAmount());
        
        // Vérifier l'état des comptes après la mise à jour par le service
        assertEquals(0, new BigDecimal("900.00").compareTo(fromAccount.getBalance()), "Source account balance should be 900.00");
        assertEquals(0, new BigDecimal("600.00").compareTo(toAccount.getBalance()), "Destination account balance should be 600.00");
        
        // Vérifier que les interactions avec les mocks se sont produites
        verify(accountRepository, times(2)).save(any(Account.class));
        verify(transactionRepository, times(2)).save(any(Transaction.class));
        verify(kafkaProducerService, times(1)).publishTransactionEvent(any());
    }

    @Test
    @DisplayName("Should throw exception when source account not found")
    void testTransferWithAccountNotFound() {
        // Given
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(AccountNotFoundException.class, () -> {
            transactionService.transfer(100L, transferRequest);
        });
        
        // S'assurer qu'aucune sauvegarde n'a été tentée
        verify(transactionRepository, never()).save(any());
        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when insufficient balance")
    void testTransferWithInsufficientBalance() {
        // Given
        fromAccount.setBalance(new BigDecimal("50.00")); // Solde insuffisant (50.00 < 100.00)
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));

        // When & Then
        assertThrows(InsufficientBalanceException.class, () -> {
            transactionService.transfer(100L, transferRequest);
        });
        
        // S'assurer qu'aucune sauvegarde n'a été tentée
        verify(transactionRepository, never()).save(any());
        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when transferring to same account")
    void testTransferToSameAccount() {
        // Given
        TransferRequest sameAccountRequest = new TransferRequest(1L, 1L, new BigDecimal("100.00"), "Invalid");

        // When & Then
        assertThrows(InvalidTransferException.class, () -> {
            transactionService.transfer(100L, sameAccountRequest);
        });
    }

    @Test
    @DisplayName("Should throw exception when user not authorized (does not own source account)")
    void testTransferUnauthorizedUser() {
        // Given
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));

        // When & Then - User 999 ne possède pas le compte (fromAccount.userId est 100L)
        assertThrows(InvalidTransferException.class, () -> {
            transactionService.transfer(999L, transferRequest);
        });
    }

    @Test
    @DisplayName("Should throw exception when source account is suspended")
    void testTransferWithSuspendedAccount() {
        // Given
        fromAccount.setStatus(Account.AccountStatus.SUSPENDED);
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));

        // When & Then
        assertThrows(InvalidTransferException.class, () -> {
            transactionService.transfer(100L, transferRequest);
        });
        
        verify(transactionRepository, never()).save(any());
    }
    
    // Test précédemment commenté, ajouté pour la complétude du service
    @Test
    @DisplayName("Should throw exception when amount is zero or negative")
    void testTransferWithInvalidAmount() {
        // Given
        TransferRequest zeroAmountRequest = new TransferRequest(1L, 2L, new BigDecimal("0.00"), "Invalid");
        
        // When & Then
        assertThrows(InvalidTransferException.class, () -> {
            transactionService.transfer(100L, zeroAmountRequest);
        });
        
        // Given
        TransferRequest negativeAmountRequest = new TransferRequest(1L, 2L, new BigDecimal("-10.00"), "Invalid");
        
        // When & Then
        assertThrows(InvalidTransferException.class, () -> {
            transactionService.transfer(100L, negativeAmountRequest);
        });
    }

}