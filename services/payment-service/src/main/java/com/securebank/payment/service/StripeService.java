package com.securebank.payment.service;

import com.securebank.payment.config.StripeConfig;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final StripeConfig stripeConfig;

    /**
     * Créer un PaymentIntent Stripe
     */
    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String description) 
            throws StripeException {
        
        log.info("Creating Stripe PaymentIntent: amount={}, currency={}", amount, currency);

        // Stripe attend le montant en centimes
        long amountInCents = amount.multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .setDescription(description)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        log.info("PaymentIntent created: id={}, status={}", 
                paymentIntent.getId(), paymentIntent.getStatus());

        return paymentIntent;
    }

    /**
     * Confirmer un PaymentIntent
     */
    public PaymentIntent confirmPaymentIntent(String paymentIntentId) throws StripeException {
        log.info("Confirming PaymentIntent: {}", paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        paymentIntent = paymentIntent.confirm();

        log.info("PaymentIntent confirmed: id={}, status={}", 
                paymentIntent.getId(), paymentIntent.getStatus());

        return paymentIntent;
    }

    /**
     * Récupérer un PaymentIntent
     */
    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Annuler un PaymentIntent
     */
    public PaymentIntent cancelPaymentIntent(String paymentIntentId) throws StripeException {
        log.info("Cancelling PaymentIntent: {}", paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        paymentIntent = paymentIntent.cancel();

        log.info("PaymentIntent cancelled: id={}", paymentIntent.getId());

        return paymentIntent;
    }
}