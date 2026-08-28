package com.cineplex.service;

public interface QrCodeService {
    byte[] generateQrCodeImage(String text, int width, int height);
    String generateQrCodeBase64(String text, int width, int height);
}
