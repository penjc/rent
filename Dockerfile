# 多阶段构建 Dockerfile for Casual Rent

# 阶段1: 构建前端
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制前端源码
COPY frontend/ ./

# 构建前端
RUN npm run build

# 阶段2: 构建后端
FROM maven:3.9-openjdk-11-slim AS backend-builder

WORKDIR /app

# 复制Maven配置文件
COPY pom.xml ./

# 下载依赖（利用Docker缓存）
RUN mvn dependency:go-offline -B

# 复制后端源码
COPY src/ ./src/

# 构建后端
RUN mvn clean package -DskipTests

# 阶段3: 运行时镜像
FROM openjdk:11-jre-slim

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制文件
COPY --from=backend-builder /app/target/*.jar app.jar
COPY --from=frontend-builder /app/frontend/dist ./static

# 复制启动脚本
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# 创建日志目录
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["./docker-entrypoint.sh"] 