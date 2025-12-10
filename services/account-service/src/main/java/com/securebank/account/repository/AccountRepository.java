package com.securebank.account.repository;

import com.securebank.account.model.Account;
import com.securebank.account.model.Account.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    List<Account> findByUserId(Long userId);
    
    Optional<Account> findByAccountNumber(String accountNumber);
    
    Boolean existsByAccountNumber(String accountNumber);
    
    List<Account> findByUserIdAndStatus(Long userId, AccountStatus status);
    
    // Lock pessimiste pour éviter les problèmes de concurrence lors des transferts
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdWithLock(Long id);
}