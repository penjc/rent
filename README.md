![Casual Rent](assets/rent.png)

# Casual Rent - 二手租赁平台

[English Version](README.en.md)

## 目录
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [应用访问](#应用访问)
- [开发工具](#开发工具)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 🚀 技术栈

### 后端技术
- **框架**: Spring Boot 2.7.x
- **ORM**: MyBatis Plus
- **数据库**: MySQL 5.7+
- **构建**: Maven

### 前端技术
- **框架**: React 18 + TypeScript
- **构建**: Vite
- **UI库**: Ant Design + Tailwind CSS
- **路由**: React Router Dom
- **状态管理**: Zustand
- **HTTP客户端**: Axios

## 📁 项目结构
```text
rent/
├── src/                     # 后端代码
│   ├── main/java/com/casual/rent/
│   │   ├── common/         # 通用组件
│   │   ├── config/         # 配置类
│   │   ├── controller/     # REST控制器
│   │   ├── entity/         # 实体类
│   │   ├── mapper/         # MyBatis映射器
│   │   ├── service/        # 业务逻辑
│   │   └── util/           # 工具类
│   └── main/resources/
│       ├── mapper/         # MyBatis XML映射
│       └── application.yml # 配置文件
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── user/      # 用户端
│   │   │   ├── merchant/  # 商家端
│   │   │   ├── admin/     # 管理端
│   │   │   └── common/    # 通用页面
│   │   ├── components/    # 公共组件
│   │   ├── services/      # API服务
│   │   ├── stores/        # 状态管理
│   │   └── types/         # 类型定义
│   └── package.json
├── sql/                   # 数据库脚本
├── start-all.sh           # 一键启动前后端
├── stop-all.sh            # 停止所有服务
└── pom.xml
```

## 🎨 功能特性

### 用户端功能
- 🏠 **首页展示**: 商品分类、精选商品
- 🔍 **商品搜索**: 关键字搜索、分类筛选、商品排序
- 📱 **响应式设计**: 支持移动端和桌面端
- 🛒 **订单管理**: 下单、支付、订单状态跟踪
- 👤 **用户中心**: 个人信息、实名认证
- 📍 **地址管理**: 收货地址增删改查、默认地址设置
- 💬 **即时通讯**: 用户与商家实时聊天

### 商家端功能
- 📊 **商家仪表盘**: 经营数据概览
- 📦 **商品管理**: 发布、编辑、下架商品
- 📋 **订单处理**: 查看和处理租赁订单
- 📈 **数据统计**: 收入统计、商品热度分析
- 📍 **地址管理**: 收货地址管理（用于商品归还）
- 💬 **客户沟通**: 实时回复用户咨询、管理多渠道对话

### 管理端功能
- 🎛️ **管理仪表盘**: 平台运营数据
- 👥 **用户管理**: 用户信息查看和管理
- 🏪 **商家审核**: 商家资质审核和管理
- ✅ **商品审核**: 商品信息审核和上架控制
- 📂 **分类管理**: 商品分类的增删改查，支持状态管理和排序

## 🚀 快速开始

### 环境要求
- **Java**: JDK 8+
- **Node.js**: 22+
- **MySQL**: 5.7+
- **Maven**: 3.6+

### 安装步骤
1. **克隆项目**
   ```bash
   git clone https://github.com/penjc/rent
   cd rent
   ```
2. **配置数据库**

   使用[sql脚本](sql/database.sql)创建数据库和表结构。

3. **修改配置**
   ```yaml
   # src/main/resources/application-pro.yml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/rent
       username: your_username
       password: your_password
   ```
4. **配置腾讯云COS**

   修改`.env.example`为 `.env` 并填写相关配置。
   设置权限为公有读私有写

5. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
6. **构建后端**
   ```bash
   mvn clean compile
   ```
7. **一键启动**
   ```bash
   ./start-all.sh
   ```
8. **访问应用**
   - 前端应用: http://localhost:3000
   - 后端API: http://localhost:8080/api
9. **更新项目**
   ```bash
   git pull origin main
   ```

## 📱 应用访问

### 用户端
- **首页**: http://localhost:3000/user
- **商品列表**: http://localhost:3000/user/products
- **我的订单**: http://localhost:3000/user/orders
- **地址管理**: http://localhost:3000/user/addresses
- **收藏夹**: http://localhost:3000/user/favorites
- **消息列表**: http://localhost:3000/user/messages
- **个人中心**: http://localhost:3000/user/profile/

### 商家端
- **仪表盘**: http://localhost:3000/merchant/dashboard
- **商品管理**: http://localhost:3000/merchant/products
- **订单管理**: http://localhost:3000/merchant/orders
- **地址管理**: http://localhost:3000/merchant/addresses
- **消息列表**: http://localhost:3000/merchant/messages
- **商家认证**: http://localhost:3000/merchant/certification

### 管理端
- **仪表盘**: http://localhost:3000/admin
- **用户管理**: http://localhost:3000/admin/users
- **商家管理**: http://localhost:3000/admin/merchants
- **商品审核**: http://localhost:3000/admin/products
- **订单管理**: http://localhost:3000/admin/orders
- **分类管理**: http://localhost:3000/admin/categories

### 认证页面
- **用户登录**: http://localhost:3000/auth/login?type=user
- **商家登录**: http://localhost:3000/auth/login?type=merchant
- **管理员登录**: http://localhost:3000/auth/login?type=admin
- **用户注册**: http://localhost:3000/auth/register?type=user
- **商家注册**: http://localhost:3000/auth/register?type=merchant

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

# 仅启动前端
cd frontend && npm run dev
```

## 贡献指南
欢迎通过提交 issue 或 PR 参与贡献，请查阅 [CONTRIBUTING.md](CONTRIBUTING.md) 获取详细流程。English version is available [here](CONTRIBUTING.en.md)。

## 许可证

本项目基于 MIT 许可证发布，详情见 [LICENSE](LICENSE)。English version is available [here](LICENSE.en)。
