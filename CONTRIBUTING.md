# 🤝 贡献指南

感谢您对 Casual Rent 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 开发新功能
- 🧪 编写测试
- 🎨 改进UI/UX设计

## 📋 目录

- [开始之前](#开始之前)
- [开发环境设置](#开发环境设置)
- [贡献流程](#贡献流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request指南](#pull-request指南)
- [Issue指南](#issue指南)
- [社区准则](#社区准则)

## 🚀 开始之前

### 📖 了解项目
在开始贡献之前，请：
1. 阅读 [README.md](README.md) 了解项目概况
2. 浏览现有的 [Issues](https://github.com/penjc/rent/issues) 和 [Pull Requests](https://github.com/penjc/rent/pulls)

### 🔍 寻找贡献机会
- 查看标有 `good first issue` 的问题，适合新贡献者
- 查看标有 `help wanted` 的问题，需要社区帮助
- 查看标有 `bug` 的问题，需要修复
- 查看标有 `enhancement` 的问题，需要新功能开发

## 🛠️ 开发环境设置

### 环境要求
- **Java**: JDK 8+
- **Node.js**: 22+
- **MySQL**: 5.7+
- **Maven**: 3.6+
- **Git**: 最新版本

### 快速设置
```bash
# 1. Fork 并克隆仓库
git clone https://github.com/your-username/rent.git
cd rent

# 2. 添加上游仓库
git remote add upstream https://github.com/penjc/rent.git

# 3. 安装依赖
cd frontend && npm install && cd ..
mvn clean compile

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件填写配置

# 5. 启动开发环境
./start-all.sh
```

## 🔄 贡献流程

### 1. 创建Issue（可选）
如果您要修复的Bug或添加的功能还没有对应的Issue，建议先创建一个Issue进行讨论。

### 2. Fork 和 Clone
```bash
# Fork 项目到您的GitHub账户
# 然后克隆到本地
git clone https://github.com/your-username/rent.git
```

### 3. 创建分支
```bash
# 从main分支创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 4. 开发和测试
- 编写代码
- 添加或更新测试
- 确保所有测试通过
- 遵循代码规范

### 5. 提交变更
```bash
git add .
git commit -m "feat: add new feature description"
```

### 6. 推送和创建PR
```bash
git push origin feature/your-feature-name
# 然后在GitHub上创建Pull Request
```

## 📏 代码规范

### 后端 (Java)
- 遵循 [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- 使用 4 个空格缩进
- 类名使用 PascalCase
- 方法名和变量名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

### 前端 (TypeScript/React)
- 遵循 [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- 使用 2 个空格缩进
- 组件名使用 PascalCase
- 文件名使用 kebab-case
- 使用 TypeScript 严格模式

### 通用规范
- 所有代码必须有适当的注释
- 公共API必须有文档
- 复杂逻辑必须有单元测试
- 提交前运行 linter 和格式化工具

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI/CD相关

### 示例
```bash
feat(user): add user profile management
fix(api): resolve authentication token expiration
docs(readme): update installation instructions
```

## 🔍 Pull Request 指南

### PR 标题
- 使用清晰、描述性的标题
- 遵循提交规范格式
- 包含相关的Issue编号（如果有）

### PR 描述
- 使用提供的PR模板
- 详细描述变更内容和原因
- 包含测试说明
- 添加相关截图（如果有UI变更）

### PR 检查清单
提交PR前请确保：
- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 没有合并冲突
- [ ] PR描述完整清晰

## 🐛 Issue 指南

### 报告Bug
使用 [Bug报告模板](.github/ISSUE_TEMPLATE/bug_report.md)，包含：
- 清晰的Bug描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息
- 错误日志（如果有）

### 功能请求
使用 [功能请求模板](.github/ISSUE_TEMPLATE/feature_request.md)，包含：
- 功能描述
- 使用场景
- 预期收益
- 实现建议（可选）

## 👥 社区准则

### 行为准则
- 尊重所有参与者
- 使用友善和包容的语言
- 接受建设性的批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 沟通指南
- 使用清晰、简洁的语言
- 提供足够的上下文信息
- 及时回应评论和反馈
- 保持专业和友好的态度

## 🎯 开发技巧

### 调试技巧
```bash
# 后端调试
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"

# 前端调试
cd frontend && npm run dev
```

### 测试技巧
```bash
# 运行后端测试
mvn test

# 运行前端测试
cd frontend && npm test

# 运行特定测试
mvn test -Dtest=UserServiceTest
```

## 📞 获取帮助

如果您在贡献过程中遇到问题，可以：

1. 查看 [FAQ](README.md#常见问题)
2. 搜索现有的 [Issues](https://github.com/penjc/rent/issues)
3. 创建新的 Issue 寻求帮助

## 🙏 致谢

感谢所有为 Casual Rent 项目做出贡献的开发者！您的贡献让这个项目变得更好。

