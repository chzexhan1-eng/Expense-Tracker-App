import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

export const getGoals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (error: any) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, targetAmount, currentAmount, deadline } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Goal name and target amount are required' });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0.0,
        deadline: deadline ? new Date(deadline) : null,
        userId,
      },
    });

    res.status(201).json(goal);
  } catch (error: any) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, targetAmount, currentAmount, deadline } = req.body;

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(name && { name }),
        targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : goal.targetAmount,
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : goal.currentAmount,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : goal.deadline,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.savingsGoal.delete({
      where: { id },
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
