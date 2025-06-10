package com.casual.rent.service;

import com.qcloud.cos.COSClient;
import com.qcloud.cos.model.ObjectMetadata;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.model.PutObjectResult;
import com.qcloud.cos.model.Bucket;
import com.casual.rent.config.TencentCosConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);
    
    @Autowired
    private COSClient cosClient;
    
    @Autowired
    private TencentCosConfig cosConfig;
    
    /**
     * 测试OSS连接
     */
    public boolean testConnection() {
        try {
            logger.info("开始测试OSS连接...");
            logger.info("配置信息 - Region: {}, BucketName: {}, Domain: {}", 
                       cosConfig.getRegion(), cosConfig.getBucketName(), cosConfig.getDomain());
            
            // 列出存储桶来测试连接
            List<Bucket> buckets = cosClient.listBuckets();
            logger.info("OSS连接成功，找到 {} 个存储桶", buckets.size());
            
            // 检查指定的桶是否存在
            boolean bucketExists = cosClient.doesBucketExist(cosConfig.getBucketName());
            logger.info("指定存储桶 {} 是否存在: {}", cosConfig.getBucketName(), bucketExists);
            
            return bucketExists;
        } catch (Exception e) {
            logger.error("OSS连接测试失败", e);
            return false;
        }
    }
    
    /**
     * 上传文件到腾讯云OSS
     * @param file 要上传的文件
     * @param folder 文件夹名称（如：products, avatars, certificates等）
     * @return 文件访问URL
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            logger.info("开始上传文件: {}, 文件夹: {}", file.getOriginalFilename(), folder);
            
            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = generateFileName(folder, extension);
            
            logger.info("生成的文件名: {}", fileName);
            
            // 设置对象元数据
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());
            
            // 创建上传请求
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                cosConfig.getBucketName(),
                fileName,
                file.getInputStream(),
                metadata
            );
            
            // 执行上传
            PutObjectResult result = cosClient.putObject(putObjectRequest);
            logger.info("文件上传成功，ETag: {}", result.getETag());
            
            // 返回文件访问URL
            String fileUrl = cosConfig.getDomain() + "/" + fileName;
            logger.info("文件访问URL: {}", fileUrl);
            
            return fileUrl;
            
        } catch (IOException e) {
            logger.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("文件上传异常", e);
            throw new RuntimeException("文件上传异常: " + e.getMessage(), e);
        }
    }
    
    /**
     * 批量上传文件
     * @param files 文件数组
     * @param folder 文件夹名称
     * @return 文件URL数组
     */
    public String[] uploadFiles(MultipartFile[] files, String folder) {
        logger.info("开始批量上传 {} 个文件到文件夹: {}", files.length, folder);
        String[] urls = new String[files.length];
        for (int i = 0; i < files.length; i++) {
            urls[i] = uploadFile(files[i], folder);
        }
        logger.info("批量上传完成");
        return urls;
    }
    
    /**
     * 删除文件
     * @param fileUrl 文件URL
     */
    public void deleteFile(String fileUrl) {
        try {
            logger.info("开始删除文件: {}", fileUrl);
            // 从URL中提取文件key
            String fileKey = fileUrl.replace(cosConfig.getDomain() + "/", "");
            cosClient.deleteObject(cosConfig.getBucketName(), fileKey);
            logger.info("文件删除成功: {}", fileKey);
        } catch (Exception e) {
            logger.error("文件删除失败: " + fileUrl, e);
            throw new RuntimeException("文件删除失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 生成文件名
     * @param folder 文件夹
     * @param extension 文件扩展名
     * @return 生成的文件名
     */
    private String generateFileName(String folder, String extension) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
        String datePath = sdf.format(new Date());
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return folder + "/" + datePath + "/" + uuid + extension;
    }
    
    /**
     * 验证文件类型
     * @param file 文件
     * @param allowedTypes 允许的文件类型
     * @return 是否有效
     */
    public boolean isValidFileType(MultipartFile file, String[] allowedTypes) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }
        
        for (String allowedType : allowedTypes) {
            if (contentType.startsWith(allowedType)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 验证文件大小
     * @param file 文件
     * @param maxSize 最大大小（字节）
     * @return 是否有效
     */
    public boolean isValidFileSize(MultipartFile file, long maxSize) {
        return file.getSize() <= maxSize;
    }
} 