package com.securebank.payment.controller;

import com.stripe.model.Event;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        log.info("Received Stripe webhook");

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            log.info("Webhook event type: {}", event.getType());

            // Gérer les différents types d'événements
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentIntentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentIntentFailed(event);
                    break;
                default:
                    log.info("Unhandled event type: {}", event.getType());
            }

            return ResponseEntity.ok("Webhook processed");

        } catch (Exception e) {
            log.error("Webhook error", e);
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        log.info("Payment intent succeeded: {}", event.getId());
        // TODO: Mettre à jour le statut du paiement dans la DB
    }

    private void handlePaymentIntentFailed(Event event) {
        log.info("Payment intent failed: {}", event.getId());
        // TODO: Mettre à jour le statut du paiement dans la DB
    }
}