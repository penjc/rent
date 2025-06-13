#!/bin/bash

# Casual Rent 启动脚本
echo "🚀 正在启动 Casual Rent..."

# 检查Java环境
if ! command -v java &> /dev/null; then
    echo "❌ 未找到Java环境，请先安装Java 8+"
    exit 1
fi

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js环境，请先安装Node.js 22+"
    exit 1
fi

echo "✅ Java版本: $(java -version 2>&1 | head -n 1)"
echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 启动后端服务
echo ""
echo "🔨 重新打包后端服务..."
mvn clean package -DskipTests
echo ""
echo "📦 启动后端服务 (Spring Boot)..."
echo "后端服务将在 http://localhost:8080 运行"
nohup java -jar target/rent-*.jar > backend.log 2>&1 &
BACKEND_PID=$!
echo "后端进程PID: $BACKEND_PID"

# 等待后端启动
for i in {1..30}; do
    if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
        echo "✅ 后端服务启动成功"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 后端服务启动超时"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

# 启动前端服务
echo ""
echo "🎨 启动前端服务 (React + Vite)..."
echo "前端服务将在 http://localhost:3000 运行"
cd frontend
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端进程PID: $FRONTEND_PID"
cd ..

# 等待前端启动
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 前端服务启动成功"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 前端服务启动超时"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

echo ""
echo "🎉 Casual Rent 启动完成！"
echo ""
echo "📱 服务地址:"
echo "   前端 (用户端):   http://localhost:3000/user"
echo "   前端 (商家端):   http://localhost:3000/merchant"  
echo "   前端 (管理端):   http://localhost:3000/admin"
echo "   后端 API:       http://localhost:8080/api"
echo ""
echo "📋 管理命令:"
echo "   查看后端日志:   tail -f backend.log"
echo "   查看前端日志:   tail -f frontend.log"
echo "   停止所有服务:   ./stop-all.sh"
echo ""
echo "ℹ️  进程ID:"
echo "   后端: $BACKEND_PID"
echo "   前端: $FRONTEND_PID"

# 保存PID到文件，方便停止
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "🔄 服务正在运行，使用 Ctrl+C 或 ./stop-all.sh 停止服务"

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo "✅ 所有服务已停止"; exit 0' INT

# 保持脚本运行
while true; do
    # 检查进程是否还在运行
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ 后端服务意外停止"
        kill $FRONTEND_PID 2>/dev/null
        rm -f .backend.pid .frontend.pid
        exit 1
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ 前端服务意外停止"
        kill $BACKEND_PID 2>/dev/null
        rm -f .backend.pid .frontend.pid
        exit 1
    fi
    sleep 5
done 