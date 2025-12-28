package com.securebank.account.controller;

import lombok.extern.slf4j.Slf4j;
import com.securebank.account.dto.AccountDTO;
import com.securebank.account.dto.TransactionRequest;
import com.securebank.account.dto.CreateAccountRequest;
import com.securebank.account.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Account management APIs")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Create a new account", description = "Create a new bank account for the authenticated user")
    public ResponseEntity<AccountDTO> createAccount(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateAccountRequest request) {
        AccountDTO account = accountService.createAccount(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @GetMapping
    @Operation(summary = "Get all user accounts", description = "Retrieve all accounts for the authenticated user")
    public ResponseEntity<List<AccountDTO>> getUserAccounts(
            @RequestHeader("X-User-Id") Long userId) {
        List<AccountDTO> accounts = accountService.getUserAccounts(userId);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get account by ID", description = "Retrieve a specific account by its ID")
    public ResponseEntity<AccountDTO> getAccountById(
            @PathVariable Long accountId,
            @RequestHeader("X-User-Id") Long userId) {
        AccountDTO account = accountService.getAccountById(accountId, userId);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/{accountId}/balance")
    @Operation(summary = "Get account balance", description = "Retrieve the balance of a specific account")
    public ResponseEntity<BigDecimal> getAccountBalance(
            @PathVariable Long accountId,
            @RequestHeader("X-User-Id") Long userId) {
        BigDecimal balance = accountService.getAccountBalance(accountId, userId);
        return ResponseEntity.ok(balance);
    }

    @PatchMapping("/{accountId}/suspend")
    @Operation(summary = "Suspend account", description = "Suspend a specific account")
    public ResponseEntity<AccountDTO> suspendAccount(
            @PathVariable Long accountId,
            @RequestHeader("X-User-Id") Long userId) {
        AccountDTO account = accountService.suspendAccount(accountId, userId);
        return ResponseEntity.ok(account);
    }

    @PatchMapping("/{accountId}/activate")
    @Operation(summary = "Activate account", description = "Activate a suspended account")
    public ResponseEntity<AccountDTO> activateAccount(
            @PathVariable Long accountId,
            @RequestHeader("X-User-Id") Long userId) {
        AccountDTO account = accountService.activateAccount(accountId, userId);
        return ResponseEntity.ok(account);
    }
    
    @PostMapping("/{accountId}/deposit")
    public ResponseEntity<AccountDTO> deposit(
            @PathVariable Long accountId,
            @RequestBody TransactionRequest request) {
        
        log.info("Dépôt sur le compte ID {}: {} EUR", accountId, request.getAmount());
        AccountDTO updatedAccount = accountService.deposit(accountId, request.getAmount(), request.getDescription());
        return ResponseEntity.ok(updatedAccount);
    }
}