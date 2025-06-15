<div align="center">

# Casual Rent - Second-hand Rental Platform

</div>

<div align="center">
  <img src="assets/rent.png" alt="Casual Rent" width="200">
  
  <p>A modern second-hand rental platform connecting renters and merchants</p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.18-brightgreen.svg)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)](https://www.mysql.com/)

  [Chinese README](README.md)

[//]: # (  | [Live Demo]&#40;https://demo.casualrent.com&#41; | [API Docs]&#40;http://localhost:8080/swagger-ui.html&#41;)

</div>

<details >
<summary><strong>📖 Table of Contents</strong></summary>

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Application Pages](#-application-pages)
- [Development Tools](#-development-tools)
- [Contributing](#-contributing)
- [FAQ](#-faq)
- [Changelog](#-changelog)
- [License](#-license)

</details>

## 🎯 About

Casual Rent is a comprehensive second-hand rental platform designed to provide convenient rental services. The platform supports three roles:
- **User Side**: Browse products, place rental orders, manage orders
- **Merchant Side**: Publish products, process orders, data analytics
- **Admin Side**: Platform management, user review, data monitoring

### 🌟 Highlights
- 🎨 **Modern UI Design**: Based on Ant Design + Tailwind CSS
- 📱 **Responsive Layout**: Perfect adaptation for mobile and desktop
- 🔐 **Secure Authentication**: Multi-role permission management
- 💬 **Real-time Communication**: Instant chat between users and merchants
- 📊 **Data Visualization**: Rich statistical charts
- 🚀 **High Performance**: Frontend-backend separation architecture

## 🎨 Features

### 👤 User Side
- 🏠 **Homepage**: Product categories, featured items, trending recommendations
- 🔍 **Smart Search**: Keyword search, multi-dimensional filtering, intelligent sorting
- 📱 **Responsive Design**: Perfect support for mobile and desktop access
- 🛒 **Order Management**: Online ordering, payment integration, real-time order tracking
- 👤 **User Center**: Personal information management, identity verification, security settings
- 📍 **Address Management**: CRUD operations for shipping addresses, default address setting
- ❤️ **Favorites**: Product favorites, favorites management
- 💬 **Instant Messaging**: Real-time chat with merchants, message notifications

### 🏪 Merchant Side
- 📊 **Merchant Dashboard**: Business data overview, revenue statistics, trend analysis
- 📦 **Product Management**: Product publishing, editing, listing/delisting, inventory management
- 📋 **Order Processing**: Order viewing, status updates, shipping management
- 📈 **Data Analytics**: Revenue reports, product popularity, user analysis
- 📍 **Address Management**: Shipping address management (for product returns)
- 💬 **Customer Communication**: Real-time customer inquiry responses, multi-channel conversation management
- 🏆 **Merchant Certification**: Qualification certification, credit rating

### 🛡️ Admin Side
- 🎛️ **Admin Dashboard**: Platform operational data, user activity, transaction statistics
- 👥 **User Management**: User information viewing, status management, permission control
- 🏪 **Merchant Review**: Merchant qualification review, certification management, credit assessment
- ✅ **Product Review**: Product information review, listing control, quality supervision
- 📂 **Category Management**: CRUD operations for product categories, status management, sorting settings
- 📊 **Data Monitoring**: System performance monitoring, exception alerts, log analysis

## 🚀 Tech Stack

### Backend
- **Core Framework**: Spring Boot 2.7.18
- **Data Access**: MyBatis Plus 3.5.3
- **Database**: MySQL 5.7.24
- **Security**: Spring Security
- **File Storage**: Tencent Cloud COS
- **API Documentation**: SpringDoc OpenAPI 3
- **Build Tool**: Maven 3.6+
- **Configuration**: Spring Dotenv

### Frontend
- **Core Framework**: React 19.1.0 + TypeScript 5.8.3
- **Build Tool**: Vite 6.3.5
- **UI Library**: Ant Design 5.25.4
- **CSS Framework**: Tailwind CSS 3.4.17
- **Routing**: React Router Dom 7.6.2
- **State Management**: Zustand 5.0.5
- **HTTP Client**: Axios 1.9.0
- **Styling**: Styled Components 6.1.19
- **Date Handling**: Day.js 1.11.13

### Development Tools
- **Code Standards**: ESLint + TypeScript ESLint
- **Automated Deployment**: Shell Scripts
- **Version Control**: Git
- **Package Management**: npm

## 📁 Project Structure
```text
rent/
├── 📁 src/                          # Backend source code
│   ├── main/java/com/casual/rent/
│   │   ├── 📁 common/              # Common components (response wrapper, exception handling)
│   │   ├── 📁 config/              # Configuration classes (database, security, COS)
│   │   ├── 📁 controller/          # REST API controllers
│   │   ├── 📁 entity/              # JPA entities
│   │   ├── 📁 mapper/              # MyBatis data access layer
│   │   ├── 📁 service/             # Business logic layer
│   │   └── 📁 util/                # Utility classes
│   ├── main/resources/
│   │   ├── 📁 mapper/              # MyBatis XML mapping files
│   │   ├── 📄 application.yml      # Main configuration file
│   │   └── 📄 application-pro.yml  # Production environment configuration
│   └── test/                       # Test code
├── 📁 frontend/                     # Frontend source code
│   ├── 📁 src/
│   │   ├── 📁 pages/               # Page components
│   │   │   ├── 📁 user/           # User side pages
│   │   │   ├── 📁 merchant/       # Merchant side pages
│   │   │   ├── 📁 admin/          # Admin side pages
│   │   │   └── 📁 common/         # Common pages
│   │   ├── 📁 components/          # Reusable components
│   │   │   ├── 📁 common/         # Common components
│   │   │   ├── 📁 user/           # User side components
│   │   │   ├── 📁 merchant/       # Merchant side components
│   │   │   └── 📁 admin/          # Admin side components
│   │   ├── 📁 services/            # API service layer
│   │   ├── 📁 stores/              # Zustand state management
│   │   ├── 📁 types/               # TypeScript type definitions
│   │   ├── 📁 utils/               # Utility functions
│   │   ├── 📁 hooks/               # Custom React Hooks
│   │   ├── 📁 contexts/            # React Context
│   │   └── 📁 styles/              # Style files
│   ├── 📁 public/                  # Static assets
│   └── 📄 package.json             # Frontend dependencies configuration
├── 📁 sql/                         # Database scripts
├── 📁 assets/                      # Project assets
├── 📁 .github/                     # GitHub configuration
│   ├── 📁 ISSUE_TEMPLATE/          # Issue templates
│   └── 📄 PULL_REQUEST_TEMPLATE.md # PR template
├── 📄 start-all.sh                 # One-click startup script
├── 📄 stop-all.sh                  # Stop services script
├── 📄 pom.xml                      # Maven configuration
├── 📄 .env.example                 # Environment variables template
└── 📄 README.md                    # Project documentation
```

## 🚀 Quick Start

### 📋 Requirements
- **Java**: JDK 8+ (JDK 11 recommended)
- **Node.js**: 22+ (Latest LTS recommended)
- **MySQL**: 5.7+ (8.0+ recommended)
- **Maven**: 3.6+
- **Git**: For code management

### 🛠️ Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/penjc/rent.git
cd rent
```

#### 2. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE rent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import database structure and initial data
mysql -u root -p rent < sql/database.sql
```

#### 3. Backend Configuration
```bash
# Edit configuration file, modify database connection info
vim src/main/resources/application-pro.yml
```

Configuration example:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rent?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

#### 4. Tencent Cloud COS Configuration (Optional)
```bash
# Copy environment variables template
cp .env.example .env

# Edit environment variables file
vim .env
```

Fill in COS configuration:
```env
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_COS_REGION=your_region
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_DOMAIN=your_cos_domain
```

#### 5. Frontend Dependencies Installation
```bash
cd frontend
npm install
# or use yarn
yarn install
cd ..
```

#### 6. Build Backend
```bash
mvn clean compile
```

#### 7. One-click Startup
```bash
# Grant execution permissions to scripts
chmod +x start-all.sh stop-all.sh

# Start all services
./start-all.sh
```

#### 8. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/api/swagger-ui.html

#### 9. Default Accounts
```
Admin: admin / admin123
```

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Build image
docker build -t casual-rent .

# Run container
docker run -d -p 8080:8080 -p 3000:3000 casual-rent
```

### Production Deployment
```bash
# Backend packaging
mvn clean package -DskipTests

# Frontend build
cd frontend
npm run build

# Deploy to server
scp target/rent-*.jar user@server:/path/to/deploy/
scp -r frontend/dist user@server:/path/to/nginx/html/
```

## 📚 API Documentation

The project integrates SpringDoc OpenAPI 3, providing complete API documentation:

- **Local Access**: http://localhost:8080/api/swagger-ui.html
- **API JSON**: http://localhost:8080/api/v3/api-docs

### Main API Endpoints
- **User Management**: `/api/users/*`
- **Merchant Management**: `/api/merchants/*`
- **Product Management**: `/api/products/*`
- **Order Management**: `/api/orders/*`
- **Category Management**: `/api/categories/*`
- **File Upload**: `/api/upload/*`

## 📱 Application Pages

### 👤 User Side
- **Home**: http://localhost:3000/user
- **Products**: http://localhost:3000/user/products
- **Product Detail**: http://localhost:3000/user/products/:id
- **Orders**: http://localhost:3000/user/orders
- **Addresses**: http://localhost:3000/user/addresses
- **Favorites**: http://localhost:3000/user/favorites
- **Messages**: http://localhost:3000/user/messages
- **Profile**: http://localhost:3000/user/profile

### 🏪 Merchant Side
- **Dashboard**: http://localhost:3000/merchant/dashboard
- **Products**: http://localhost:3000/merchant/products
- **Orders**: http://localhost:3000/merchant/orders
- **Addresses**: http://localhost:3000/merchant/addresses
- **Messages**: http://localhost:3000/merchant/messages
- **Certification**: http://localhost:3000/merchant/certification
- **Statistics**: http://localhost:3000/merchant/statistics

### 🛡️ Admin Side
- **Dashboard**: http://localhost:3000/admin
- **Users**: http://localhost:3000/admin/users
- **Merchants**: http://localhost:3000/admin/merchants
- **Products**: http://localhost:3000/admin/products
- **Orders**: http://localhost:3000/admin/orders
- **Categories**: http://localhost:3000/admin/categories
- **Settings**: http://localhost:3000/admin/settings

### 🔐 Authentication Pages
- **User Login**: http://localhost:3000/auth/login?type=user
- **Merchant Login**: http://localhost:3000/auth/login?type=merchant
- **Admin Login**: http://localhost:3000/auth/login?type=admin
- **User Register**: http://localhost:3000/auth/register?type=user
- **Merchant Register**: http://localhost:3000/auth/register?type=merchant

## 🔧 Development Tools

### Service Management
```bash
# Start all services
./start-all.sh

# Stop all services
./stop-all.sh

# Backend only
mvn clean package -DskipTests
java -jar target/rent-*.jar

# Frontend only
cd frontend && npm run dev

# Backend hot reload (development mode)
mvn spring-boot:run

# Frontend hot reload
cd frontend && npm run dev
```

### Code Quality
```bash
# Frontend code linting
cd frontend
npm run lint

# Frontend code formatting
npm run lint:fix

# Backend code checking
mvn checkstyle:check
```

### Database Management
```bash
# Backup database
mysqldump -u root -p rent > backup.sql

# View database logs
tail -f /var/log/mysql/error.log
```

## 🤝 Contributing

We welcome all forms of contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Contribution Process
1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Standards
- Follow existing code style
- Add appropriate tests
- Update relevant documentation
- Ensure all tests pass

## ❓ FAQ

<details>
<summary><strong>Q: Port occupation error on startup?</strong></summary>

A: Check port usage:
```bash
# Check port 8080
lsof -i :8080
# Check port 3000  
lsof -i :3000
# Kill occupying process
kill -9 <PID>
```
</details>

<details>
<summary><strong>Q: Database connection failed?</strong></summary>

A: Please check:
1. Whether MySQL service is started
2. Whether database configuration is correct
3. Whether database user has sufficient permissions
4. Firewall settings
</details>

<details>
<summary><strong>Q: Frontend page is blank?</strong></summary>

A: Possible solutions:
1. Check console error messages
2. Confirm if backend API is working properly
3. Clear browser cache
4. Check network connection
</details>

<details>
<summary><strong>Q: File upload failed?</strong></summary>

A: Please check:
1. Whether Tencent Cloud COS configuration is correct
2. Bucket permission settings
3. Network connection status
4. File size limitations
</details>

## 📝 Changelog

### v1.0.0 (2024-01-15)
- 🎉 Initial project release
- ✨ Complete user, merchant, admin functionality
- 🔐 User authentication and permission management
- 💬 Real-time chat functionality
- 📊 Data statistics and visualization

### Planned Features
- [ ] Mobile APP
- [ ] Alipay/WeChat Pay integration
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Product recommendation algorithm
- [ ] Data analytics dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.en](LICENSE) file for details.

## 👨‍💻 Author

**Jiancheng PENG**
- 📧 Email: penjc204@gmail.com
- 🌐 Website: https://pengjiancheng.com
- 💼 GitHub: [@penjc](https://github.com/penjc)

## 🙏 Acknowledgments

Thanks to all developers who contributed to this project!

- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [React](https://reactjs.org/) - Frontend framework
- [Ant Design](https://ant.design/) - UI component library
- [MyBatis Plus](https://baomidou.com/) - ORM framework

---

<div align="center">
  <p>If this project helps you, please give us a ⭐️</p>
  <p>Made with ❤️ by <a href="https://pengjiancheng.com">penjc</a></p>
</div>
