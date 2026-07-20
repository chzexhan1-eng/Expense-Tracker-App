import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Fetch categories with dynamic spending calculations for the current month
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const categoriesWithSpending = await Promise.all(
      categories.map(async (cat) => {
        const aggregate = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: cat.id,
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

        return {
          ...cat,
          currentSpending: aggregate._sum.amount || 0,
        };
      })
    );

    res.json(categoriesWithSpending);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, type, color, icon, budgetLimit } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Category name and type (INCOME/EXPENSE) are required' });
    }

    // Check duplicate
    const existing = await prisma.category.findFirst({
      where: { name, type, userId },
    });
    if (existing) {
      return res.status(400).json({ error: 'A category with this name and type already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color: color || '#808080',
        icon: icon || 'Tag',
        budgetLimit: budgetLimit ? parseFloat(budgetLimit) : null,
        isCustom: true,
        userId,
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, color, icon, budgetLimit } = req.body;

    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(icon && { icon }),
        budgetLimit: budgetLimit !== undefined ? (budgetLimit ? parseFloat(budgetLimit) : null) : category.budgetLimit,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
