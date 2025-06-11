package com.casual.rent.common;

/**
 * 分类状态枚举
 */
public enum CategoryStatus {
    
    DISABLED(0, "禁用"),
    ENABLED(1, "启用");
    
    private final int code;
    private final String description;
    
    CategoryStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public int getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    public static CategoryStatus fromCode(int code) {
        for (CategoryStatus status : CategoryStatus.values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown category status code: " + code);
    }
} 