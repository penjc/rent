package com.casual.rent.common;

/**
 * 地址所有者类型枚举
 */
public enum AddressOwnerType {
    USER(1, "用户"),
    MERCHANT(2, "商家");

    private final Integer code;
    private final String description;

    AddressOwnerType(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static AddressOwnerType fromCode(Integer code) {
        for (AddressOwnerType type : AddressOwnerType.values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    public static String getDescription(Integer code) {
        AddressOwnerType type = fromCode(code);
        return type != null ? type.description : "未知类型";
    }
} 