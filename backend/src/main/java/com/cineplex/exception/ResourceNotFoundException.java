package com.cineplex.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(HttpStatus.NOT_FOUND, String.format("%s không tồn tại với %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
