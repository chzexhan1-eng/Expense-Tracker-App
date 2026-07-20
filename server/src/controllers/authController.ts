import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';

// Seed default categories helper when registering a user
const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'EXPENSE', color: '#EF4444', icon: 'Utensils', budgetLimit: 400.0 },
  { name: 'Transport', type: 'EXPENSE', color: '#F59E0B', icon: 'Car', budgetLimit: 150.0 },
  { name: 'Shopping', type: 'EXPENSE', color: '#EC4899', icon: 'ShoppingBag', budgetLimit: 300.0 },
  { name: 'Bills', type: 'EXPENSE', color: '#3B82F6', icon: 'CreditCard', budgetLimit: 1500.0 },
  { name: 'Entertainment', type: 'EXPENSE', color: '#8B5CF6', icon: 'Film', budgetLimit: 200.0 },
  { name: 'Healthcare', type: 'EXPENSE', color: '#10B981', icon: 'Heart', budgetLimit: 100.0 },
  { name: 'Education', type: 'EXPENSE', color: '#6366F1', icon: 'GraduationCap', budgetLimit: 250.0 },
  { name: 'Salary', type: 'INCOME', color: '#10B981', icon: 'Briefcase' },
  { name: 'Freelance', type: 'INCOME', color: '#84CC16', icon: 'Laptop' },
  { name: 'Investment', type: 'INCOME', color: '#06B6D4', icon: 'TrendingUp' },
  { name: 'Other', type: 'EXPENSE', color: '#6B7280', icon: 'Tag', budgetLimit: 100.0 },
];

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        currency: 'USD',
        theme: 'light',
      },
    });

    // Create default accounts
    await prisma.account.createMany({
      data: [
        { name: 'Cash Wallet', type: 'CASH', balance: 0.0, userId: user.id },
        { name: 'Checking Account', type: 'BANK', balance: 0.0, userId: user.id },
        { name: 'Credit Card', type: 'CREDIT_CARD', balance: 0.0, userId: user.id },
      ],
    });

    // Create default categories
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        budgetLimit: cat.budgetLimit || null,
        userId: user.id,
      })),
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        title: 'Welcome to Antigravity Expense Tracker!',
        message: 'Your account is ready. Start tracking by setting budgets and adding your first transaction!',
        type: 'SUCCESS_CONFIRMATION',
        userId: user.id,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        theme: user.theme,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        theme: user.theme,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        theme: true,
        avatar: true,
        accounts: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, currency, theme, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(currency && { currency }),
        ...(theme && { theme }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        theme: true,
        avatar: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
