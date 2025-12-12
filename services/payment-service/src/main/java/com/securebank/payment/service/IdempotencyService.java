package com.securebank.payment.service;

import com.securebank.payment.model.IdempotencyRecord;
import com.securebank.payment.repository.IdempotencyRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyService {

    private final IdempotencyRecordRepository idempotencyRecordRepository;

    /**
     * Vérifier si la clé d'idempotence existe
     */
    public Optional<IdempotencyRecord> checkIdempotency(String idempotencyKey) {
        return idempotencyRecordRepository.findByIdempotencyKey(idempotencyKey);
    }

    /**
     * Sauvegarder un enregistrement d'idempotence
     */
    @Transactional
    public void saveIdempotencyRecord(String idempotencyKey, Long paymentId, String response) {
        IdempotencyRecord record = IdempotencyRecord.builder()
                .idempotencyKey(idempotencyKey)
                .paymentId(paymentId)
                .response(response)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        idempotencyRecordRepository.save(record);
        log.info("Idempotency record saved: key={}, paymentId={}", idempotencyKey, paymentId);
    }

    /**
     * Nettoyer les enregistrements expirés (tous les jours à minuit)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupExpiredRecords() {
        log.info("Cleaning up expired idempotency records");
        idempotencyRecordRepository.deleteExpiredRecords(LocalDateTime.now());
    }
}