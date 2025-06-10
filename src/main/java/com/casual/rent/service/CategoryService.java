package com.casual.rent.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.casual.rent.entity.Category;
import com.casual.rent.mapper.CategoryMapper;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 分类服务
 */
@Service
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {
    
    /**
     * 获取所有启用的分类
     */
    public List<Category> getActiveCategories() {
        return lambdaQuery()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSortOrder)
                .list();
    }
} 