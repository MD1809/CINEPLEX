package com.cineplex.service;

import com.cineplex.service.impl.QrCodeServiceImpl;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.awt.image.BufferedImage;

import static org.assertj.core.api.Assertions.assertThat;

class QrCodeServiceTest {

    private QrCodeService qrCodeService;

    @BeforeEach
    void setUp() {
        qrCodeService = new QrCodeServiceImpl();
    }

    @Test
    @DisplayName("Generate QR Code Image bytes and verify decoding matches input token")
    void testGenerateAndDecodeQrCode() throws Exception {
        String testToken = "TICKET-TOKEN-UUID-12345-ABCDE";
        byte[] qrBytes = qrCodeService.generateQrCodeImage(testToken, 250, 250);

        assertThat(qrBytes).isNotNull();
        assertThat(qrBytes.length).isGreaterThan(0);

        // Decode back using ZXing to verify roundtrip accuracy
        ByteArrayInputStream bais = new ByteArrayInputStream(qrBytes);
        BufferedImage bufferedImage = ImageIO.read(bais);
        assertThat(bufferedImage).isNotNull();

        BufferedImageLuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result decodedResult = new MultiFormatReader().decode(bitmap);
        assertThat(decodedResult.getText()).isEqualTo(testToken);
    }

    @Test
    @DisplayName("Generate Base64 QR Code string with correct data URI scheme")
    void testGenerateBase64QrCode() {
        String testToken = "CPX-SAMPLE-TOKEN-99999";
        String base64Uri = qrCodeService.generateQrCodeBase64(testToken, 200, 200);

        assertThat(base64Uri).isNotNull();
        assertThat(base64Uri).startsWith("data:image/png;base64,");
        assertThat(base64Uri.length()).isGreaterThan(50);
    }
}
