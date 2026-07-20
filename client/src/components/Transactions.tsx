import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const { showToast } = useToast();

  // Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, pages: 1, limit: 15, page: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [currentTxId, setCurrentTxId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().substring(0, 10),
    type: 'EXPENSE',
    description: '',
    paymentMethod: 'CARD',
    categoryId: '',
    accountId: '',
    notes: '',
  });

  const fetchFiltersData = async () => {
    try {
      const cats = await apiFetch('/categories');
      setCategories(cats);
      const accs = await apiFetch('/accounts');
      setAccounts(accs);
      
      // Default selections for form
      if (cats.length > 0) setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
      if (accs.length > 0) setFormData((prev) => ({ ...prev, accountId: accs[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      // Build query string
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
      });

      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (categoryId) params.append('categoryId', categoryId);
      if (accountId) params.append('accountId', accountId);
      if (paymentMethod) params.append('paymentMethod', paymentMethod);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const data = await apiFetch(`/transactions?${params.toString()}`);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err: any) {
      showToast('Failed to fetch transactions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, type, categoryId, accountId, paymentMethod, startDate, endDate, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const openAddModal = () => {
    setModalType('add');
    setCurrentTxId(null);
    setFormData({
      amount: '',
      date: new Date().toISOString().substring(0, 10),
      type: 'EXPENSE',
      description: '',
      paymentMethod: 'CARD',
      categoryId: categories.length > 0 ? categories[0].id : '',
      accountId: accounts.length > 0 ? accounts[0].id : '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tx: any) => {
    setModalType('edit');
    setCurrentTxId(tx.id);
    setFormData({
      amount: tx.amount.toString(),
      date: new Date(tx.date).toISOString().substring(0, 10),
      type: tx.type,
      description: tx.description,
      paymentMethod: tx.paymentMethod,
      categoryId: tx.categoryId,
      accountId: tx.accountId,
      notes: tx.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
      showToast('Transaction deleted successfully', 'success');
      fetchTransactions();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        showToast('Please enter a valid positive amount', 'warning');
        return;
      }
      if (!formData.categoryId) {
        showToast('Please select a category', 'warning');
        return;
      }
      if (!formData.accountId) {
        showToast('Please select an account', 'warning');
        return;
      }

      if (modalType === 'add') {
        await apiFetch('/transactions', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showToast('Transaction logged successfully', 'success');
      } else {
        await apiFetch(`/transactions/${currentTxId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showToast('Transaction updated successfully', 'success');
      }

      setIsModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      showToast(err.message || 'Failed to save transaction', 'error');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setType('');
    setCategoryId('');
    setAccountId('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setPage(1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-notion-border-light dark:border-notion-border-dark pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-notion-text-light dark:text-notion-text-dark">Transactions</h2>
          <p className="text-xs md:text-sm text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium">Log and keep track of your incoming and outgoing transactions.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-stripe-primary hover:bg-stripe-primary/95 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-premium transition-all duration-200 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white dark:bg-notion-sidebar-dark rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium p-4 md:p-5 flex flex-col gap-4">
        {/* Search & Reset */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-notion-text-muted-light dark:text-notion-text-muted-dark" />
            <input
              type="text"
              placeholder="Search description or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="submit"
              className="bg-gray-100 dark:bg-notion-border-dark text-notion-text-light dark:text-notion-text-dark font-semibold text-xs md:text-sm px-4 py-2 rounded-xl border border-notion-border-light dark:border-notion-border-dark hover:bg-gray-200 dark:hover:bg-notion-border-dark/80 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-notion-text-light dark:hover:text-notion-text-dark py-2 px-3 rounded-lg transition-colors border border-dashed border-notion-border-light dark:border-notion-border-dark"
            >
              Reset Filters
            </button>
          </div>
        </form>

        {/* Detailed Grid Select Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Type Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Category</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Account</label>
            <select
              value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highestAmount">Highest Amount</option>
              <option value="lowestAmount">Lowest Amount</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-lg p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table Card List */}
      <div className="bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark shadow-premium rounded-xl overflow-hidden p-4 md:p-5">
        {isLoading ? (
          <div className="flex flex-col gap-4 py-8 animate-pulse-slow">
            <div className="h-6 w-full bg-gray-100 dark:bg-notion-border-dark rounded-lg" />
            <div className="h-6 w-full bg-gray-100 dark:bg-notion-border-dark rounded-lg" />
            <div className="h-6 w-full bg-gray-100 dark:bg-notion-border-dark rounded-lg" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <div className="h-12 w-12 bg-gray-100 dark:bg-notion-border-dark rounded-full flex items-center justify-center text-gray-400">
              <Filter className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-notion-text-light dark:text-notion-text-dark">No transactions found</p>
            <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-notion-border-light dark:border-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium pb-2 text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Account</th>
                    <th className="py-3 px-2">Method</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-notion-border-light dark:divide-notion-border-dark">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="text-notion-text-light dark:text-notion-text-dark hover:bg-gray-50/50 dark:hover:bg-notion-border-dark/20 transition-colors">
                      <td className="py-3 px-2 font-semibold">
                        <div className="flex flex-col">
                          <span>{tx.description}</span>
                          {tx.notes && <span className="text-[10px] font-normal text-notion-text-muted-light dark:text-notion-text-muted-dark truncate max-w-[200px]">{tx.notes}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tx.category.color }} />
                          <span>{tx.category.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">{tx.account.name}</td>
                      <td className="py-3 px-2 uppercase text-[10px] tracking-wider font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">{tx.paymentMethod}</td>
                      <td className="py-3 px-2 text-notion-text-muted-light dark:text-notion-text-muted-dark">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className={`py-3 px-2 text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-stripe-primary transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-notion-border-light dark:border-notion-border-dark pt-4 text-xs font-semibold">
                <span className="text-notion-text-muted-light dark:text-notion-text-muted-dark">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total items)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-notion-border-light dark:border-notion-border-dark disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-notion-border-dark transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-notion-border-light dark:border-notion-border-dark disabled:opacity-40 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-notion-border-dark transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Slide-over Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-fade-in text-notion-text-light dark:text-notion-text-dark"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-notion-border-light dark:border-notion-border-dark pb-2">
              <h3 className="font-bold text-sm md:text-base tracking-tight">
                {modalType === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5 text-xs">
              {/* Type Switcher */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'EXPENSE' }))}
                  className={`flex-grow py-2 rounded-xl font-bold border transition-all ${
                    formData.type === 'EXPENSE'
                      ? 'bg-red-500/10 border-red-300 text-red-600'
                      : 'border-notion-border-light dark:border-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-50 dark:hover:bg-notion-border-dark/30'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'INCOME' }))}
                  className={`flex-grow py-2 rounded-xl font-bold border transition-all ${
                    formData.type === 'INCOME'
                      ? 'bg-green-500/10 border-green-300 text-green-600'
                      : 'border-notion-border-light dark:border-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-50 dark:hover:bg-notion-border-dark/30'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Amount ({user?.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark text-sm font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Foods Groceries"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                />
              </div>

              {/* Category Selection */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                >
                  <option value="" disabled>Select Category</option>
                  {categories
                    .filter((c) => c.type === formData.type)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              {/* Account & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Account</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accountId: e.target.value }))}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-2 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                  >
                    <option value="" disabled>Select Account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-2 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="TRANSFER">Bank Transfer</option>
                    <option value="WALLET">Digital Wallet</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Notes (Optional)</label>
                <textarea
                  placeholder="Add additional details..."
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-notion-border-light dark:border-notion-border-dark pt-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-notion-border-light dark:border-notion-border-dark text-notion-text-light dark:text-notion-text-dark font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-notion-border-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stripe-primary hover:bg-stripe-primary/95 text-white font-semibold rounded-xl shadow-premium transition-all"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
