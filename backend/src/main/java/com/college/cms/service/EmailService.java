package com.college.cms.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String resetLink);
}
