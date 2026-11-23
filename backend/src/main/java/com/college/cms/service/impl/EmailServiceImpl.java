package com.college.cms.service.impl;

import com.college.cms.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:placeholder}")
    private String mailUsername;

    @Value("${spring.mail.host:localhost}")
    private String mailHost;

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        // Always log to backend console per Step Fix 3
        System.out.println("DEV RESET LINK: " + resetLink);
        logger.info("DEV RESET LINK: {}", resetLink);

        // If SMTP credentials are not default placeholder, attempt to send real email
        if (mailSender != null && !mailUsername.equals("placeholder") && !mailHost.equals("localhost")) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(mailUsername);
                message.setTo(toEmail);
                message.setSubject("Sunrise Institute of Technology — Password Reset Request");
                message.setText(
                    "Dear Student / Faculty / Staff Member,\n\n" +
                    "We received a request to reset the password for your Sunrise Institute College Management System account.\n\n" +
                    "Click the link below to set a new password:\n" +
                    resetLink + "\n\n" +
                    "This link is valid for 30 minutes and can only be used once.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "IT & Academic Affairs\nSunrise Institute of Technology"
                );
                mailSender.send(message);
                logger.info("Password reset email sent to {}", toEmail);
            } catch (Exception e) {
                logger.warn("Could not dispatch SMTP email to {} (falling back to console dev link): {}", toEmail, e.getMessage());
            }
        }
    }
}
