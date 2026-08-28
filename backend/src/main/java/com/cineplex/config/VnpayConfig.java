package com.cineplex.config;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Configuration
@ConfigurationProperties(prefix = "app.vnpay")
@Getter
@Setter
@Slf4j
public class VnpayConfig {

    private String tmnCode;
    private String hashSecret;
    private String url;
    private String returnUrl;

    public static final String VNP_VERSION = "2.1.0";
    public static final String VNP_COMMAND = "pay";
    public static final String VNP_CURR_CODE = "VND";
    public static final String VNP_LOCALE = "vn";
    public static final String VNP_ORDER_TYPE = "other";

    /**
     * Compute HMAC-SHA512 hash of given data with key
     */
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("Error generating HMAC SHA512 signature: {}", ex.getMessage());
            return "";
        }
    }

    /**
     * Build hash data string from sorted parameters map
     */
    public static String hashAllFields(Map<String, String> fields, String hashSecret) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        List<String> hashDataList = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.trim().isEmpty()) {
                hashDataList.add(fieldName + "=" + URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
        }
        String hashData = String.join("&", hashDataList);
        return hmacSHA512(hashSecret, hashData);
    }

    /**
     * Build query URL parameter string from map
     */
    public static String buildQueryUrl(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        List<String> queryList = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.trim().isEmpty()) {
                queryList.add(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII) + "=" + URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
            }
        }
        return String.join("&", queryList);
    }

    /**
     * Format date to VNPAY standard 'yyyyMMddHHmmss'
     */
    public static String formatDate(Calendar calendar) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        return formatter.format(calendar.getTime());
    }
}
