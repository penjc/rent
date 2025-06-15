![Casual Rent](assets/rent.png)

# Casual Rent - Second-hand Rental Platform

[中文版本](README.md)

## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Quick Start](#quick-start)
- [Pages](#pages)
- [Dev Tools](#dev-tools)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Tech Stack

### Backend
- **Framework**: Spring Boot 2.7.x
- **ORM**: MyBatis Plus
- **Database**: MySQL 5.7+
- **Build**: Maven

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: Ant Design + Tailwind CSS
- **Router**: React Router Dom
- **State**: Zustand
- **HTTP**: Axios

## 📁 Project Structure
```text
rent/
├── src/
│   ├── main/java/com/casual/rent/
│   │   ├── common/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── entity/
│   │   ├── mapper/
│   │   ├── service/
│   │   └── util/
│   └── main/resources/
│       ├── mapper/
│       └── application.yml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── user/
│   │   │   ├── merchant/
│   │   │   ├── admin/
│   │   │   └── common/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
├── sql/
├── start-all.sh
├── stop-all.sh
└── pom.xml
```

## 🎨 Features

### User Side
- 🏠 **Home**: Categories and featured items
- 🔍 **Search**: Keyword, filtering and sorting
- 📱 **Responsive**: Mobile and desktop support
- 🛒 **Orders**: Place order, pay, track status
- 👤 **Profile**: Personal info and verification
- 📍 **Address**: Manage shipping address
- 💬 **Chat**: Real-time chat with merchants

### Merchant Side
- 📊 **Dashboard**: Business overview
- 📦 **Products**: Publish, edit, remove
- 📋 **Orders**: View and process orders
- 📈 **Statistics**: Income and popularity
- 📍 **Address**: Manage return addresses
- 💬 **Communication**: Reply to customers

### Admin Side
- 🎛️ **Dashboard**: Platform data
- 👥 **User Management**
- 🏪 **Merchant Review**
- ✅ **Product Review**
- 📂 **Category Management**

## 🚀 Quick Start

### Requirements
- **Java**: JDK 8+
- **Node.js**: 22+
- **MySQL**: 5.7+
- **Maven**: 3.6+

### Steps
1. **Clone**
   ```bash
   git clone https://github.com/penjc/rent
   cd rent
   ```
2. **Database**

   Create database and tables with [sql](sql/database.sql).
3. **Config**
   ```yaml
   # src/main/resources/application-pro.yml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/rent
       username: your_username
       password: your_password
   ```
4. **COS**

   Copy `.env.example` to `.env` and fill settings. Set bucket public-read.
5. **Install frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
6. **Build backend**
   ```bash
   mvn clean compile
   ```
7. **Start**
   ```bash
   ./start-all.sh
   ```
8. **Visit**
   - Frontend: http://localhost:3000
   - API: http://localhost:8080/api
9. **Update**
   ```bash
   git pull origin main
   ```

## 📱 Pages

### User
- **Home**: http://localhost:3000/user
- **Products**: http://localhost:3000/user/products
- **Orders**: http://localhost:3000/user/orders
- **Addresses**: http://localhost:3000/user/addresses
- **Favorites**: http://localhost:3000/user/favorites
- **Messages**: http://localhost:3000/user/messages
- **Profile**: http://localhost:3000/user/profile/

### Merchant
- **Dashboard**: http://localhost:3000/merchant/dashboard
- **Products**: http://localhost:3000/merchant/products
- **Orders**: http://localhost:3000/merchant/orders
- **Addresses**: http://localhost:3000/merchant/addresses
- **Messages**: http://localhost:3000/merchant/messages
- **Certification**: http://localhost:3000/merchant/certification

### Admin
- **Dashboard**: http://localhost:3000/admin
- **Users**: http://localhost:3000/admin/users
- **Merchants**: http://localhost:3000/admin/merchants
- **Products**: http://localhost:3000/admin/products
- **Orders**: http://localhost:3000/admin/orders
- **Categories**: http://localhost:3000/admin/categories

### Auth
- **User Login**: http://localhost:3000/auth/login?type=user
- **Merchant Login**: http://localhost:3000/auth/login?type=merchant
- **Admin Login**: http://localhost:3000/auth/login?type=admin
- **User Register**: http://localhost:3000/auth/register?type=user
- **Merchant Register**: http://localhost:3000/auth/register?type=merchant

## 🔧 Dev Tools
```bash
# start all
./start-all.sh

# stop all
./stop-all.sh

# backend only
mvn clean package -DskipTests
java -jar target/rent-*.jar

# frontend only
cd frontend && npm run dev
```

## Contributing
Please read [CONTRIBUTING.en.md](CONTRIBUTING.en.md) for details. Chinese version [here](CONTRIBUTING.md).

## License
Released under the MIT License, see [LICENSE.en](LICENSE.en). Chinese version [here](LICENSE).
