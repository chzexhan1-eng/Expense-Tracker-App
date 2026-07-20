import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

export const getRecurring = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId },
      include: {
        category: { select: { name: true, color: true, icon: true } },
        account: { select: { name: true, type: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });
    res.json(recurring);
  } catch (error: any) {
    console.error('Error fetching recurring transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createRecurring = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount, type, description, interval, startDate, categoryId, accountId } = req.body;

    if (!amount || !type || !description || !interval || !startDate || !categoryId || !accountId) {
      return res.status(400).json({ error: 'Missing required fields for recurring transaction' });
    }

    const start = new Date(startDate);
    const nextDueDate = new Date(startDate); // Initially matches start date

    const recurring = await prisma.recurringTransaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        description,
        interval,
        startDate: start,
        nextDueDate,
        categoryId,
        accountId,
        userId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    res.status(201).json(recurring);
  } catch (error: any) {
    console.error('Error creating recurring transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteRecurring = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const recurring = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!recurring) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    res.json({ message: 'Recurring transaction cancelled successfully' });
  } catch (error: any) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Automatic reminder / processing logic for recurring transactions
export const processRecurring = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();

    // Find active schedules that are due
    const dueSchedules = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextDueDate: {
          lte: now,
        },
      },
    });

    let processedCount = 0;

    for (const schedule of dueSchedules) {
      // 1. Create the Transaction record
      await prisma.transaction.create({
        data: {
          amount: schedule.amount,
          date: schedule.nextDueDate,
          type: schedule.type,
          description: `[Recurring] ${schedule.description}`,
          paymentMethod: 'TRANSFER',
          categoryId: schedule.categoryId,
          accountId: schedule.accountId,
          userId,
          isRecurring: true,
        },
      });

      // 2. Adjust target account balance
      const balanceAdjustment = schedule.type === 'INCOME' ? schedule.amount : -schedule.amount;
      await prisma.account.update({
        where: { id: schedule.accountId },
        data: { balance: { increment: balanceAdjustment } },
      });

      // 3. Create transaction notification alert
      await prisma.notification.create({
        data: {
          title: `Recurring Payment Processed`,
          message: `Processed: ${schedule.description} of $${schedule.amount.toFixed(2)}`,
          type: 'SUCCESS_CONFIRMATION',
          userId,
        },
      });

      // 4. Calculate next due date
      const nextDue = new Date(schedule.nextDueDate);
      if (schedule.interval === 'DAILY') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (schedule.interval === 'WEEKLY') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (schedule.interval === 'MONTHLY') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      } else if (schedule.interval === 'YEARLY') {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      }

      // Update schedule record
      await prisma.recurringTransaction.update({
        where: { id: schedule.id },
        data: {
          nextDueDate: nextDue,
        },
      });

      processedCount++;
    }

    res.json({ message: `Successfully processed ${processedCount} due recurring transactions.` });
  } catch (error: any) {
    console.error('Error processing recurring transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
