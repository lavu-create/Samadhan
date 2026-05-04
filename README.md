# 📋 Samadhaan - Digital Complaint Management System

![Samadhaan Banner](https://img.shields.io/badge/Project-Samadhaan-blue?style=for-the-badge&logo=react)
![Status](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blueviolet?style=for-the-badge)

**Samadhaan** is a comprehensive, full-stack Digital Complaint Management System designed to streamline the process of lodging, tracking, and resolving complaints efficiently. It provides a seamless experience for users to report issues and for administrators to manage them, all while incorporating smart features like AI-based complaint moderation.

---

## 🎯 Problem Statement
Organizations (such as colleges, societies, or corporations) often rely on manual, paper-based, or fragmented email systems for complaint management. This leads to lost tickets, lack of transparency, slow resolution times, and poor tracking. Furthermore, administrators often face an influx of spam or meaningless complaints, making it difficult to focus on genuine issues.

**Samadhaan** solves this by providing a centralized digital platform with automated tracking, role-based dashboards, and AI-driven moderation to ensure only valid complaints reach the administration.

---

## ✨ Key Features

- 🔐 **Secure Authentication**: User login and registration with encrypted passwords (bcrypt) and JWT-based session management.
- 📝 **Smart Complaint Submission**: Submit categorized complaints with dynamic priority levels.
- 🤖 **AI-Based Spam Detection**: Server-side validation mechanism that automatically rejects meaningless, repetitive, or spam descriptions to ensure system integrity.
- 📊 **Interactive Dashboards**: 
  - **User**: Personal complaint tracking table with real-time status updates.
  - **Admin**: Comprehensive statistics, interactive charts (Chart.js), and workflow management.
- 👤 **Profile Management**: Customizable user profiles with secure password change functionality.
- export **Data Export**: Admins can export filtered complaint data into CSV format for offline reporting.
- 🛡️ **Role-Based Access Control (RBAC)**: Strict segregation between `User` and `Admin` permissions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), TypeScript, Tailwind CSS / Vanilla CSS | High-performance, responsive UI |
| **Backend** | Node.js, Express.js | Scalable RESTful API architecture |
| **Database** | MongoDB (Mongoose) | Flexible NoSQL database for structured data |
| **Testing** | Selenium WebDriver, Mocha | End-to-End (E2E) automated testing |
| **Security** | JWT, bcryptjs, CORS | Industry-standard security practices |

---

## 🏗️ System Architecture

The application follows a standard Client-Server architecture based on the MVC (Model-View-Controller) design pattern on the backend.

1. **Frontend (Client)**: Built with React, handles the User Interface and Client-side routing. It communicates with the backend via RESTful APIs using standard HTTP requests. State is managed seamlessly for a smooth UX.
2. **Backend (Server)**: Built with Node.js and Express. Handles business logic, authentication, AI spam validation, and data processing.
3. **Database (Storage)**: MongoDB stores user profiles and complaint records securely.

```text
[ React Frontend ] <--- JSON via REST API ---> [ Node.js + Express Backend ] <--- Mongoose ---> [ MongoDB ]
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: v14 or higher
- **MongoDB**: Local installation or MongoDB Atlas URI
- **Google Chrome**: For running Selenium E2E tests

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set your PORT, MONGO_URI, and JWT_SECRET

# Start the development server
npm run dev
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend-new

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will typically run at `http://localhost:5173`.

### 3. Running Selenium E2E Tests
```bash
# Navigate to the testing directory
cd e2e-tests

# Install testing dependencies
npm install

# Run the test suite (Make sure frontend and backend are running!)
npm test
```

---

## 🔌 Core API Endpoints

A fully-documented REST API powers the platform. Here are the core endpoints:

**Authentication**
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user and receive a JWT

**Complaints**
- `POST /api/complaints` - Submit a new complaint (Includes AI Spam Check)
- `GET /api/complaints/my` - Fetch logged-in user's complaints
- `GET /api/complaints` - Fetch all complaints (Admin Only)
- `PATCH /api/complaints/:id/status` - Update complaint status (Admin Only)

**Profile**
- `GET /api/profile/me` - Fetch profile details
- `PUT /api/profile/update` - Update profile information

---

## 🎓 Conclusion
Samadhaan successfully demonstrates a production-ready, full-stack application. It implements modern web development practices, robust security measures, and innovative features like automated E2E testing and AI-driven spam validation. It is fully prepared for real-world deployment in universities, housing societies, or corporate IT helpdesks.

---
*Developed for evaluation and lab submission.*
