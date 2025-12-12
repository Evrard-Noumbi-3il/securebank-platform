package com.securebank.payment.controller;

import com.securebank.payment.dto.CreatePaymentRequest;
import com.securebank.payment.dto.PaymentDTO;
import com.securebank.payment.service.PaymentService;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Create payment", description = "Create a new payment with Stripe")
    public ResponseEntity<PaymentDTO> createPayment(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreatePaymentRequest request) {
        PaymentDTO payment = paymentService.createPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @PostMapping("/{paymentId}/confirm")
    @Operation(summary = "Confirm payment", description = "Confirm a pending payment")
    public ResponseEntity<PaymentDTO> confirmPayment(
            @PathVariable Long paymentId,
            @RequestHeader("X-User-Id") Long userId) {
        PaymentDTO payment = paymentService.confirmPayment(paymentId, userId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{paymentId}")
    @Operation(summary = "Get payment", description = "Retrieve a specific payment")
    public ResponseEntity<PaymentDTO> getPayment(
            @PathVariable Long paymentId,
            @RequestHeader("X-User-Id") Long userId) {
        PaymentDTO payment = paymentService.getPayment(paymentId, userId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping
    @Operation(summary = "Get user payments", description = "Retrieve all payments for user")
    public ResponseEntity<List<PaymentDTO>> getUserPayments(
            @RequestHeader("X-User-Id") Long userId) {
        List<PaymentDTO> payments = paymentService.getUserPayments(userId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get paginated payments", description = "Retrieve paginated payments")
    public ResponseEntity<Page<PaymentDTO>> getUserPaymentsPaginated(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentDTO> payments = paymentService.getUserPaymentsPaginated(userId, pageable);
        return ResponseEntity.ok(payments);
    }
}