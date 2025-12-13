package com.securebank.account.service;

import com.securebank.account.dto.AccountDTO;
import com.securebank.account.dto.CreateAccountRequest;
import com.securebank.account.exception.AccountNotFoundException;
import com.securebank.account.model.Account;
import com.securebank.account.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private Account account;
    private CreateAccountRequest createRequest;

    @BeforeEach
    void setUp() {
        account = Account.builder()
                .id(1L)
                .userId(100L)
                .accountNumber("FR7612345678901234567890123")
                .accountType(Account.AccountType.CHECKING)
                .balance(new BigDecimal("1000.00"))
                .currency("EUR")
                .status(Account.AccountStatus.ACTIVE)
                .build();

        createRequest = new CreateAccountRequest(Account.AccountType.CHECKING, "EUR");
    }

    @Test
    @DisplayName("Should create account successfully")
    void testCreateAccount() {
        // Given
        when(accountRepository.existsByAccountNumber(any())).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenReturn(account);

        // When
        AccountDTO result = accountService.createAccount(100L, createRequest);

        // Then
        assertNotNull(result);
        assertEquals(100L, result.getUserId());
        assertEquals(Account.AccountType.CHECKING, result.getAccountType());
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    @DisplayName("Should get user accounts successfully")
    void testGetUserAccounts() {
        // Given
        Account account2 = Account.builder()
                .id(2L)
                .userId(100L)
                .accountNumber("FR7698765432109876543210987")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("5000.00"))
                .currency("EUR")
                .status(Account.AccountStatus.ACTIVE)
                .build();

        when(accountRepository.findByUserId(100L)).thenReturn(Arrays.asList(account, account2));

        // When
        List<AccountDTO> results = accountService.getUserAccounts(100L);

        // Then
        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(Account.AccountType.CHECKING, results.get(0).getAccountType());
        assertEquals(Account.AccountType.SAVINGS, results.get(1).getAccountType());
    }

    @Test
    @DisplayName("Should get account by ID successfully")
    void testGetAccountById() {
        // Given
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        // When
        AccountDTO result = accountService.getAccountById(1L, 100L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("FR7612345678901234567890123", result.getAccountNumber());
    }

    @Test
    @DisplayName("Should throw exception when account not found")
    void testGetAccountByIdNotFound() {
        // Given
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(AccountNotFoundException.class, () -> {
            accountService.getAccountById(999L, 100L);
        });
    }

    @Test
    @DisplayName("Should throw exception when user unauthorized")
    void testGetAccountByIdUnauthorized() {
        // Given
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        // When & Then - User 999 ne possède pas le compte
        assertThrows(AccountNotFoundException.class, () -> {
            accountService.getAccountById(1L, 999L);
        });
    }

    @Test
    @DisplayName("Should suspend account successfully")
    void testSuspendAccount() {
        // Given
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        AccountDTO result = accountService.suspendAccount(1L, 100L);

        // Then
        assertNotNull(result);
        assertEquals(Account.AccountStatus.SUSPENDED, result.getStatus());
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    @DisplayName("Should activate account successfully")
    void testActivateAccount() {
        // Given
        account.setStatus(Account.AccountStatus.SUSPENDED);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        AccountDTO result = accountService.activateAccount(1L, 100L);

        // Then
        assertNotNull(result);
        assertEquals(Account.AccountStatus.ACTIVE, result.getStatus());
        verify(accountRepository, times(1)).save(any(Account.class));
    }
}