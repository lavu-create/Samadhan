# 📋 Samadhaan — Digital Complaint Management System

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-6D28D9?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Testing-Selenium%20%7C%20Mocha%20%7C%20TestNG-FF6C37?style=for-the-badge&logo=selenium"/>
  <img src="https://img.shields.io/badge/Status-Complete-22C55E?style=for-the-badge"/>
</p>

**Samadhaan** is a full-stack Digital Complaint Management System that allows users to submit, track, and manage complaints, while giving administrators complete control over resolution workflows — all on one centralized platform.

> 🔗 **Live link:** [https://lavu-create.github.io/Samadhan/](https://lavu-create.github.io/Samadhan/)

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture](#️-system-architecture)
- [Folder Structure](#-folder-structure)
- [Setup & Installation](#-setup--installation)
- [User Roles](#-user-roles)
- [AI Spam Detection](#-ai-spam-detection)
- [API Reference](#-api-reference)
- [Automated Testing](#-automated-testing)
- [TestNG Reports](#-testng-reports)
- [Future Improvements](#-future-improvements)
- [Contributors](#-contributors)

---

## 🎯 Problem Statement

Organizations — colleges, societies, IT helpdesks — still rely on fragmented email threads or paper-based processes for complaint handling. This creates lost tickets, lack of transparency, slow resolution, and an influx of spam complaints that bury legitimate ones.

**Samadhaan** solves this with:
- A centralized digital platform for logging and tracking complaints
- Role-based dashboards for users and admins
- Server-side AI-inspired spam filtering to reject meaningless submissions automatically

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login/register with bcrypt password hashing |
| 🛡️ **Role-Based Access Control** | Strict separation between `User` and `Admin` permissions |
| 📝 **Complaint Submission** | Categorized complaints with priority, location, and optional photo attachments (up to 3) |
| 🤖 **AI Spam Detection** | Server-side rule-based engine rejects meaningless or repetitive descriptions before saving |
| 📊 **Admin Dashboard** | Statistics, Chart.js visualizations, status updates, CSV data export |
| 🗂️ **User Dashboard** | Personal complaint table with real-time status and search/filter |
| 👤 **Profile Management** | Update display name; profile photo upload stored via localStorage |
| 📷 **Photo Attachments** | Capture via webcam or upload from device (max 3 images, 2MB each) |
| 📍 **GPS Location** | Auto-detect current location for complaint geolocation tagging |
| 🕵️ **Anonymous Submissions** | Users can submit complaints without revealing their identity |
| 📁 **CSV Export** | Admins can export filtered complaint records to CSV |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Material UI (MUI v7) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (via Mongoose) |
| **Auth & Security** | JWT, bcryptjs, CORS |
| **Charts** | Chart.js |
| **E2E Testing** | Selenium WebDriver, Mocha, Chai |
| **Java Testing** | TestNG 7.9, Selenium Java 4.18, WebDriverManager |
| **Build & Reports** | Apache Maven, Apache ANT, XSLT |

---

## 🏗️ System Architecture

```
┌─────────────────────────┐         ┌──────────────────────────┐         ┌────────────┐
│   React + Vite Frontend │ ──REST─▶ │  Node.js + Express API   │ ──ORM──▶ │  MongoDB   │
│   (localhost:5173)      │ ◀──JSON── │  (localhost:5001)        │         │  (Atlas)   │
└─────────────────────────┘         └──────────────────────────┘         └────────────┘
                                              │
                                    ┌─────────┴────────┐
                                    │  spamDetector.js │
                                    │  (AI filter)     │
                                    └──────────────────┘
```

The backend follows an **MVC pattern**:
- **Models** — Mongoose schemas for `User` and `Complaint`
- **Controllers** — Business logic including spam check, RBAC enforcement
- **Routes** — Express routers with `express-validator` middleware

---

## 📁 Folder Structure

```
Samadhaan/
├── backend/                    # Node.js + Express API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│       └── spamDetector.js     # AI-inspired spam detection engine
├── frontend-new/               # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── context/            # AuthContext (JWT + profilePic sync)
│       ├── pages/
│       └── theme/
├── e2e-tests/                  # Selenium + Mocha E2E tests
│   └── tests/
│       └── basic.spec.js
└── testng-reports-demo/        # Java TestNG suite (lab report demo)
    ├── src/test/java/
    │   └── SamadhaanTest.java
    ├── pom.xml
    ├── testng.xml
    ├── build.xml
    └── testng-results.xsl
```

---

## 🚀 Setup & Installation

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| MongoDB | Atlas or local | Atlas URI in `.env` |
| Java JDK | 11+ | For TestNG suite only |
| Maven | 3.6+ | For TestNG suite only |
| ANT | 1.10+ | For XSLT report only |
| Google Chrome | Latest | Selenium tests |

---

### 1. Clone the Repository

```bash
git clone https://github.com/lavu-create/Samadhan.git
cd Samadhan
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
NODE_ENV=development
```

Start the backend:

```bash
npm start
# API running at http://localhost:5001
```

### 3. Frontend Setup

```bash
cd frontend-new
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 👥 User Roles

### 👤 User
- Register and log in
- Submit complaints with category, priority, location, and optional photo attachments
- Track status of their own complaints in real-time
- Edit profile name and photo
- Submit anonymously if needed

### 🔧 Admin
- View and manage all complaints from all users
- Update complaint status (`Pending` → `In Progress` → `Resolved`) and assign a handler
- Access dashboard charts showing category/status distribution
- Export complaints to CSV
- Cannot be registered through the normal flow — admin accounts are seeded via `backend/utils/seedAdmin.js`

---

## 🤖 AI Spam Detection

All complaint descriptions pass through `backend/utils/spamDetector.js` **before** being saved to the database. If spam is detected, the server responds with `HTTP 400` and the complaint is discarded.

### Detection Rules

| Rule | Example Caught |
|---|---|
| Too short (< 15 characters) | `"ok"`, `"test"` |
| Single repeated character | `"aaaaaaaaaaaaa"` |
| All words identical | `"random random random"` |
| Only spam/test words | `"asdf asdf asdf"`, `"dummy complaint"` |
| Keyboard mash patterns | `"qwertyuiop"`, `"asdfghjkl"` |
| Low unique-word ratio | Highly repetitive phrases |
| Banned phrase list | `"test test test"`, `"hello hello hello"` |

### API Response on Spam

```json
{
  "success": false,
  "message": "Complaint rejected: Please enter a meaningful complaint description."
}
```

Valid complaints like *"WiFi is not working in Computer Lab since morning"* pass all rules and are saved normally.

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | Private | Get current user info |

### Complaints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/complaints` | User | Submit complaint (spam check applied) |
| `GET` | `/api/complaints/my` | User | Get own complaints |
| `GET` | `/api/complaints` | Admin | Get all complaints |
| `PATCH` | `/api/complaints/:id/status` | Admin | Update status / assign handler |

### Profile
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/profile/me` | Private | Get profile |
| `PUT` | `/api/profile/update` | Private | Update name |

### Admin / Stats / Export
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stats` | Admin | Dashboard statistics |
| `GET` | `/api/export/csv` | Admin | Export complaints as CSV |

---

## 🧪 Automated Testing

### Selenium + Mocha E2E Tests

The `e2e-tests/` folder contains a Selenium WebDriver + Mocha test suite covering the full user journey.

**Test Cases:**
| # | Test | Expected |
|---|---|---|
| 1 | `/dashboard` without login | Redirects to `/login` |
| 2 | `/profile` without login | Redirects to `/login` |
| 3 | Login as User | Lands on `/dashboard` |
| 4 | Valid complaint submission | Success alert visible |
| 5 | Logout | Clears token, redirects to `/` |
| 6 | Spam complaint submission | Backend rejects with error alert |
| 7 | Login as Admin | Lands on `/admin` |

**Run the tests:**

```bash
# Ensure frontend (port 5173) and backend (port 5001) are running first

cd e2e-tests
npm install

# Run headless (CI mode)
npm test

# Run with credentials (configurable)
TEST_USER_EMAIL='user@example.com' \
TEST_USER_PASSWORD='yourpassword' \
npm test

# Run with visible browser (demo mode)
DEMO=true npm test
```

---

## 📊 TestNG Reports

The `testng-reports-demo/` folder contains a separate **Java + Maven + TestNG** test suite for generating lab-standard test reports. It does **not** modify the main application.

### TestNG Test Cases

| # | Method | Expected |
|---|---|---|
| TC-01 | `testHomepageLoads` | Page source contains "samadhaan" |
| TC-02 | `testLoginPageRenders` | Email input visible on `/login` |
| TC-03 | `testDashboardRedirectsToLogin` | `/dashboard` → `/login` |
| TC-04 | `testProfileRedirectsToLogin` | `/profile` → `/login` |
| TC-05 | `testIntentionalFailForDemoReport` | ❌ FAIL (intentional, for report demo) |

### Run TestNG Tests

```bash
# Ensure frontend is running at localhost:5173

cd testng-reports-demo
mvn test
```

### Generated Reports

| Report | Location | Description |
|---|---|---|
| **Emailable Report** | `target/surefire-reports/emailable-report.html` | Compact single-file HTML report, ready to email |
| **Index Report** | `target/surefire-reports/index.html` | Full TestNG HTML report with suite breakdown |
| **XSLT Report** | `target/surefire-reports/XSLT_Report.html` | Custom styled report (generated via ANT) |

### Generate XSLT Report via ANT

After running `mvn test`:

```bash
ant report
# Output: target/surefire-reports/XSLT_Report.html
```

The XSLT report displays Total / Passed / Failed / Skipped counts in summary cards with a full test-method table — styled using a custom dark-themed XSL stylesheet (`testng-results.xsl`).

---

## 🔮 Future Improvements

- [ ] Email notifications to users when complaint status changes
- [ ] Admin-to-user chat / comment thread on complaints
- [ ] Mobile app (React Native) for on-the-go submission
- [ ] OCR-based attachment text extraction for richer spam detection
- [ ] Multi-language (i18n) support
- [ ] Dockerized deployment with `docker-compose`

---

## 👨‍💻 Contributors

| Name | Role |
|---|---|
| **Lavanya** | Full-Stack Developer — Frontend, Backend, Testing, Reports |

---

<p align="center">
  Built with ❤️ as a full-stack portfolio project · <a href="https://github.com/lavu-create/Samadhan">github.com/lavu-create/Samadhan</a>
</p>
