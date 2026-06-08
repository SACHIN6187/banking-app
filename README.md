# 🏦 Vault — Secure Digital Banking Platform

A modern full-stack banking application that enables users to securely manage accounts, transfer funds, and track transactions through a clean and intuitive interface.

Built with a focus on security, scalability, and user experience, Vault implements OTP-based email verification, JWT authentication, and real-time transaction notifications.

---

## ✨ Features

### 🔐 Authentication & Authorization

- Secure user registration and login
- Email OTP verification
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes and APIs
- Secure session management

### 👤 User Management

- User onboarding workflow
- Profile and account management
- Account verification system

### 💳 Banking Operations

- Deposit and withdrawal tracking
- Money transfers between accounts
- Transaction history
- Account balance management
- Real-time transaction updates

### 📧 Email Notifications

- OTP verification emails
- Account registration confirmation
- Transaction notifications
- Security-related alerts

### 🛡️ Security

- Encrypted password storage
- JWT authentication
- Input validation
- Environment-based configuration
- Secure API architecture

---

## 🚀 Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (JSON Web Tokens)
- Bcrypt

### Email Service

- Nodemailer

### Deployment

- Vercel

---

## 📸 Application Preview

### Authentication

- User Registration
- Email OTP Verification
- Secure Login

### Dashboard

- Account Overview
- Balance Tracking
- Recent Transactions

### Banking Services

- Fund Transfers
- Transaction History
- Notification Center

> Add screenshots here after deployment.

---

## 📂 Project Structure

```bash
banking-app/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── types/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── config/
│
├── README.md
└── package.json
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SACHIN6187/banking-app.git

cd banking-app
```

---

### 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_email_app_password
```

Run the backend server:

```bash
npm start
```

or

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

---

## 🔄 User Flow

```text
Register Account
       │
       ▼
Enter Email
       │
       ▼
Receive OTP
       │
       ▼
Verify OTP
       │
       ▼
Create Password
       │
       ▼
Login
       │
       ▼
Access Dashboard
       │
       ▼
Manage Banking Activities
```

---

## 🔒 Security Architecture

### Password Protection

- Passwords hashed using bcrypt
- No plaintext password storage

### Authentication

- JWT-based authorization
- Protected API routes
- Token validation middleware

### Verification

- OTP-based email verification
- Expiry-controlled OTP generation

### Configuration

- Environment variable management
- Secret key isolation

---

## 🌟 Why Vault?

Vault was built to simulate the core functionalities of a modern digital banking system while following industry-standard security practices.

The project demonstrates:

- Full-stack application development
- Secure authentication flows
- REST API design
- Database modeling
- Transaction management
- Email service integration
- Production deployment workflows

---

## 🛠 Future Enhancements

- Two-Factor Authentication (2FA)
- Password Recovery System
- Bank Statement Generation (PDF)
- Real-Time Notifications using WebSockets
- Admin Dashboard
- Fraud Detection Alerts
- Scheduled Payments
- Multi-Currency Support

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to your branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

### Sachin Yadav

Full-Stack Developer passionate about building scalable and secure web applications.

GitHub: https://github.com/SACHIN6187

---

⭐ If you found this project useful, consider giving it a star on GitHub.
