#!/bin/bash

# Casual Rent 停止服务脚本
echo "🛑 停止 Casual Rent 服务..."

# 从PID文件读取进程ID并停止
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "📦 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✅ 后端服务已停止"
    else
        echo "ℹ️  后端服务未运行"
    fi
    rm -f .backend.pid
else
    echo "ℹ️  未找到后端PID文件"
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止"
    else
        echo "ℹ️  前端服务未运行"
    fi
    rm -f .frontend.pid
else
    echo "ℹ️  未找到前端PID文件"
fi

# 强制停止所有相关进程
echo "🔍 查找并停止所有相关进程..."

# 停止Java进程（包含rent关键字）
JAVA_PIDS=$(pgrep -f "java.*rent")
if [ ! -z "$JAVA_PIDS" ]; then
    echo "💥 强制停止Java进程: $JAVA_PIDS"
    kill -9 $JAVA_PIDS 2>/dev/null
fi

# 停止Node.js进程（在端口3000上运行）
NODE_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$NODE_PIDS" ]; then
    echo "💥 强制停止Node.js进程: $NODE_PIDS"
    kill -9 $NODE_PIDS 2>/dev/null
fi

# 停止Spring Boot进程（在端口8080上运行）
SPRING_PIDS=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$SPRING_PIDS" ]; then
    echo "💥 强制停止Spring Boot进程: $SPRING_PIDS"
    kill -9 $SPRING_PIDS 2>/dev/null
fi

echo ""
echo "✅ 所有服务已停止"
echo "📄 日志文件保留: backend.log, frontend.log" 