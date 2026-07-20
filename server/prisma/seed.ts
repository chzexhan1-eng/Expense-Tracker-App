import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing database
  await prisma.notification.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Alex Johnson',
      currency: 'USD',
      theme: 'light',
    },
  });

  console.log(`Created user: ${user.name} (${user.email})`);

  // Create accounts
  const bankAccount = await prisma.account.create({
    data: {
      name: 'Chase Checking',
      type: 'BANK',
      balance: 4200.0,
      userId: user.id,
    },
  });

  const cashAccount = await prisma.account.create({
    data: {
      name: 'Cash Wallet',
      type: 'CASH',
      balance: 350.0,
      userId: user.id,
    },
  });

  const cardAccount = await prisma.account.create({
    data: {
      name: 'Visa Credit Card',
      type: 'CREDIT_CARD',
      balance: -120.0,
      userId: user.id,
    },
  });

  console.log('Created accounts');

  // Create default categories for user
  const categoriesData = [
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

  const categoriesMap: { [key: string]: string } = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        budgetLimit: cat.budgetLimit,
        userId: user.id,
      },
    });
    categoriesMap[cat.name] = createdCat.id;
  }

  console.log('Created default categories and budgets');

  // Add historical and mock transactions
  const now = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(now.getDate() - daysAgo);
    return d;
  };

  const transactionsData = [
    {
      amount: 5000.0,
      date: getPastDate(15),
      type: 'INCOME',
      description: 'Monthly Salary Acme Corp',
      paymentMethod: 'TRANSFER',
      categoryId: categoriesMap['Salary'],
      accountId: bankAccount.id,
      notes: 'Direct deposit',
    },
    {
      amount: 1200.0,
      date: getPastDate(12),
      type: 'EXPENSE',
      description: 'Apartment Rent Payment',
      paymentMethod: 'TRANSFER',
      categoryId: categoriesMap['Bills'],
      accountId: bankAccount.id,
      notes: 'Monthly rent charge',
    },
    {
      amount: 85.5,
      date: getPastDate(10),
      type: 'EXPENSE',
      description: 'Whole Foods Groceries',
      paymentMethod: 'CARD',
      categoryId: categoriesMap['Food'],
      accountId: bankAccount.id,
    },
    {
      amount: 42.0,
      date: getPastDate(8),
      type: 'EXPENSE',
      description: 'Dinner with Sarah at Pizzeria',
      paymentMethod: 'CASH',
      categoryId: categoriesMap['Food'],
      accountId: cashAccount.id,
    },
    {
      amount: 600.0,
      date: getPastDate(7),
      type: 'INCOME',
      description: 'Freelance Website UI Design',
      paymentMethod: 'TRANSFER',
      categoryId: categoriesMap['Freelance'],
      accountId: bankAccount.id,
    },
    {
      amount: 15.0,
      date: getPastDate(6),
      type: 'EXPENSE',
      description: 'Uber Ride to Downtown',
      paymentMethod: 'CARD',
      categoryId: categoriesMap['Transport'],
      accountId: cardAccount.id,
    },
    {
      amount: 120.0,
      date: getPastDate(5),
      type: 'EXPENSE',
      description: 'Zara Winter Jacket',
      paymentMethod: 'CARD',
      categoryId: categoriesMap['Shopping'],
      accountId: cardAccount.id,
    },
    {
      amount: 320.0,
      date: getPastDate(4),
      type: 'EXPENSE',
      description: 'Electricity & Internet Bill',
      paymentMethod: 'TRANSFER',
      categoryId: categoriesMap['Bills'],
      accountId: bankAccount.id,
    },
    {
      amount: 25.0,
      date: getPastDate(3),
      type: 'EXPENSE',
      description: 'Cinema Movie Tickets',
      paymentMethod: 'CARD',
      categoryId: categoriesMap['Entertainment'],
      accountId: cardAccount.id,
    },
    {
      amount: 50.0,
      date: getPastDate(2),
      type: 'EXPENSE',
      description: 'Monthly Gym Membership',
      paymentMethod: 'CARD',
      categoryId: categoriesMap['Entertainment'],
      accountId: cardAccount.id,
      isRecurring: true,
    },
    {
      amount: 12.5,
      date: getPastDate(1),
      type: 'EXPENSE',
      description: 'Starbucks Coffee & Pastry',
      paymentMethod: 'CASH',
      categoryId: categoriesMap['Food'],
      accountId: cashAccount.id,
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({
      data: {
        ...tx,
        userId: user.id,
      },
    });
  }

  console.log('Created mock transactions');

  // Create recurring transactions definitions
  await prisma.recurringTransaction.create({
    data: {
      amount: 50.0,
      type: 'EXPENSE',
      description: 'Monthly Gym Membership',
      interval: 'MONTHLY',
      startDate: getPastDate(30),
      nextDueDate: getPastDate(-30), // 30 days in the future
      categoryId: categoriesMap['Entertainment'],
      accountId: cardAccount.id,
      userId: user.id,
    },
  });

  await prisma.recurringTransaction.create({
    data: {
      amount: 1200.0,
      type: 'EXPENSE',
      description: 'Apartment Rent Payment',
      interval: 'MONTHLY',
      startDate: getPastDate(30),
      nextDueDate: getPastDate(-30), // 30 days in the future
      categoryId: categoriesMap['Bills'],
      accountId: bankAccount.id,
      userId: user.id,
    },
  });

  console.log('Created recurring transactions config');

  // Create notifications
  await prisma.notification.create({
    data: {
      title: 'Welcome to Antigravity Expense Tracker!',
      message: 'Take control of your finances. Try setting up custom categories and budget limits.',
      type: 'SUCCESS_CONFIRMATION',
      userId: user.id,
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Monthly Rent Reminder',
      message: 'Your recurring payment of $1200.00 for Rent will process in 18 days.',
      type: 'BILL_REMINDER',
      userId: user.id,
      read: false,
    },
  });

  // Create a Savings Goal
  await prisma.savingsGoal.create({
    data: {
      name: 'New MacBook Pro M4',
      targetAmount: 2500.0,
      currentAmount: 1200.0,
      deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1),
      userId: user.id,
    },
  });

  await prisma.savingsGoal.create({
    data: {
      name: 'Emergency Fund',
      targetAmount: 10000.0,
      currentAmount: 5000.0,
      deadline: new Date(now.getFullYear() + 1, now.getMonth(), 1),
      userId: user.id,
    },
  });

  console.log('Created notifications & savings goals');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
