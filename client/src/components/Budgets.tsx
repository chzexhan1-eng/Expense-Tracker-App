import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  Plus,
  Edit2,
  Trash2,
  PieChart,
  Tag,
  AlertTriangle,
  Settings,
  FolderPlus,
  Palette,
  CheckCircle2
} from 'lucide-react';

export const Budgets: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    color: '#3B82F6',
    icon: 'Tag',
    budgetLimit: '',
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/categories');
      setCategories(data);
    } catch (err: any) {
      showToast('Failed to fetch budgets & categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCatId(null);
    setFormData({
      name: '',
      type: 'EXPENSE',
      color: '#3B82F6',
      icon: 'Tag',
      budgetLimit: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setModalMode('edit');
    setSelectedCatId(cat.id);
    setFormData({
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
      budgetLimit: cat.budgetLimit ? cat.budgetLimit.toString() : '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name) {
        showToast('Please enter a category name', 'warning');
        return;
      }

      if (modalMode === 'create') {
        await apiFetch('/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        showToast('Category created successfully', 'success');
      } else {
        await apiFetch(`/categories/${selectedCatId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        showToast('Category and budget updated successfully', 'success');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to save changes', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deleting this category will delete all associated transactions. Proceed?')) return;
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err: any) {
      showToast('Failed to delete category', 'error');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(val);
  };

  const COLORS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
    '#8B5CF6', '#EC4899', '#14B8A6', '#84CC16', '#6B7280'
  ];

  const ICONS = ['Tag', 'Utensils', 'Car', 'ShoppingBag', 'CreditCard', 'Film', 'Heart', 'GraduationCap', 'Laptop', 'TrendingUp'];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse-slow p-6">
        <div className="h-8 w-60 bg-gray-200 dark:bg-notion-border-dark rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 dark:bg-notion-border-dark rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-notion-border-light dark:border-notion-border-dark pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-notion-text-light dark:text-notion-text-dark">Budgets & Categories</h2>
          <p className="text-xs md:text-sm text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium">Manage monthly limits and customize transaction categories.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-stripe-primary hover:bg-stripe-primary/95 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-premium transition-all duration-200 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Category
        </button>
      </div>

      {/* Expense Budgets Cards Grid */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-base text-notion-text-light dark:text-notion-text-dark">Monthly Expense Budgets</h3>
        
        {expenseCategories.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-notion-border-light dark:border-notion-border-dark rounded-xl text-xs text-notion-text-muted-light">
            No expense categories created yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((cat) => {
              const spent = cat.currentSpending || 0;
              const limit = cat.budgetLimit;
              const remaining = limit ? limit - spent : null;
              const usagePercent = limit ? Math.min((spent / limit) * 100, 100) : 0;
              const rawPercent = limit ? (spent / limit) * 100 : 0;

              // Color indicators
              let progressColor = 'bg-stripe-primary';
              let badgeColor = 'bg-stripe-primary/10 text-stripe-primary';
              if (limit) {
                if (rawPercent >= 100) {
                  progressColor = 'bg-red-500';
                  badgeColor = 'bg-red-500/10 text-red-600 dark:text-red-400';
                } else if (rawPercent >= 80) {
                  progressColor = 'bg-amber-500';
                  badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                } else {
                  progressColor = 'bg-green-500';
                  badgeColor = 'bg-green-500/10 text-green-600 dark:text-green-400';
                }
              }

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-notion-sidebar-dark rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium p-5 flex flex-col gap-4 hover:shadow-premium-hover transition-all duration-200"
                >
                  {/* Card Title Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-sm tracking-tight text-notion-text-light dark:text-notion-text-dark">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-stripe-primary transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {cat.isCustom && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Monthly Budget Summary */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium">Spent this month</span>
                      <span className="font-semibold text-notion-text-light dark:text-notion-text-dark">
                        {formatCurrency(spent)}
                        {limit && <span className="text-notion-text-muted-light dark:text-notion-text-muted-dark font-normal"> / {formatCurrency(limit)}</span>}
                      </span>
                    </div>
                    
                    {limit ? (
                      <>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 dark:bg-notion-border-dark h-2 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${progressColor} rounded-full transition-all duration-500`} style={{ width: `${usagePercent}%` }} />
                        </div>
                        
                        {/* Remaining & Warning badge */}
                        <div className="flex items-center justify-between mt-1 text-[10px] md:text-xs">
                          <span className={`font-semibold ${remaining && remaining >= 0 ? 'text-notion-text-muted-light dark:text-notion-text-muted-dark' : 'text-red-500'}`}>
                            {remaining && remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining || 0))} over budget`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${badgeColor}`}>
                            {rawPercent.toFixed(0)}% Used
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] md:text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark italic mt-1">
                        No budget set. Click edit to set monthly limits.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Income Categories Section */}
      <div className="flex flex-col gap-4 mt-4">
        <h3 className="font-bold text-base text-notion-text-light dark:text-notion-text-dark">Income Categories</h3>
        <div className="bg-white dark:bg-notion-sidebar-dark rounded-xl border border-notion-border-light dark:border-notion-border-dark shadow-premium p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {incomeCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-lg border border-notion-border-light dark:border-notion-border-dark bg-gray-50/50 dark:bg-notion-border-dark/10 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-semibold text-notion-text-light dark:text-notion-text-dark truncate">{cat.name}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-stripe-primary"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Category Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-fade-in text-notion-text-light dark:text-notion-text-dark"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-notion-border-light dark:border-notion-border-dark pb-2">
              <h3 className="font-bold text-sm md:text-base tracking-tight">
                {modalMode === 'create' ? 'Create New Category' : 'Edit Category & Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5 text-xs">
              {/* Type Switcher */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={modalMode === 'edit'}
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'EXPENSE' }))}
                  className={`flex-grow py-2 rounded-xl font-bold border transition-all ${
                    formData.type === 'EXPENSE'
                      ? 'bg-red-500/10 border-red-300 text-red-600'
                      : 'border-notion-border-light dark:border-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-50 dark:hover:bg-notion-border-dark/30'
                  } disabled:opacity-50`}
                >
                  Expense Category
                </button>
                <button
                  type="button"
                  disabled={modalMode === 'edit'}
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'INCOME' }))}
                  className={`flex-grow py-2 rounded-xl font-bold border transition-all ${
                    formData.type === 'INCOME'
                      ? 'bg-green-500/10 border-green-300 text-green-600'
                      : 'border-notion-border-light dark:border-notion-border-dark text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-50 dark:hover:bg-notion-border-dark/30'
                  } disabled:opacity-50`}
                >
                  Income Category
                </button>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Restaurants"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark"
                />
              </div>

              {/* Budget limit (only for Expense categories) */}
              {formData.type === 'EXPENSE' && (
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Monthly Budget Limit (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 500.00"
                    value={formData.budgetLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budgetLimit: e.target.value }))}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-stripe-primary/50 text-notion-text-light dark:text-notion-text-dark text-sm font-semibold"
                  />
                </div>
              )}

              {/* Color Swatch */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5" /> Color Selection
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, color: col }))}
                      className="h-6 w-6 rounded-full border border-black/10 flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: col }}
                    >
                      {formData.color === col && (
                        <CheckCircle2 className="h-4.5 w-4.5 text-white stroke-2" />
                      )}
                    </button>
                  ))}
                </div>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
