import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const Reports: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const { showToast } = useToast();
  
  // Date boundaries filter
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().substring(0, 10);
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Fetch matching transactions for timeframe
      const txRes = await apiFetch(`/transactions?startDate=${startDate}&endDate=${endDate}&limit=1000`);
      setTransactions(txRes.transactions);

      // Generate a simple cumulative cash trend data array for the selected range
      const days: { [key: string]: { income: number; expense: number } } = {};
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days[dateStr] = { income: 0, expense: 0 };
      }

      txRes.transactions.forEach((tx: any) => {
        const dateStr = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[dateStr]) {
          if (tx.type === 'INCOME') days[dateStr].income += tx.amount;
          else days[dateStr].expense += tx.amount;
        }
      });

      const trendArray = Object.keys(days).map((date) => ({
        date,
        Income: days[date].income,
        Expenses: days[date].expense,
      }));
      
      setTrends(trendArray);
    } catch (err) {
      console.error(err);
      showToast('Error loading analytics reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const totalIncome = transactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netSavings = totalIncome - totalExpense;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(val);
  };

  // CSV Exporter
  const exportToCSV = () => {
    if (transactions.length === 0) {
      showToast('No transaction data to export', 'warning');
      return;
    }

    const headers = ['Date', 'Description', 'Type', 'Category', 'Account', 'Payment Method', 'Amount', 'Notes'];
    const rows = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.type,
      tx.category.name,
      tx.account.name,
      tx.paymentMethod,
      tx.amount,
      tx.notes || ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report downloaded as CSV successfully', 'success');
  };

  // Print PDF
  const printReport = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-notion-border-light dark:border-notion-border-dark pb-4 print:hidden">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-notion-text-light dark:text-notion-text-dark">Reports & Analytics</h2>
          <p className="text-xs md:text-sm text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium">Analyze cash flow trends, filter ranges, and export financials.</p>
        </div>
        
        {/* Export actions */}
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white dark:bg-notion-sidebar-dark text-notion-text-light dark:text-notion-text-dark font-semibold text-xs md:text-sm px-4.5 py-2.5 border border-notion-border-light dark:border-notion-border-dark rounded-xl shadow-premium hover:bg-gray-100 dark:hover:bg-notion-border-dark transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export CSV
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 bg-stripe-primary hover:bg-stripe-primary/95 text-white font-semibold text-xs md:text-sm px-4.5 py-2.5 rounded-xl shadow-premium transition-all duration-200"
          >
            <Download className="h-4 w-4" /> Save PDF / Print
          </button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:flex flex-col gap-2 pb-6 border-b border-gray-300">
        <h1 className="text-2xl font-bold">Financial Statement</h1>
        <p className="text-sm text-gray-500">Period: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</p>
        <p className="text-xs text-gray-400">Generated by Antigravity Expense Tracker on {new Date().toLocaleString()}</p>
      </div>

      {/* Date Select filter - Hidden when printing */}
      <div className="bg-white dark:bg-notion-sidebar-dark rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">
          <Filter className="h-4.5 w-4.5 text-stripe-primary" /> Filter Date Range
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
          />
          <ArrowRight className="h-4 w-4 text-notion-text-muted-light" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
          />
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-white dark:bg-notion-sidebar-dark p-5 rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium flex flex-col gap-1">
          <span className="text-[10px] md:text-xs font-bold text-notion-text-muted-light dark:text-notion-text-muted-dark uppercase tracking-wider">Total Incoming</span>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</span>
          <span className="text-[10px] text-notion-text-muted-light dark:text-notion-text-muted-dark mt-1 font-medium">Inflows during this range</span>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-notion-sidebar-dark p-5 rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium flex flex-col gap-1">
          <span className="text-[10px] md:text-xs font-bold text-notion-text-muted-light dark:text-notion-text-muted-dark uppercase tracking-wider">Total Outgoing</span>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">{formatCurrency(totalExpense)}</span>
          <span className="text-[10px] text-notion-text-muted-light dark:text-notion-text-muted-dark mt-1 font-medium">Outflows during this range</span>
        </div>

        {/* Net Savings Card */}
        <div className="bg-white dark:bg-notion-sidebar-dark p-5 rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium flex flex-col gap-1">
          <span className="text-[10px] md:text-xs font-bold text-notion-text-muted-light dark:text-notion-text-muted-dark uppercase tracking-wider">Savings Margin</span>
          <span className={`text-xl md:text-2xl font-bold tracking-tight ${netSavings >= 0 ? 'text-stripe-accent' : 'text-red-500'}`}>{formatCurrency(netSavings)}</span>
          <span className="text-[10px] text-notion-text-muted-light dark:text-notion-text-muted-dark mt-1 font-medium">Income minus Expenses</span>
        </div>
      </div>

      {/* Visual Analytics Chart - Hidden when printing */}
      <div className="bg-white dark:bg-notion-sidebar-dark p-5 rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium flex flex-col gap-4 print:hidden">
        <div>
          <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">Cash Flow Trends</h3>
          <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">Accumulated cash movement patterns over selected dates.</p>
        </div>
        <div className="h-72 w-full text-xs">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center animate-pulse-slow bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-400">Updating visualizer...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transaction Details Ledger List */}
      <div className="bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark shadow-premium rounded-xl p-4 md:p-5">
        <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark mb-4">Transaction Statement</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-xs text-notion-text-muted-light">
            No transactions matching selected date boundaries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-300 pb-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 text-right">Inflow</th>
                  <th className="py-2.5 text-right">Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-notion-border-dark">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-notion-border-dark/20 text-notion-text-light dark:text-notion-text-dark">
                    <td className="py-3 text-notion-text-muted-light dark:text-notion-text-muted-dark">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-3 font-semibold">{tx.description}</td>
                    <td className="py-3">{tx.category.name}</td>
                    <td className="py-3 uppercase text-[10px] text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium">{tx.paymentMethod}</td>
                    <td className="py-3 text-right font-semibold text-green-600 dark:text-green-400">
                      {tx.type === 'INCOME' ? formatCurrency(tx.amount) : ''}
                    </td>
                    <td className="py-3 text-right font-semibold text-red-600 dark:text-red-400">
                      {tx.type === 'EXPENSE' ? formatCurrency(tx.amount) : ''}
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
