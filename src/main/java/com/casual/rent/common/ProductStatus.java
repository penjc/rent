package com.casual.rent.common;

/**
 * 商品状态枚举
 */
public enum ProductStatus {
    OFF_SHELF(0, "下架"),
    ON_SHELF(1, "上架");

    private final Integer code;
    private final String description;

    ProductStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ProductStatus fromCode(Integer code) {
        for (ProductStatus status : ProductStatus.values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }

    public static String getDescription(Integer code) {
        ProductStatus status = fromCode(code);
        return status != null ? status.description : "未知状态";
    }
} 