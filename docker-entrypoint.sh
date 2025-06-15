#!/bin/bash

# Docker容器启动脚本

set -e

# 默认配置
JAVA_OPTS=${JAVA_OPTS:-"-Xms512m -Xmx1024m"}
SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-"prod"}

# 等待数据库连接
if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    echo "等待数据库连接 $DB_HOST:$DB_PORT..."
    while ! nc -z "$DB_HOST" "$DB_PORT"; do
        sleep 1
    done
    echo "数据库连接成功!"
fi

# 设置JVM参数
export JAVA_OPTS="$JAVA_OPTS -Djava.security.egd=file:/dev/./urandom"
export JAVA_OPTS="$JAVA_OPTS -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE"

# 如果有环境变量，设置数据库连接
if [ -n "$DB_HOST" ]; then
    export JAVA_OPTS="$JAVA_OPTS -Dspring.datasource.url=jdbc:mysql://$DB_HOST:${DB_PORT:-3306}/${DB_NAME:-rent}"
fi

if [ -n "$DB_USERNAME" ]; then
    export JAVA_OPTS="$JAVA_OPTS -Dspring.datasource.username=$DB_USERNAME"
fi

if [ -n "$DB_PASSWORD" ]; then
    export JAVA_OPTS="$JAVA_OPTS -Dspring.datasource.password=$DB_PASSWORD"
fi

# 启动应用
echo "启动 Casual Rent 应用..."
echo "Java 选项: $JAVA_OPTS"

exec java $JAVA_OPTS -jar app.jar "$@" 