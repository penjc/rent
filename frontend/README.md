# Casual Rent Frontend

Casual Rent 的现代化前端应用，基于 React + TypeScript + Vite + Ant Design 构建，支持用户端、商家端、管理端三端统一。

## 🚀 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 库**: Ant Design + Tailwind CSS
- **路由**: React Router Dom
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **日期处理**: Day.js

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/          # 组件
│   │   ├── common/         # 通用组件
│   │   ├── user/           # 用户端组件
│   │   ├── merchant/       # 商家端组件
│   │   └── admin/          # 管理端组件
│   ├── pages/              # 页面
│   │   ├── common/         # 通用页面 (登录、注册)
│   │   ├── user/           # 用户端页面
│   │   ├── merchant/       # 商家端页面
│   │   └── admin/          # 管理端页面
│   ├── services/           # API 服务
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── styles/             # 样式文件
│   └── assets/             # 静态资源
├── public/                 # 公共资源
└── package.json
```

## 🎯 功能特性

### 用户端 (/user)
- 📱 响应式设计，支持移动端和桌面端
- 🏠 首页展示：轮播广告、商品分类、精选商品
- 🔍 商品搜索和筛选
- 📝 商品详情查看
- 🛒 订单管理
- 👤 用户个人中心

### 商家端 (/merchant)
- 📊 商家仪表盘
- 📦 商品管理：发布、编辑、下架商品
- 📋 订单管理：查看和处理订单
- 📈 数据统计

### 管理端 (/admin)
- 🎛️ 管理仪表盘
- 👥 用户管理
- 🏪 商家审核和管理
- ✅ 商品审核
- 📊 平台数据统计

### 通用功能
- 🔐 多端统一登录注册
- 🔄 自动token刷新
- 📱 响应式布局
- 🎨 现代化UI设计

## 🛠️ 开发指南

### 环境要求
- Node.js >= 16
- npm >= 7

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🔧 配置说明

### API 代理配置
开发环境下，API 请求会自动代理到后端服务器 (http://localhost:8080)

### 环境变量
- `VITE_API_BASE_URL`: API 基础URL (可选，默认使用代理)

## 🎨 样式指南

### Ant Design + Tailwind CSS
- 使用 Ant Design 组件作为基础
- 使用 Tailwind CSS 进行快速样式开发
- 禁用了 Tailwind 的样式重置，避免与 Ant Design 冲突

### 色彩规范
- 主色：#1890ff (Ant Design 默认蓝色)
- 成功：#52c41a
- 警告：#faad14
- 错误：#f5222d

## 📱 路由结构

```
/                          # 重定向到用户端
├── /user                  # 用户端
│   ├── /                 # 首页
│   ├── /products         # 商品列表
│   ├── /products/:id     # 商品详情
│   ├── /orders           # 订单列表
│   └── /profile          # 个人资料
├── /merchant             # 商家端
│   ├── /                 # 仪表盘
│   ├── /products         # 商品管理
│   └── /orders           # 订单管理
├── /admin                # 管理端
│   ├── /                 # 仪表盘
│   ├── /users            # 用户管理
│   ├── /merchants        # 商家管理
│   └── /products         # 商品审核
└── /auth                 # 认证页面
    ├── /login            # 登录
    └── /register         # 注册
```

## 🔐 状态管理

使用 Zustand 进行状态管理：

- `useAuthStore`: 用户认证状态
- 更多store根据需要添加...

## 📦 API 服务

所有API服务位于 `src/services/` 目录：

- `api.ts`: 基础axios配置和拦截器
- `userService.ts`: 用户相关API
- `productService.ts`: 商品相关API
- 更多服务根据需要添加...

## 🚀 部署

### 构建和部署
```bash
# 构建
npm run build

# 部署到服务器
# 将 dist/ 目录的内容部署到 Web 服务器
```

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # API 代理
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤝 开发规范

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 组件规范
- 使用函数式组件 + Hooks
- 组件名使用 PascalCase
- 文件名与组件名保持一致

### API 规范
- 所有API调用都要有错误处理
- 使用 TypeScript 类型约束
- 统一的响应格式处理

## 📝 TODO

- [ ] 完善商品详情页面
- [ ] 实现订单流程
- [ ] 添加支付功能
- [ ] 完善商家端功能
- [ ] 完善管理端功能
- [ ] 添加单元测试
- [ ] 添加E2E测试
- [ ] 优化移动端体验
- [ ] 添加国际化支持

## 📄 License

MIT
