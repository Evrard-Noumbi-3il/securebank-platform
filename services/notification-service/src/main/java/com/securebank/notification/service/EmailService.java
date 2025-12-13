package com.securebank.notification.service;

import com.securebank.contracts.dto.TransactionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String from;

    /**
     * Envoyer notification de transaction
     */
    @Async
    public void sendTransactionNotification(TransactionEvent event) {
        log.info("Sending transaction notification email: transactionId={}", event.getTransactionId());

        try {
            // TODO: Récupérer l'email de l'utilisateur depuis Auth Service
            String toEmail = "user@example.com"; // Placeholder

            String subject = String.format("Transaction %s - %.2f %s", 
                    event.getType(), event.getAmount(), event.getCurrency());

            String htmlContent = buildTransactionEmailContent(event);

            sendHtmlEmail(toEmail, subject, htmlContent);

            log.info("Transaction notification email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Error sending transaction notification email", e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Construire le contenu HTML de l'email
     */
    private String buildTransactionEmailContent(TransactionEvent event) {
        Context context = new Context();
        context.setVariable("transactionId", event.getTransactionId());
        context.setVariable("type", event.getType());
        context.setVariable("amount", event.getAmount());
        context.setVariable("currency", event.getCurrency());
        context.setVariable("status", event.getStatus());
        context.setVariable("description", event.getDescription());
        context.setVariable("timestamp", event.getTimestamp().format(
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

        return templateEngine.process("transaction-email", context);
    }

    /**
     * Envoyer un email HTML
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) 
            throws MessagingException {
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}