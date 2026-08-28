package com.cineplex.service;

import com.cineplex.config.VnpayConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

import static org.assertj.core.api.Assertions.assertThat;

class VnpaySignatureTest {

    private final String secretKey = "AXUQCJTYOWWWXMKTRZGFPRMHYGBLWJGF";

    @Test
    @DisplayName("Verify HMAC-SHA512 produces consistent 128-character hex string")
    void testHmacSha512Generation() {
        String data = "vnp_Amount=10000000&vnp_Command=pay&vnp_TmnCode=2QXUI4J4";
        String hash = VnpayConfig.hmacSHA512(secretKey, data);

        assertThat(hash).isNotNull();
        assertThat(hash).hasSize(128); // 64 bytes in hex = 128 characters
        assertThat(hash).matches("^[a-f0-9]{128}$");
    }

    @Test
    @DisplayName("Verify parameter sorting and URL encoding in hashAllFields")
    void testHashAllFieldsSorting() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", "2QXUI4J4");
        params.put("vnp_Amount", "10000000");
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", "CPX-20260828-A8B9");
        params.put("vnp_OrderInfo", "Thanh toan don dat ve CINEPLEX");

        String hash1 = VnpayConfig.hashAllFields(params, secretKey);

        // Re-insert in different order to test deterministic sorting
        Map<String, String> shuffled = new HashMap<>();
        shuffled.put("vnp_OrderInfo", "Thanh toan don dat ve CINEPLEX");
        shuffled.put("vnp_TxnRef", "CPX-20260828-A8B9");
        shuffled.put("vnp_CurrCode", "VND");
        shuffled.put("vnp_Amount", "10000000");
        shuffled.put("vnp_TmnCode", "2QXUI4J4");
        shuffled.put("vnp_Command", "pay");
        shuffled.put("vnp_Version", "2.1.0");

        String hash2 = VnpayConfig.hashAllFields(shuffled, secretKey);

        assertThat(hash1).isEqualTo(hash2);
    }

    @Test
    @DisplayName("Verify date formatting matches VNPAY standard 'yyyyMMddHHmmss'")
    void testDateFormatting() {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cal.set(2026, Calendar.AUGUST, 28, 14, 30, 0);

        String formatted = VnpayConfig.formatDate(cal);
        assertThat(formatted).isEqualTo("20260828143000");
        assertThat(formatted).hasSize(14);
    }
}
