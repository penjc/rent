#!/bin/bash

# 安装项目依赖脚本
# 适用于 Ubuntu/Debian 系统，安装 Java 8、Maven、Node.js 22 和 MySQL 5.7

set -e

if [ "$EUID" -ne 0 ]; then
  echo "请以 root 身份或使用 sudo 运行该脚本" >&2
  exit 1
fi

# 更新软件源
apt-get update

# 安装基本依赖
apt-get install -y curl gnupg2

# 安装 Java (OpenJDK 8)
if ! command -v java >/dev/null 2>&1; then
  apt-get install -y openjdk-8-jdk
fi

# 安装 Maven
if ! command -v mvn >/dev/null 2>&1; then
  apt-get install -y maven
fi

# 安装 Node.js 22.x (包含 npm)
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# 安装 MySQL Server 5.7
if ! command -v mysql >/dev/null 2>&1; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server-5.7
fi

# 安装前端依赖
cd frontend
npm install
cd ..

cat <<'INFO'
依赖安装完成 ✅
请根据 README.md 配置数据库和环境变量后执行 ./start-all.sh 启动项目
INFO

