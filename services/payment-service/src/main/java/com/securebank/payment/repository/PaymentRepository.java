package com.securebank.payment.repository;

import com.securebank.payment.model.Payment;
import com.securebank.payment.model.Payment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByStripePaymentId(String stripePaymentId);
    
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<Payment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Payment> findByStatus(PaymentStatus status);
}