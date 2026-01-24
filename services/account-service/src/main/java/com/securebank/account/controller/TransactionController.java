package com.securebank.account.controller;

import com.securebank.account.dto.TransactionDTO;
import com.securebank.account.dto.TransferRequest;
import com.securebank.account.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@Tag(name = "Transactions", description = "Gestion des transactions bancaires (Virements, Historiques)")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    @Operation(summary = "Effectuer un virement", description = "Transférer des fonds entre deux comptes. Génère un type TRANSFER_OUT pour l'émetteur.")
    public ResponseEntity<TransactionDTO> transfer(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TransferRequest request) {
        TransactionDTO transaction = transactionService.transfer(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping
    @Operation(summary = "Historique global", description = "Récupère toutes les transactions de l'utilisateur avec distinction contextuelle (IN/OUT)")
    public ResponseEntity<List<TransactionDTO>> getUserTransactions(
            @RequestHeader("X-User-Id") Long userId) {
        List<TransactionDTO> transactions = transactionService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/paginated")
    @Operation(summary = "Historique global paginé")
    public ResponseEntity<Page<TransactionDTO>> getUserTransactionsPaginated(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionDTO> transactions = transactionService.getUserTransactionsPaginated(userId, pageable);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/account/{accountId}")
    @Operation(summary = "Historique par compte", description = "Récupère les transactions d'un compte spécifique. Les montants sortants apparaissent en TRANSFER_OUT.")
    public ResponseEntity<List<TransactionDTO>> getAccountTransactions(
            @Parameter(description = "ID technique du compte") @PathVariable Long accountId,
            @RequestHeader("X-User-Id") Long userId) {
        List<TransactionDTO> transactions = transactionService.getAccountTransactions(accountId, userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/account/{accountId}/paginated")
    @Operation(summary = "Historique par compte paginé")
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