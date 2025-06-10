package com.casual.rent.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 统一响应结果
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> {
    
    private Integer code;
    private String message;
    private T data;
    
    public Result() {}
    
    public Result(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
    
    public static <T> Result<T> success() {
        return new Result<>(200, "操作成功");
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data);
    }
    
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(200, message, data);
    }
    
    public static <T> Result<T> error() {
        return new Result<>(500, "操作失败");
    }
    
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message);
    }
    
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message);
    }
    
    public static <T> Result<T> fail(String message) {
        return new Result<>(500, message);
    }
    
    // 参数校验错误
    public static <T> Result<T> validateError(String message) {
        return new Result<>(400, message);
    }
    
    // 权限不足
    public static <T> Result<T> forbidden() {
        return new Result<>(403, "权限不足");
    }
    
    // 未认证
    public static <T> Result<T> unauthorized() {
        return new Result<>(401, "请先登录");
    }
    
    // 资源不存在
    public static <T> Result<T> notFound() {
        return new Result<>(404, "资源不存在");
    }
    
    public Integer getCode() {
        return code;
    }
    
    public void setCode(Integer code) {
        this.code = code;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
} 