# 💰 Account Management System

A full-stack monorepo application for managing financial accounts, transactions, and balances.

---

## 🚀 Project Overview

The system provides core account management functionality, including:

### Key Features

- Creating accounts linked to persons
- Performing deposits and withdrawals
- Tracking transaction history
- Viewing account balance and statements

---

## 🛠 Tech Stack

- **Backend:** NestJS (Node.js,OOP style framework)
- **Frontend:** React.js, Vite, CSS
- **Database:** PostgreSQL (Relational data integrity)
- **ORM:** TypeORM
- **Infrastructure:** Docker & Docker Compose
- **Language:** TypeScript (Strict mode)

---

## 📂 Project Structure

This is a **Monorepo** managed for simplicity and shared type definitions:

```text
├── backend/     # NestJS API, Database logic, and Seeds
├── frontend/    # React + Vite application
├── docker-compose.yml
└── README.md
```

## ⚡ Quick Start Guide

### 1. Clone the repository

```bash
git clone git@github.com:raday146/Account-Management.git
cd Account-Management
```

### 2. Start the system

```bash
docker-compose up -d

```

### 3. Seed the database

⚠️ Run this before using the system to create initial data (persons, accounts, and transactions).

```bash
cd backend
npm run seed
```

#### 4. Open the application

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3000>

## 📖 API Endpoints

```text
Method Endpoint Description
POST /accounts Create a new account
POST /accounts/:id/deposit Deposit money into an account
POST /accounts/:id/withdraw Withdraw money from an account
GET /accounts/:id/balance Get current account balance
PATCH /accounts/:id/block Block an account from transactions
GET /accounts/:id/statement Get account statement
```

## 🏗 Design Decisions

```text
Monorepo Structure: Backend and Frontend are kept in one repository for simplicity and easier management.
Decimal Precision: Using decimal (numeric) type in PostgreSQL for monetary values to avoid floating-point issues.
Concurrency Safety: Transactions + pessimistic locking ensure balance integrity during concurrent operations.
Simple State Management: Lightweight and predictable state handling on the frontend.
```

📝 Notes

```text
Seeding: Make sure to run the seed command before using the system.
Statement Filtering: A date range is required when fetching account statements.
```
