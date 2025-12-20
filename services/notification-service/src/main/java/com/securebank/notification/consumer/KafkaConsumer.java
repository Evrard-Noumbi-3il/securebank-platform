package com.securebank.notification.consumer;

import com.securebank.notification.dto.TransactionEvent;
import com.securebank.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {

    private final EmailService emailService;

    @KafkaListener(topics = "transaction-events", groupId = "notification-service-group")
    public void consumeTransactionEvent(TransactionEvent event) {
        log.info("Received transaction event: transactionId={}, userId={}, amount={}", 
                event.getTransactionId(), event.getUserId(), event.getAmount());

        try {
            // Envoyer notification email
            emailService.sendTransactionNotification(event);
            log.info("Transaction notification sent successfully");
        } catch (Exception e) {
            log.error("Error sending transaction notification", e);
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "notification-service-group")
    public void consumePaymentEvent(String event) {
        log.info("Received payment event: {}", event);
        
        try {
            // TODO: Parser et envoyer notification
            log.info("Payment notification sent successfully");
        } catch (Exception e) {
            log.error("Error sending payment notification", e);
        }
    }
}