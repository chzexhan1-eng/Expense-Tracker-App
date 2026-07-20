import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

// Helper to check and trigger budget notifications
const checkBudgetAlerts = async (userId: string, categoryId: string) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.budgetLimit || category.type !== 'EXPENSE') return;

    const limit = category.budgetLimit;

    // Get current month date boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Sum transactions in this month for this category
    const aggregate = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentSpent = aggregate._sum.amount || 0;
    const usagePercent = (currentSpent / limit) * 100;

    // Check if we should notify
    if (usagePercent >= 100) {
      // Check if we already sent a 100% alert this month
      const existingAlert = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'BUDGET_ALERT',
          title: { contains: '100%' },
          message: { contains: category.name },
          createdAt: { gte: startOfMonth },
        },
      });

      if (!existingAlert) {
        await prisma.notification.create({
          data: {
            title: `Budget Exceeded (100%): ${category.name}`,
            message: `You have spent $${currentSpent.toFixed(2)} of your $${limit.toFixed(2)} budget for ${category.name}.`,
            type: 'BUDGET_ALERT',
            userId,
          },
        });
      }
    } else if (usagePercent >= 80) {
      // Check if we already sent an 80% alert this month
      const existingAlert = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'BUDGET_ALERT',
          title: { contains: '80%' },
          message: { contains: category.name },
          createdAt: { gte: startOfMonth },
        },
      });

      if (!existingAlert) {
        await prisma.notification.create({
          data: {
            title: `Budget Warning (80%): ${category.name}`,
            message: `You have reached ${usagePercent.toFixed(0)}% ($${currentSpent.toFixed(2)} of $${limit.toFixed(2)}) of your budget for ${category.name}.`,
            type: 'BUDGET_ALERT',
            userId,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      search,
      type,
      categoryId,
      accountId,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'newest',
      limit = '100',
      page = '1',
    } = req.query;

    const where: any = { userId };

    // Apply Search
    if (search) {
      where.OR = [
        { description: { contains: search as string } },
        { notes: { contains: search as string } },
      ];
    }

    // Apply Filters
    if (type) where.type = type as string;
    if (categoryId) where.categoryId = categoryId as string;
    if (accountId) where.accountId = accountId as string;
    if (paymentMethod) where.paymentMethod = paymentMethod as string;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Apply Sorting
    let orderBy: any = { date: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { date: 'asc' };
    } else if (sortBy === 'highestAmount') {
      orderBy = { amount: 'desc' };
    } else if (sortBy === 'lowestAmount') {
      orderBy = { amount: 'asc' };
    }

    const takeCount = parseInt(limit as string, 10);
    const skipCount = (parseInt(page as string, 10) - 1) * takeCount;

    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy,
        take: takeCount,
        skip: skipCount,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          account: { select: { id: true, name: true, type: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page as string, 10),
        limit: takeCount,
        pages: Math.ceil(total / takeCount),
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount, date, type, description, paymentMethod, notes, categoryId, accountId, receiptUrl } = req.body;

    if (!amount || !date || !type || !description || !categoryId || !accountId) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const txAmount = parseFloat(amount);
    if (isNaN(txAmount) || txAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Confirm account exists
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Confirm category exists
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Adjust Account Balance
    const balanceAdjustment = type === 'INCOME' ? txAmount : -txAmount;
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: balanceAdjustment } },
    });

    // Create Transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: txAmount,
        date: new Date(date),
        type,
        description,
        paymentMethod,
        notes,
        categoryId,
        accountId,
        userId,
        receiptUrl,
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Create success confirmation notification
    await prisma.notification.create({
      data: {
        title: `Transaction Logged`,
        message: `${type === 'INCOME' ? 'Received' : 'Spent'} $${txAmount.toFixed(2)} on ${description}`,
        type: 'SUCCESS_CONFIRMATION',
        userId,
      },
    });

    // Run background budget evaluation asynchronously
    if (type === 'EXPENSE') {
      checkBudgetAlerts(userId, categoryId);
    }

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { amount, date, type, description, paymentMethod, notes, categoryId, accountId, receiptUrl } = req.body;

    const oldTransaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!oldTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const newAmount = amount ? parseFloat(amount) : oldTransaction.amount;
    const newType = type || oldTransaction.type;
    const newAccountId = accountId || oldTransaction.accountId;
    const newCategoryId = categoryId || oldTransaction.categoryId;

    // Check account validity
    if (newAccountId !== oldTransaction.accountId) {
      const accExists = await prisma.account.findFirst({ where: { id: newAccountId, userId } });
      if (!accExists) return res.status(404).json({ error: 'Target account not found' });
    }

    // Check category validity
    if (newCategoryId !== oldTransaction.categoryId) {
      const catExists = await prisma.category.findFirst({ where: { id: newCategoryId, userId } });
      if (!catExists) return res.status(404).json({ error: 'Target category not found' });
    }

    // Revert balance adjustments from the old transaction
    const oldAdjustment = oldTransaction.type === 'INCOME' ? -oldTransaction.amount : oldTransaction.amount;
    await prisma.account.update({
      where: { id: oldTransaction.accountId },
      data: { balance: { increment: oldAdjustment } },
    });

    // Apply balance adjustments for the new transaction
    const newAdjustment = newType === 'INCOME' ? newAmount : -newAmount;
    await prisma.account.update({
      where: { id: newAccountId },
      data: { balance: { increment: newAdjustment } },
    });

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: newAmount,
        date: date ? new Date(date) : oldTransaction.date,
        type: newType,
        description: description || oldTransaction.description,
        paymentMethod: paymentMethod || oldTransaction.paymentMethod,
        notes: notes !== undefined ? notes : oldTransaction.notes,
        categoryId: newCategoryId,
        accountId: newAccountId,
        receiptUrl: receiptUrl !== undefined ? receiptUrl : oldTransaction.receiptUrl,
      },
      include: {
        category: true,
        account: true,
      },
    });

    if (newType === 'EXPENSE') {
      checkBudgetAlerts(userId, newCategoryId);
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert account balance adjustment
    const revertAmount = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: { increment: revertAmount } },
    });

    // Delete transaction
    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
