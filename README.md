<div align="center">

# Casual Rent - 二手租赁平台

</div>

<div align="center">
  <img src="assets/rent.png" alt="Casual Rent" width="200">
  
  <p>现代化二手物品租赁平台，连接租客与商家</p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.18-brightgreen.svg)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)](https://www.mysql.com/)

  [英文 README](README.en.md) 

[//]: # (  | [在线演示]&#40;https://demo.casualrent.com&#41; | [API文档]&#40;http://localhost:8080/swagger-ui.html&#41;)

</div>

<details >
<summary><strong>📖 目录</strong></summary>

- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [API文档](#-API文档)
- [应用访问](#-应用访问)
- [开发工具](#-开发工具)
- [贡献指南](#-贡献指南)
- [常见问题](#-常见问题)
- [更新日志](#-更新日志)
- [许可证](#-许可证)
</details>

## 🎯 项目简介

Casual Rent 是一个功能完整的二手物品租赁平台，旨在为用户提供便捷的租赁服务。平台支持三种角色：
- **用户端**：浏览商品、下单租赁、管理订单
- **商家端**：发布商品、处理订单、数据统计
- **管理端**：平台管理、用户审核、数据监控

### 🌟 项目亮点
- 🎨 **现代化UI设计**：基于Ant Design + Tailwind CSS
- 📱 **响应式布局**：完美适配移动端和桌面端
- 🔐 **安全认证**：多角色权限管理
- 💬 **实时通讯**：用户与商家即时聊天
- 📊 **数据可视化**：丰富的统计图表
- 🚀 **高性能**：前后端分离架构

## 🎨 功能特性

### 👤 用户端功能
- 🏠 **首页展示**：商品分类、精选商品、热门推荐
- 🔍 **智能搜索**：关键字搜索、多维度筛选
- 📱 **响应式设计**：完美支持移动端和桌面端访问
- 🛒 **订单管理**：在线下单、支付集成、订单状态实时跟踪
- 👤 **用户中心**：个人信息管理、实名认证、安全设置
- 📍 **地址管理**：收货地址增删改查、默认地址设置
- ❤️ **收藏功能**：商品收藏、收藏夹管理
- 💬 **即时通讯**：与商家实时聊天、消息通知
- 🤖 **AI智能客服**：24/7在线AI助手，流式对话体验

### 🏪 商家端功能
- 📊 **商家仪表盘**：经营数据概览、收入统计、趋势分析
- 📦 **商品管理**：商品发布、编辑、上下架、库存管理
- 📋 **订单处理**：订单查看、状态更新、发货管理
- 📈 **数据统计**：收入报表、商品热度、用户分析
- 📍 **地址管理**：收货地址管理（用于商品归还）
- 💬 **客户沟通**：实时回复用户咨询、多渠道对话管理
- 🏆 **商家认证**：资质认证、信用评级

### 🛡️ 管理端功能
- 🎛️ **管理仪表盘**：平台运营数据、用户活跃度、交易统计
- 👥 **用户管理**：用户信息查看、状态管理、权限控制
- 🏪 **商家审核**：商家资质审核、认证管理、信用评估
- ✅ **商品审核**：商品信息审核、上架控制、质量监管
- 📂 **分类管理**：商品分类的增删改查、状态管理、排序设置
- 📊 **数据监控**：系统性能监控、异常告警、日志分析

## 🚀 技术栈

### 后端技术
- **核心框架**：Spring Boot 2.7.18
- **数据访问**：MyBatis Plus 3.5.3
- **数据库**：MySQL 5.7.24
- **安全框架**：Spring Security
- **AI集成**：LangChain4j（支持OpenAI、Azure、阿里云、百度等）
- **流式响应**：Server-Sent Events (SSE)
- **文件存储**：腾讯云COS
- **API文档**：SpringDoc OpenAPI 3
- **构建工具**：Maven 3.6+
- **配置管理**：Spring Dotenv

### 前端技术
- **核心框架**：React 19.1.0 + TypeScript 5.8.3
- **构建工具**：Vite 6.3.5
- **UI组件库**：Ant Design 5.25.4
- **样式框架**：Tailwind CSS 3.4.17
- **路由管理**：React Router Dom 7.6.2
- **状态管理**：Zustand 5.0.5
- **HTTP客户端**：Axios 1.9.0
- **样式方案**：Styled Components 6.1.19
- **日期处理**：Day.js 1.11.13

### 开发工具
- **代码规范**：ESLint + TypeScript ESLint
- **自动化部署**：Shell脚本
- **版本控制**：Git
- **包管理**：npm

## 📁 项目结构
```text
rent/
├── 📁 src/                          # 后端源码
│   ├── main/java/com/casual/rent/
│   │   ├── 📁 common/              # 通用组件（响应封装、异常处理）
│   │   ├── 📁 config/              # 配置类（数据库、安全、COS）
│   │   ├── 📁 controller/          # REST API控制器
│   │   ├── 📁 entity/              # JPA实体类
│   │   ├── 📁 mapper/              # MyBatis数据访问层
│   │   ├── 📁 service/             # 业务逻辑层
│   │   └── 📁 util/                # 工具类
│   ├── main/resources/
│   │   ├── 📁 mapper/              # MyBatis XML映射文件
│   │   ├── 📄 application.yml      # 主配置文件
│   │   └── 📄 application-pro.yml  # 生产环境配置
│   └── test/                       # 测试代码
├── 📁 frontend/                     # 前端源码
│   ├── 📁 src/
│   │   ├── 📁 pages/               # 页面组件
│   │   │   ├── 📁 user/           # 用户端页面
│   │   │   ├── 📁 merchant/       # 商家端页面
│   │   │   ├── 📁 admin/          # 管理端页面
│   │   │   └── 📁 common/         # 通用页面
│   │   ├── 📁 components/          # 可复用组件
│   │   │   ├── 📁 common/         # 通用组件
│   │   │   ├── 📁 user/           # 用户端组件
│   │   │   ├── 📁 merchant/       # 商家端组件
│   │   │   └── 📁 admin/          # 管理端组件
│   │   ├── 📁 services/            # API服务层
│   │   ├── 📁 stores/              # Zustand状态管理
│   │   ├── 📁 types/               # TypeScript类型定义
│   │   ├── 📁 utils/               # 工具函数
│   │   ├── 📁 hooks/               # 自定义React Hooks
│   │   ├── 📁 contexts/            # React Context
│   │   └── 📁 styles/              # 样式文件
│   ├── 📁 public/                  # 静态资源
│   └── 📄 package.json             # 前端依赖配置
├── 📁 sql/                         # 数据库脚本
├── 📁 assets/                      # 项目资源文件
├── 📁 .github/                     # GitHub配置
│   ├── 📁 ISSUE_TEMPLATE/          # Issue模板
│   └── 📄 PULL_REQUEST_TEMPLATE.md # PR模板
├── 📄 start-all.sh                 # 一键启动脚本
├── 📄 stop-all.sh                  # 停止服务脚本
├── 📄 pom.xml                      # Maven配置
├── 📄 .env.example                 # 环境变量模板
└── 📄 README.md                    # 项目说明
```

## 🚀 快速开始

### 📋 环境要求
- **Java**：JDK 8+
- **Node.js**：22+
- **MySQL**：5.7+
- **Maven**：3.6+
- **Git**：用于代码管理
- **AI服务**：OpenAI API Key 或其他支持的AI提供商（可选）

### 🛠️ 安装步骤

#### 1. 克隆项目
```bash
git clone https://github.com/penjc/rent.git
cd rent
```

#### 2. 数据库配置
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE rent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入数据库结构和初始数据
mysql -u root -p rent < sql/database.sql
```

#### 3. 后端配置
```bash
# 编辑配置文件，修改数据库连接信息
vim src/main/resources/application-pro.yml
```

配置示例：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rent?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

#### 4. 腾讯云COS配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量文件
vim .env
```

填写COS和AI配置：
```env
# 腾讯云COS配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_COS_REGION=your_region
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_DOMAIN=your_cos_domain

# AI客服配置（可选）
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_BASE_URL=https://api.openai.com/v1
AI_SYSTEM_PROMPT=你是Casual Rent平台的AI客服助手
```

> **AI客服配置说明**：
> - 支持多种AI提供商：OpenAI、Azure OpenAI、Ollama、百度千帆、阿里云通义千问、豆包

#### 5. 前端依赖安装
```bash
cd frontend
npm install
# 或使用yarn
yarn install
cd ..
```

#### 6. 构建后端
```bash
mvn clean compile
```

#### 7. 一键启动
```bash
# 给脚本执行权限
chmod +x start-all.sh stop-all.sh

# 启动所有服务
./start-all.sh
```

#### 8. 访问应用
- **前端应用**：http://localhost:3000
- **后端API**：http://localhost:8080/api
- **API文档**：http://localhost:8080/api/swagger-ui.html

#### 9. 默认账号
```
管理员账号：admin / admin123
```

## 📚 API文档

项目集成了SpringDoc OpenAPI 3，提供完整的API文档：

- **本地访问**：http://localhost:8080/api/swagger-ui.html
- **JSON格式**：http://localhost:8080/api/v3/api-docs

### 主要API端点
- **用户管理**：`/api/users/*`
- **商家管理**：`/api/merchants/*`
- **商品管理**：`/api/products/*`
- **订单管理**：`/api/orders/*`
- **分类管理**：`/api/categories/*`
- **文件上传**：`/api/upload/*`
- **AI客服**：`/api/ai-chat/*`

## 📱 应用访问

### 👤 用户端
- **首页**：http://localhost:3000/user
- **商品列表**：http://localhost:3000/user/products
- **商品详情**：http://localhost:3000/user/products/:id
- **我的订单**：http://localhost:3000/user/orders
- **地址管理**：http://localhost:3000/user/addresses
- **收藏夹**：http://localhost:3000/user/favorites
- **消息中心**：http://localhost:3000/user/messages
- **个人中心**：http://localhost:3000/user/profile

### 🏪 商家端
- **仪表盘**：http://localhost:3000/merchant/dashboard
- **商品管理**：http://localhost:3000/merchant/products
- **订单管理**：http://localhost:3000/merchant/orders
- **地址管理**：http://localhost:3000/merchant/addresses
- **消息中心**：http://localhost:3000/merchant/messages
- **商家认证**：http://localhost:3000/merchant/certification
- **数据统计**：http://localhost:3000/merchant/statistics

### 🛡️ 管理端
- **仪表盘**：http://localhost:3000/admin
- **用户管理**：http://localhost:3000/admin/users
- **商家管理**：http://localhost:3000/admin/merchants
- **商品审核**：http://localhost:3000/admin/products
- **订单管理**：http://localhost:3000/admin/orders
- **分类管理**：http://localhost:3000/admin/categories
- **系统设置**：http://localhost:3000/admin/settings

### 🔐 认证页面
- **用户登录**：http://localhost:3000/auth/login?type=user
- **商家登录**：http://localhost:3000/auth/login?type=merchant
- **管理员登录**：http://localhost:3000/auth/login?type=admin
- **用户注册**：http://localhost:3000/auth/register?type=user
- **商家注册**：http://localhost:3000/auth/register?type=merchant

## 🔧 开发工具

### 服务管理
```bash
# 启动所有服务
./start-all.sh

# 停止所有服务
./stop-all.sh

# 仅启动后端
mvn clean package -DskipTests
java -jar target/rent-*.jar

# 后端热重载（开发模式）
mvn spring-boot:run

# 仅启动前端
cd frontend && npm run dev
```

### 代码质量
```bash
# 前端代码检查
cd frontend
npm run lint

# 前端代码格式化
npm run lint:fix

# 后端代码检查
mvn checkstyle:check
```

### 数据库管理
```bash
# 备份数据库
mysqldump -u root -p rent > backup.sql

# 查看数据库日志
tail -f /var/log/mysql/error.log
```

## 🤝 贡献指南

欢迎所有形式的贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 贡献流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 遵循现有代码风格
- 添加适当的测试
- 更新相关文档
- 确保所有测试通过

## ❓ 常见问题

<details>
<summary><strong>Q: 启动时出现端口占用错误？</strong></summary>

A: 检查端口占用情况：
```bash
# 检查8080端口
lsof -i :8080
# 检查3000端口  
lsof -i :3000
# 杀死占用进程
kill -9 <PID>
```
</details>

<details>
<summary><strong>Q: 数据库连接失败？</strong></summary>

A: 请检查：
1. MySQL服务是否启动
2. 数据库配置是否正确
3. 数据库用户权限是否足够
4. 防火墙设置
</details>

<details>
<summary><strong>Q: 前端页面空白？</strong></summary>

A: 可能的解决方案：
1. 检查控制台错误信息
2. 确认后端API是否正常
3. 清除浏览器缓存
4. 检查网络连接
</details>

<details>
<summary><strong>Q: 文件上传失败？</strong></summary>

A: 请检查：
1. 腾讯云COS配置是否正确
2. 存储桶权限设置
3. 网络连接状况
4. 文件大小限制
</details>

## 📝 更新日志

### v1.1.0 (2025-07-08)
- 🤖 **新增AI智能客服功能**
  - 支持6种AI提供商：OpenAI、Azure OpenAI、Ollama、百度千帆、阿里云通义千问、豆包
  - 实现真正的流式对话体验，AI回复实时显示
  - 智能对话历史管理，支持上下文理解
  - 悬浮客服窗口，随时随地获得帮助
  - 完整的错误处理和降级机制

### v1.0.0 (2025-06-15)
- 🎉 项目初始版本发布
- ✨ 完整的用户、商家、管理三端功能
- 🔐 用户认证和权限管理
- 💬 实时聊天功能
- 📊 数据统计和可视化

### 计划中的功能
- [ ] 支付宝/微信支付集成
- [ ] 推送通知
- [ ] 多语言支持
- [ ] 商品推荐算法

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

- [Spring Boot](https://spring.io/projects/spring-boot) - 后端框架
- [MyBatis Plus](https://baomidou.com/) - ORM框架
- [React](https://reactjs.org/) - 前端框架
- [Ant Design](https://ant.design/) - UI组件库

---

<div align="center">
  <p>如果这个项目对您有帮助，请给我们一个 ⭐️</p>
  <p>Made with ❤️ by <a href="https://pengjiancheng.com">penjc</a></p>
</div>