#!/bin/bash

# macOS 安装脚本：安装 Java 8、Maven、Node.js 22 和 MySQL 5.7
set -e

if ! command -v brew >/dev/null 2>&1; then
  echo "未检测到 Homebrew，请先安装 Homebrew" >&2
  exit 1
fi

brew update
brew install openjdk@8 maven node@22 mysql@5.7
brew services start mysql@5.7

cd frontend
npm install
cd ..

echo "依赖安装完成 ✅"
echo "请根据 README.md 配置数据库后执行 ./start-all.sh 启动项目"

