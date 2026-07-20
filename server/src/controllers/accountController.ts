import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

export const getAccounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, type, balance } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Account name and type (CASH, BANK, CREDIT_CARD, DIGITAL_WALLET) are required' });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance ? parseFloat(balance) : 0.0,
        userId,
      },
    });

    res.status(201).json(account);
  } catch (error: any) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, balance, type } = req.body;

    const account = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updated = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        balance: balance !== undefined ? parseFloat(balance) : account.balance,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await prisma.account.delete({
      where: { id },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
