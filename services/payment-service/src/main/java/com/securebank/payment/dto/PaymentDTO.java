package com.securebank.payment.dto;

import com.securebank.payment.model.Payment.PaymentMethod;
import com.securebank.payment.model.Payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Long userId;
    private Long accountId;
    private String stripePaymentId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String description;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}