package com.casual.rent.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.common.CategoryStatus;
import com.casual.rent.entity.Category;
import com.casual.rent.mapper.CategoryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 分类服务
 */
@Service
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {
    
    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);
    
    /**
     * 获取所有启用的分类
     */
    public List<Category> getActiveCategories() {
        return lambdaQuery()
                .eq(Category::getStatus, CategoryStatus.ENABLED.getCode())
                .orderByAsc(Category::getSortOrder)
                .list();
    }
    
    /**
     * 管理员获取分类分页列表（支持搜索）
     */
    public IPage<Category> getCategoriesForAdmin(int page, int size, String name, Integer status) {
        try {
            log.debug("开始获取分类列表，page: {}, size: {}, name: {}, status: {}", page, size, name, status);
            
            Page<Category> pageParam = new Page<>(page, size);
            
            // 安全处理name参数
            String trimmedName = null;
            if (name != null) {
                trimmedName = name.trim();
                if (trimmedName.isEmpty()) {
                    trimmedName = null;
                }
            }
            
            log.debug("处理后的查询参数，trimmedName: {}, status: {}", trimmedName, status);
            
            IPage<Category> result = lambdaQuery()
                    .like(trimmedName != null, Category::getName, trimmedName)
                    .eq(status != null, Category::getStatus, status)
                    .orderByAsc(Category::getSortOrder)
                    .orderByDesc(Category::getCreatedAt)
                    .page(pageParam);
            
            log.debug("查询完成，总记录数: {}", result.getTotal());
            return result;
            
        } catch (Exception e) {
            log.error("获取分类列表失败", e);
            throw new RuntimeException("获取分类列表失败：" + e.getMessage(), e);
        }
    }
    
    /**
     * 创建分类
     */
    public Category createCategory(String name, String icon, Integer sortOrder) {
        // 检查分类名称是否已存在
        long count = lambdaQuery()
                .eq(Category::getName, name.trim())
                .count();
        if (count > 0) {
            throw new RuntimeException("分类名称已存在");
        }
        
        // 如果未指定排序，使用最大排序+1
        if (sortOrder == null) {
            Category maxSortCategory = lambdaQuery()
                    .orderByDesc(Category::getSortOrder)
                    .last("LIMIT 1")
                    .one();
            if (maxSortCategory != null && maxSortCategory.getSortOrder() != null) {
                sortOrder = maxSortCategory.getSortOrder() + 1;
            } else {
                sortOrder = 1;
            }
        }
        
        Category category = new Category();
        category.setName(name.trim());
        category.setIcon(icon);
        category.setSortOrder(sortOrder);
        category.setStatus(CategoryStatus.ENABLED.getCode()); // 默认启用
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        
        save(category);
        return category;
    }
    
    /**
     * 更新分类
     */
    public Category updateCategory(Long id, String name, String icon, Integer sortOrder, Integer status) {
        Category category = getById(id);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        
        // 检查名称是否与其他分类重复
        if (name != null && !name.trim().isEmpty()) {
            long count = lambdaQuery()
                    .eq(Category::getName, name.trim())
                    .ne(Category::getId, id)
                    .count();
            if (count > 0) {
                throw new RuntimeException("分类名称已存在");
            }
            category.setName(name.trim());
        }
        
        if (icon != null) {
            category.setIcon(icon);
        }
        if (sortOrder != null) {
            category.setSortOrder(sortOrder);
        }
        if (status != null) {
            category.setStatus(status);
        }
        
        category.setUpdatedAt(LocalDateTime.now());
        updateById(category);
        return category;
    }
    
    /**
     * 删除分类（检查是否有商品使用）
     */
    public void deleteCategory(Long id) {
        Category category = getById(id);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        
        // 检查是否有商品使用该分类
        // 这里需要注入ProductService或者通过其他方式检查
        // 为了避免循环依赖，我们可以直接查询数据库
        // 或者在Controller层进行检查
        
        removeById(id);
    }
    
    /**
     * 更新分类状态
     */
    public void updateCategoryStatus(Long id, Integer status) {
        Category category = getById(id);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        
        category.setStatus(status);
        category.setUpdatedAt(LocalDateTime.now());
        updateById(category);
    }
    
    /**
     * 批量更新排序
     */
    public void batchUpdateSortOrder(List<Long> categoryIds) {
        for (int i = 0; i < categoryIds.size(); i++) {
            Long categoryId = categoryIds.get(i);
            Category category = getById(categoryId);
            if (category != null) {
                category.setSortOrder(i + 1);
                category.setUpdatedAt(LocalDateTime.now());
                updateById(category);
            }
        }
    }
    
    /**
     * 根据状态统计分类数量
     */
    public long countByStatus(Integer status) {
        return lambdaQuery()
                .eq(Category::getStatus, status)
                .count();
    }
} 