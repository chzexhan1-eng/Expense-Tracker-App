# Expense Tracker App 💰📊

A modern, full-stack expense tracking web application built with a responsive dashboard, 3D solar system parallax design, AI coaching, budgets, reporting, and customizable settings.

## 🚀 Features

- **Dashboard**: Interactive summary of recent transactions, current balance, and spending breakdown.
- **Transactions**: Full CRUD capabilities for adding, editing, and deleting income and expense transactions.
- **AI Coach**: Virtual financial assistant powered by custom rules and prompts to analyze spending behaviors.
- **Budgets**: Set category-specific monthly budgets and track real-time visual progress indicators.
- **Reports**: Informative, dynamic charts showing month-over-month comparisons and category allocations.
- **Settings**: Manage profile information, select native currencies, toggle dark/light themes, and configure alerts.

---

## 🛠️ Stack & Architecture

- **Frontend**: React, Vite, TypeScript, TailwindCSS, Recharts.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: SQLite (via Prisma ORM).

---

## ⚙️ Quick Start

### 1. Backend Server Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up database schema and seed mock data:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
   *The server runs at [http://localhost:5000](http://localhost:5000).*

### 2. Frontend Client Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development client:
   ```bash
   npm run dev
   ```
   *The app runs at [http://localhost:5173](http://localhost:5173).*
