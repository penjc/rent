package com.casual.rent.common;

/**
 * 用户状态枚举
 */
public enum UserStatus {
    DISABLED(0, "禁用"),
    ACTIVE(1, "正常");

    private final Integer code;
    private final String description;

    UserStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static UserStatus fromCode(Integer code) {
        for (UserStatus status : UserStatus.values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String getDescription(Integer code) {
        UserStatus status = fromCode(code);
        return status != null ? status.description : "未知状态";
    }
} 