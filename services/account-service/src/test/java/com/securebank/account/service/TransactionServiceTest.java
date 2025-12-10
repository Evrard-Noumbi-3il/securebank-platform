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

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

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

        transferRequest = new TransferRequest(1L, 2L, new BigDecimal("100.00"), "Test transfer");
    }

    @Test
    @DisplayName("Should successfully transfer money between accounts")
    void testSuccessfulTransfer() {
        // Given
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setId(1L);
            return t;
        });
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        TransactionDTO result = transactionService.transfer(100L, transferRequest);

        // Then
        assertNotNull(result);
        assertEquals(Transaction.TransactionStatus.COMPLETED, result.getStatus());
        assertEquals(new BigDecimal("100.00"), result.getAmount());
        
        // Vérifier que les comptes ont été mis à jour
        verify(accountRepository, times(2)).save(any(Account.class));
        
        // Vérifier que l'événement Kafka a été publié
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
        
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when insufficient balance")
    void testTransferWithInsufficientBalance() {
        // Given
        fromAccount.setBalance(new BigDecimal("50.00")); // Moins que le montant du transfert
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));

        // When & Then
        assertThrows(InsufficientBalanceException.class, () -> {
            transactionService.transfer(100L, transferRequest);
        });
        
        verify(transactionRepository, never()).save(any());
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
    @DisplayName("Should throw exception when user not authorized")
    void testTransferUnauthorizedUser() {
        // Given
        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));

        // When & Then - User 999 ne possède pas le compte
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
    }

//    @Test
//    @DisplayName("Should throw exception when amount exceeds limit")
//    void testTransferExceedsLimit() {
//        // Given
//        TransferRequest largeTransfer = new TransferRequest(1L, 2L, new BigDecimal("15000.00"), "Too large");
//        when(accountRepository.findByIdWithLock(1L)).thenReturn(Optional.of(fromAccount));
//        when(accountRepository.findByIdWithLock(2L)).thenReturn(Optional.of(toAccount));
//
//        // When & Then
//        assertThrows(InvalidTransferException.class, () -> {
//            transactionService.transfer(100L, largeTransfer);
//        });
//    }
}