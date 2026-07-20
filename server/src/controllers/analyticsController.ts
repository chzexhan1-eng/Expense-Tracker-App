import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../db';

export const getSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Total Balance = sum of all account balances
    const accounts = await prisma.account.findMany({ where: { userId } });
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Sum Income this month
    const incomeAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    });
    const totalIncome = incomeAgg._sum.amount || 0;

    // Sum Expenses this month
    const expenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    });
    const totalExpense = expenseAgg._sum.amount || 0;

    // Savings = Income - Expenses
    const savings = totalIncome - totalExpense;

    res.json({
      totalBalance,
      totalIncome,
      totalExpense,
      savings
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCategoryBreakdown = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const categories = await prisma.category.findMany({
      where: { userId, type: 'EXPENSE' }
    });

    const breakdown = await Promise.all(
      categories.map(async (cat) => {
        const txSum = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: cat.id,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth }
          },
          _sum: { amount: true }
        });

        return {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          value: txSum._sum.amount || 0
        };
      })
    );

    // Filter categories with spending
    const activeBreakdown = breakdown.filter(item => item.value > 0);

    res.json(activeBreakdown);
  } catch (error: any) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMonthlyComparison = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const currentYear = now.getFullYear();

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const reportData = await Promise.all(
      months.map(async (month, index) => {
        const start = new Date(currentYear, index, 1);
        const end = new Date(currentYear, index + 1, 0, 23, 59, 59);

        const incAgg = await prisma.transaction.aggregate({
          where: {
            userId,
            type: 'INCOME',
            date: { gte: start, lte: end }
          },
          _sum: { amount: true }
        });

        const expAgg = await prisma.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: { gte: start, lte: end }
          },
          _sum: { amount: true }
        });

        return {
          month,
          income: incAgg._sum.amount || 0,
          expenses: expAgg._sum.amount || 0
        };
      })
    );

    res.json(reportData);
  } catch (error: any) {
    console.error('Error fetching monthly comparison:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDailyTrends = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Group expenses by date for past 30 days
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: thirtyDaysAgo, lte: now }
      },
      select: {
        amount: true,
        date: true
      },
      orderBy: { date: 'asc' }
    });

    // Map to daily sums
    const dailyMap: { [key: string]: number } = {};
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dateString] = 0;
    }

    transactions.forEach((tx) => {
      const dateString = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMap[dateString] !== undefined) {
        dailyMap[dateString] += tx.amount;
      }
    });

    const trendData = Object.keys(dailyMap).map((date) => ({
      date,
      amount: dailyMap[date]
    }));

    res.json(trendData);
  } catch (error: any) {
    console.error('Error fetching daily trends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const categories = await prisma.category.findMany({
      where: { userId, type: 'EXPENSE' }
    });

    const insights: string[] = [];

    // Analyze each category
    let totalCurrentExpense = 0;
    let totalLastMonthExpense = 0;

    for (const cat of categories) {
      // Sum current month
      const currentAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: cat.id,
          type: 'EXPENSE',
          date: { gte: startOfCurrentMonth }
        },
        _sum: { amount: true }
      });
      const currentSpent = currentAgg._sum.amount || 0;
      totalCurrentExpense += currentSpent;

      // Sum last month
      const lastAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: cat.id,
          type: 'EXPENSE',
          date: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { amount: true }
      });
      const lastSpent = lastAgg._sum.amount || 0;
      totalLastMonthExpense += lastSpent;

      // Check Budget usage
      if (cat.budgetLimit) {
        const percent = (currentSpent / cat.budgetLimit) * 100;
        if (percent >= 100) {
          insights.push(`🚨 Budget alert: You have exceeded your $${cat.budgetLimit} budget for ${cat.name} by spending $${currentSpent.toFixed(2)}.`);
        } else if (percent >= 80) {
          insights.push(`⚠️ Warning: You have used ${percent.toFixed(0)}% of your $${cat.budgetLimit} budget for ${cat.name} ($${currentSpent.toFixed(2)} spent).`);
        }
      }

      // Check increased spending vs last month
      if (lastSpent > 0 && currentSpent > lastSpent * 1.2) {
        const increase = ((currentSpent - lastSpent) / lastSpent) * 100;
        insights.push(`📈 Spending in ${cat.name} has increased by ${increase.toFixed(0)}% compared to last month ($${currentSpent.toFixed(2)} vs $${lastSpent.toFixed(2)}).`);
      }
    }

    // Add high-level summaries
    if (totalCurrentExpense > 0 && totalLastMonthExpense > 0) {
      if (totalCurrentExpense > totalLastMonthExpense) {
        const percent = ((totalCurrentExpense - totalLastMonthExpense) / totalLastMonthExpense) * 100;
        insights.push(`💸 Overall, your total spending this month is up by ${percent.toFixed(0)}% compared to last month.`);
      } else {
        const percent = ((totalLastMonthExpense - totalCurrentExpense) / totalLastMonthExpense) * 100;
        insights.push(`🎉 Good job! Your total spending this month is down by ${percent.toFixed(0)}% compared to last month.`);
      }
    }

    // Default general insights if none generated
    if (insights.length === 0) {
      insights.push('💡 Tip: Try dividing your income into the 50/30/20 rule: 50% Needs, 30% Wants, and 20% Savings.');
      insights.push('💡 Tip: Subscribing to gym memberships or streaming sites you don\'t use? Check your recurring list and cancel them to save instantly!');
    } else {
      // Add standard savings tips
      insights.push('💡 Savings advice: Reducing discretionary categories like Shopping and Dining Out by just 15% would save you additional funds for your goals.');
    }

    res.json(insights);
  } catch (error: any) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
