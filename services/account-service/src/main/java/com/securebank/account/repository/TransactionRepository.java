package com.securebank.account.repository;

import com.securebank.account.model.Transaction;
import com.securebank.account.model.Transaction.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
	List<Transaction> findByFromAccountIdOrToAccountId(Long fromAccountId, Long toAccountId);
	
    List<Transaction> findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(
            Long fromAccountId, Long toAccountId);
    
    Page<Transaction> findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(
            Long fromAccountId, Long toAccountId, Pageable pageable);
    
    List<Transaction> findByStatus(TransactionStatus status);
    
    List<Transaction> findByReferenceId(String referenceId);
    
    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.fromAccountId = :accountId OR t.toAccountId = :accountId) " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findAccountTransactionsBetweenDates(
            Long accountId, LocalDateTime startDate, LocalDateTime endDate);
    
    Boolean existsByReference(String reference);
}