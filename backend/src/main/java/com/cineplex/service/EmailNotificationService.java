package com.cineplex.service;

public interface EmailNotificationService {
    void sendBookingConfirmationEmail(Long bookingId);
    void sendPasswordResetEmail(String toEmail, String recipientName);
}
