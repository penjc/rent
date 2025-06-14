package com.casual.rent.controller;

import com.casual.rent.common.Result;
import com.casual.rent.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "文件接口")
@RestController
@RequestMapping("/files")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class FileController {
    
    @Autowired
    private FileUploadService fileUploadService;
    
    // 允许的图片类型
    private static final String[] IMAGE_TYPES = {"image/"};
    // 允许的文档类型
    private static final String[] DOCUMENT_TYPES = {"image/", "application/pdf"};
    
    // 图片最大大小 5MB
    private static final long IMAGE_MAX_SIZE = 5 * 1024 * 1024;
    // 文档最大大小 10MB
    private static final long DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;
    
    /**
     * 测试OSS连接
     */
    @Operation(summary = "测试OSS连接")
    @GetMapping("/test")
    public Result<?> testOSSConnection() {
        try {
            boolean isConnected = fileUploadService.testConnection();
            if (isConnected) {
                return Result.success("OSS连接正常");
            } else {
                return Result.error("OSS连接失败");
            }
        } catch (Exception e) {
            return Result.error("OSS连接测试失败：" + e.getMessage());
        }
    }
    
    /**
     * 通用文件上传接口
     */
    @Operation(summary = "通用文件上传")
    @PostMapping("/upload")
    public Result<?> uploadFile(@RequestParam("file") MultipartFile file,
                               @RequestParam(value = "folder", defaultValue = "general") String folder) {
        try {
            // 验证文件
            if (file.isEmpty()) {
                return Result.error("文件不能为空");
            }
            
            // 根据文件夹类型选择验证规则
            if ("products".equals(folder) || "avatars".equals(folder)) {
                if (!fileUploadService.isValidFileType(file, IMAGE_TYPES)) {
                    return Result.error("只支持图片文件");
                }
                if (!fileUploadService.isValidFileSize(file, IMAGE_MAX_SIZE)) {
                    return Result.error("图片大小不能超过5MB");
                }
            } else if ("certificates".equals(folder)) {
                if (!fileUploadService.isValidFileType(file, DOCUMENT_TYPES)) {
                    return Result.error("只支持图片或PDF文件");
                }
                if (!fileUploadService.isValidFileSize(file, DOCUMENT_MAX_SIZE)) {
                    return Result.error("文件大小不能超过10MB");
                }
            } else {
                // 默认按图片处理
                if (!fileUploadService.isValidFileType(file, IMAGE_TYPES)) {
                    return Result.error("只支持图片文件");
                }
                if (!fileUploadService.isValidFileSize(file, IMAGE_MAX_SIZE)) {
                    return Result.error("图片大小不能超过5MB");
                }
            }
            
            // 上传文件
            String url = fileUploadService.uploadFile(file, folder);
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", file.getOriginalFilename());
            
            return Result.success(result);
            
        } catch (Exception e) {
            return Result.error("上传失败：" + e.getMessage());
        }
    }

    /**
     * 上传商品图片
     */
    @Operation(summary = "上传商品图片")
    @PostMapping("/upload/product")
    public Result<?> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            // 验证文件
            if (file.isEmpty()) {
                return Result.error("文件不能为空");
            }
            
            if (!fileUploadService.isValidFileType(file, IMAGE_TYPES)) {
                return Result.error("只支持图片文件");
            }
            
            if (!fileUploadService.isValidFileSize(file, IMAGE_MAX_SIZE)) {
                return Result.error("图片大小不能超过5MB");
            }
            
            // 上传文件
            String url = fileUploadService.uploadFile(file, "products");
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", file.getOriginalFilename());
            
            return Result.success(result);
            
        } catch (Exception e) {
            return Result.error("上传失败：" + e.getMessage());
        }
    }
    
    /**
     * 批量上传商品图片 - 修复接口路径
     */
    @Operation(summary = "批量上传商品图片")
    @PostMapping("/upload/products")
    public Result<?> uploadProductImages(@RequestParam("images") MultipartFile[] files) {
        try {
            if (files.length == 0) {
                return Result.error("文件不能为空");
            }
            
            // 验证所有文件
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    return Result.error("存在空文件");
                }
                
                if (!fileUploadService.isValidFileType(file, IMAGE_TYPES)) {
                    return Result.error("只支持图片文件：" + file.getOriginalFilename());
                }
                
                if (!fileUploadService.isValidFileSize(file, IMAGE_MAX_SIZE)) {
                    return Result.error("图片大小不能超过5MB：" + file.getOriginalFilename());
                }
            }
            
            // 批量上传
            String[] urls = fileUploadService.uploadFiles(files, "products");
            
            Map<String, Object> result = new HashMap<>();
            result.put("urls", urls);
            result.put("count", urls.length);
            
            return Result.success(result);
            
        } catch (Exception e) {
            return Result.error("批量上传失败：" + e.getMessage());
        }
    }
    
    /**
     * 上传用户头像
     */
    @Operation(summary = "上传用户头像")
    @PostMapping("/upload/avatar")
    public Result<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            // 验证文件
            if (file.isEmpty()) {
                return Result.error("文件不能为空");
            }
            
            if (!fileUploadService.isValidFileType(file, IMAGE_TYPES)) {
                return Result.error("只支持图片文件");
            }
            
            if (!fileUploadService.isValidFileSize(file, IMAGE_MAX_SIZE)) {
                return Result.error("图片大小不能超过5MB");
            }
            
            // 上传文件
            String url = fileUploadService.uploadFile(file, "avatars");
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", file.getOriginalFilename());
            
            return Result.success(result);
            
        } catch (Exception e) {
            return Result.error("上传失败：" + e.getMessage());
        }
    }
    
    /**
     * 上传商家证件（营业执照、身份证等）
     */
    @Operation(summary = "上传商家证件")
    @PostMapping("/upload/certificate")
    public Result<?> uploadCertificate(@RequestParam("file") MultipartFile file) {
        try {
            // 验证文件
            if (file.isEmpty()) {
                return Result.error("文件不能为空");
            }
            
            if (!fileUploadService.isValidFileType(file, DOCUMENT_TYPES)) {
                return Result.error("只支持图片或PDF文件");
            }
            
            if (!fileUploadService.isValidFileSize(file, DOCUMENT_MAX_SIZE)) {
                return Result.error("文件大小不能超过10MB");
            }
            
            // 上传文件
            String url = fileUploadService.uploadFile(file, "certificates");
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", file.getOriginalFilename());
            
            return Result.success(result);
            
        } catch (Exception e) {
            return Result.error("上传失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除文件
     */
    @Operation(summary = "删除文件")
    @DeleteMapping("/delete")
    public Result<?> deleteFile(@RequestParam("url") String fileUrl) {
        try {
            fileUploadService.deleteFile(fileUrl);
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.error("删除失败：" + e.getMessage());
        }
    }
} 