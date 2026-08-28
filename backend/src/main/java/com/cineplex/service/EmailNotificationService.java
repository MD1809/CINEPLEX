package com.cineplex.service;

public interface EmailNotificationService {
    void sendBookingConfirmationEmail(Long bookingId);
}
