package com.casual.rent.common;

/**
 * 订单状态枚举
 */
public enum OrderStatus {
    PENDING_PAYMENT(1, "待支付"),
    PAID(2, "已支付"),
    MERCHANT_SHIPPING(3, "商家发货中"), 
    IN_USE(4, "使用中"),
    USER_RETURNING(5, "用户返还中"),
    COMPLETED(6, "已完成"),
    CANCELLED(7, "已取消");

    private final Integer code;
    private final String description;

    OrderStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static OrderStatus fromCode(Integer code) {
        for (OrderStatus status : OrderStatus.values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String getDescription(Integer code) {
        OrderStatus status = fromCode(code);
        return status != null ? status.description : "未知状态";
    }
} 