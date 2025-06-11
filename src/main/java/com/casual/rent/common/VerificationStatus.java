package com.casual.rent.common;

/**
 * 用户/商家 认证状态枚举
 */
public enum VerificationStatus {
    NOT_VERIFIED(-1, "未认证"),
    PENDING(0, "待审核"),
    VERIFIED(1, "已认证"),
    REJECTED(2, "认证拒绝");

    private final Integer code;
    private final String description;

    VerificationStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static VerificationStatus fromCode(Integer code) {
        for (VerificationStatus status : VerificationStatus.values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String getDescription(Integer code) {
        VerificationStatus status = fromCode(code);
        return status != null ? status.description : "未知状态";
    }
} 