package com.securebank.account.dto;

import com.securebank.account.model.Account.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {
    
    @NotNull(message = "Account type is required")
    private AccountType accountType;
    
    private String currency = "EUR";
}