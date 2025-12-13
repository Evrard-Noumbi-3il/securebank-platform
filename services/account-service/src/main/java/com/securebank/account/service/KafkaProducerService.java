package com.securebank.account.service;

import com.securebank.contracts.dto.TransactionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @Value("${kafka.topics.transaction-events}")
    private String transactionEventsTopic;

    /**
     * Publie un événement de transaction sur Kafka
     */
    public void publishTransactionEvent(TransactionEvent event) {
        log.info("Publishing transaction event: {}", event.getTransactionId());

        CompletableFuture<SendResult<String, TransactionEvent>> future = 
                kafkaTemplate.send(transactionEventsTopic, event.getTransactionId().toString(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Transaction event published successfully: transactionId={}, offset={}", 
                        event.getTransactionId(), 
                        result.getRecordMetadata().offset());
            } else {
                log.error("Failed to publish transaction event: transactionId={}", 
                        event.getTransactionId(), ex);
            }
        });
    }
}