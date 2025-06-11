package com.casual.rent.common;

/**
 * 审核状态枚举
 */
public enum AuditStatus {
    PENDING(0, "待审核"),
    APPROVED(1, "审核通过"),
    REJECTED(2, "审核拒绝");

    private final Integer code;
    private final String description;

    AuditStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static AuditStatus fromCode(Integer code) {
        for (AuditStatus status : AuditStatus.values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String getDescription(Integer code) {
        AuditStatus status = fromCode(code);
        return status != null ? status.description : "未知状态";
    }
} 