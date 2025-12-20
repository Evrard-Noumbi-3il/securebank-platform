package com.securebank.account.dto;

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
public class TransactionEvent {
    
    private Long transactionId;
    private Long fromAccountId;
    private Long toAccountId;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private String type;
    private String status;
    private String description;
    private LocalDateTime timestamp;
    private String userEmail;
}