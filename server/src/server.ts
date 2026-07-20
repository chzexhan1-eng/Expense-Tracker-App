import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware/auth';
import * as authController from './controllers/authController';
import * as transactionController from './controllers/transactionController';
import * as categoryController from './controllers/categoryController';
import * as accountController from './controllers/accountController';
import * as recurringController from './controllers/recurringController';
import * as analyticsController from './controllers/analyticsController';
import * as notificationController from './controllers/notificationController';
import * as goalController from './controllers/goalController';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Private Routes (Require Token Authentication)
app.use('/api', authenticateToken as any);

// Auth Profile Management
app.get('/api/auth/profile', authController.getProfile as any);
app.put('/api/auth/profile', authController.updateProfile as any);
app.put('/api/auth/change-password', authController.changePassword as any);

// Transactions CRUD
app.get('/api/transactions', transactionController.getTransactions as any);
app.post('/api/transactions', transactionController.createTransaction as any);
app.put('/api/transactions/:id', transactionController.updateTransaction as any);
app.delete('/api/transactions/:id', transactionController.deleteTransaction as any);

// Categories CRUD & Budgets
app.get('/api/categories', categoryController.getCategories as any);
app.post('/api/categories', categoryController.createCategory as any);
app.put('/api/categories/:id', categoryController.updateCategory as any);
app.delete('/api/categories/:id', categoryController.deleteCategory as any);

// Accounts CRUD
app.get('/api/accounts', accountController.getAccounts as any);
app.post('/api/accounts', accountController.createAccount as any);
app.put('/api/accounts/:id', accountController.updateAccount as any);
app.delete('/api/accounts/:id', accountController.deleteAccount as any);

// Recurring Schedules & Triggers
app.get('/api/recurring', recurringController.getRecurring as any);
app.post('/api/recurring', recurringController.createRecurring as any);
app.delete('/api/recurring/:id', recurringController.deleteRecurring as any);
app.post('/api/recurring/process', recurringController.processRecurring as any);

// Analytics & Insights
app.get('/api/analytics/summary', analyticsController.getSummary as any);
app.get('/api/analytics/category-breakdown', analyticsController.getCategoryBreakdown as any);
app.get('/api/analytics/monthly-comparison', analyticsController.getMonthlyComparison as any);
app.get('/api/analytics/trends', analyticsController.getDailyTrends as any);
app.get('/api/analytics/insights', analyticsController.getInsights as any);

// Notifications Management
app.get('/api/notifications', notificationController.getNotifications as any);
app.put('/api/notifications/:id/read', notificationController.markAsRead as any);
app.put('/api/notifications/read-all', notificationController.markAllAsRead as any);
app.delete('/api/notifications/:id', notificationController.deleteNotification as any);

// Savings Goals CRUD
app.get('/api/goals', goalController.getGoals as any);
app.post('/api/goals', goalController.createGoal as any);
app.put('/api/goals/:id', goalController.updateGoal as any);
app.delete('/api/goals/:id', goalController.deleteGoal as any);

// Simple Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
