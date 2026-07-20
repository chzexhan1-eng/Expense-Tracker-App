import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const { showToast } = useToast();
  const [summary, setSummary] = useState<any>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Currency Formatter helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(value);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch summary
      const summaryRes = await apiFetch('/analytics/summary');
      setSummary(summaryRes);

      // Fetch monthly comparison
      const monthlyRes = await apiFetch('/analytics/monthly-comparison');
      setMonthlyData(monthlyRes.slice(-6)); // past 6 months

      // Fetch category breakdown
      const categoryRes = await apiFetch('/analytics/category-breakdown');
      setCategoryData(categoryRes);

      // Fetch daily trends
      const trendRes = await apiFetch('/analytics/trends');
      setTrendData(trendRes.slice(-14)); // past 14 days for cleaner UI

      // Fetch recent transactions
      const txRes = await apiFetch('/transactions?limit=5');
      setRecentTransactions(txRes.transactions);

      // Fetch AI Insights
      const insightsRes = await apiFetch('/analytics/insights');
      setInsights(insightsRes);
    } catch (err: any) {
      console.error(err);
      showToast('Error loading dashboard statistics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        <div className="h-8 w-60 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl animate-shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-xl animate-shimmer" />
          <div className="h-80 rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-notion-border-light dark:border-notion-border-dark pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-notion-text-light dark:text-notion-text-dark">
            {getGreeting()}, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-xs md:text-sm text-notion-text-muted-light dark:text-notion-text-muted-dark">
            Here's a breakdown of your finances as of {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-notion-border-dark/40 border border-notion-border-light dark:border-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark self-start md:self-auto">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance */}
        <div className="glass-panel p-5 rounded-xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark uppercase tracking-wider">Total Balance</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-notion-text-light dark:text-notion-text-dark">{formatCurrency(summary.totalBalance)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stripe-primary/10 text-stripe-primary dark:bg-stripe-primary/20 dark:text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        {/* Income */}
        <div className="glass-panel p-5 rounded-xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark uppercase tracking-wider">Total Income</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">{formatCurrency(summary.totalIncome)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 shadow-sm">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        {/* Expense */}
        <div className="glass-panel p-5 rounded-xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark uppercase tracking-wider">Total Expenses</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">{formatCurrency(summary.totalExpense)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 shadow-sm">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>

        {/* Savings */}
        <div className="glass-panel p-5 rounded-xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark uppercase tracking-wider">Net Savings</span>
            <span className={`text-xl md:text-2xl font-bold tracking-tight ${summary.savings >= 0 ? 'text-stripe-accent' : 'text-red-500'}`}>{formatCurrency(summary.savings)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-stripe-accent shadow-sm">
            <PiggyBank className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="glass-panel lg:col-span-2 p-5 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">Cash Flow (Monthly)</h3>
            <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">Comparison of incoming and outgoing funds over the past 6 months.</p>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown (Pie Chart) */}
        <div className="glass-panel p-5 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">Category Breakdown</h3>
            <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">Current month expense shares per category.</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center text-xs">
            {categoryData.length === 0 ? (
              <div className="text-center text-notion-text-muted-light dark:text-notion-text-muted-dark">
                No expense logs for this month.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
              {categoryData.slice(0, 4).map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-notion-text-light dark:text-notion-text-dark font-medium">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trends & AI Coach / Recents Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily spending trends */}
        <div className="glass-panel lg:col-span-2 p-5 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">Daily Spend Trend</h3>
            <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">Your spending pattern over the last 14 days.</p>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="amount" stroke="#635bff" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI spending insights & tips */}
        <div className="glass-panel p-5 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">AI Financial Insights</h3>
            </div>
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-60">
              {insights.map((insight, idx) => (
                <div key={idx} className="text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-notion-border-dark/20 border border-notion-border-light dark:border-notion-border-dark text-notion-text-light dark:text-notion-text-dark">
                  {insight}
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-notion-text-muted-light dark:text-notion-text-muted-dark border-t border-notion-border-light dark:border-notion-border-dark pt-3">
            Insights are computed dynamically using your current month's transaction records compared to set budgets.
          </div>
        </div>
      </div>

      {/* Recent Transactions List Table */}
      <div className="glass-panel p-5 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">Recent Transactions</h3>
            <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">Your last 5 logged transactions.</p>
          </div>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">
            No transactions logged yet. Add one in the Transactions page!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-notion-border-light dark:border-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium pb-2 text-[10px] uppercase tracking-wider">
                  <th className="py-2">Description</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Payment Method</th>
                  <th className="py-2">Date</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-notion-border-light dark:divide-notion-border-dark">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="text-notion-text-light dark:text-notion-text-dark hover:bg-gray-50/50 dark:hover:bg-notion-border-dark/20 transition-colors">
                    <td className="py-3 font-semibold">{tx.description}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tx.category.color }} />
                        <span>{tx.category.name}</span>
                      </div>
                    </td>
                    <td className="py-3 uppercase text-[10px] tracking-wider font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">{tx.paymentMethod}</td>
                    <td className="py-3 text-notion-text-muted-light dark:text-notion-text-muted-dark">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={`py-3 text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
