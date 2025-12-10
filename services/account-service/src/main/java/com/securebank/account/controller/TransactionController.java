package com.securebank.account.controller;

import com.securebank.account.dto.TransactionDTO;
import com.securebank.account.dto.TransferRequest;
import com.securebank.account.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction management APIs")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    @Operation(summary = "Transfer money", description = "Transfer money between two accounts")
    public ResponseEntity<TransactionDTO> transfer(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TransferRequest request) {
        TransactionDTO transaction = transactionService.transfer(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping("/account/{accountId}")
    @Operation(summary = "Get account transactions", description = "Retrieve all transactions for a specific account")
    public ResponseEntity<List<TransactionDTO>> getAccountTransactions(
            @PathVariable Long accountId,
            @RequestHeader("X-User-Id") Long userId) {
        List<TransactionDTO> transactions = transactionService.getAccountTransactions(accountId, userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/account/{accountId}/paginated")
    @Operation(summary = "Get paginated account transactions", description = "Retrieve paginated transactions for a specific account")
    public ResponseEntity<Page<TransactionDTO>> getAccountTransactionsPaginated(
            @PathVariable Long accountId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionDTO> transactions = transactionService.getAccountTransactionsPaginated(accountId, userId, pageable);
        return ResponseEntity.ok(transactions);
    }
}