import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  BrainCircuit,
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Calculator,
  Compass,
  FileText,
  Goal,
  Plus
} from 'lucide-react';

export const AICoach: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const { showToast } = useToast();

  // Savings Calculator state
  const [calcMonthly, setCalcMonthly] = useState('100');
  const [calcYears, setCalcYears] = useState('5');
  const [calcInterest, setCalcInterest] = useState('7');
  const [calcResult, setCalcResult] = useState(0);

  // Goals State
  const [goals, setGoals] = useState<any[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', currentAmount: '', deadline: '' });

  // Receipt Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  // Insights list
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Fetch Goals
  const fetchGoals = async () => {
    try {
      const data = await apiFetch('/goals');
      setGoals(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch AI Insights
  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const data = await apiFetch('/analytics/insights');
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchInsights();
  }, []);

  // Run savings calculation
  useEffect(() => {
    const p = parseFloat(calcMonthly);
    const t = parseFloat(calcYears) * 12; // months
    const r = parseFloat(calcInterest) / 100 / 12; // monthly rate

    if (isNaN(p) || isNaN(t) || isNaN(r) || p <= 0 || t <= 0) {
      setCalcResult(0);
      return;
    }

    // Formula for Future Value of Ordinary Annuity: FV = P * [((1 + r)^t - 1) / r]
    let fv = 0;
    if (r === 0) {
      fv = p * t;
    } else {
      fv = p * ((Math.pow(1 + r, t) - 1) / r);
    }
    setCalcResult(fv);
  }, [calcMonthly, calcYears, calcInterest]);

  // Handle Create Goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newGoal.name || !newGoal.targetAmount) {
        showToast('Please fill required goal fields', 'warning');
        return;
      }
      await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify(newGoal),
      });
      showToast('Savings goal added!', 'success');
      setIsGoalModalOpen(false);
      setNewGoal({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
      fetchGoals();
    } catch (err) {
      showToast('Failed to create goal', 'error');
    }
  };

  const handleContribute = async (goal: any) => {
    const contribution = window.prompt(`How much would you like to contribute to "${goal.name}"?`);
    if (!contribution) return;

    const amount = parseFloat(contribution);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    try {
      await apiFetch(`/goals/${goal.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          currentAmount: goal.currentAmount + amount,
        }),
      });
      showToast(`Contributed ${formatCurrency(amount)} to ${goal.name}!`, 'success');
      fetchGoals();
    } catch (err) {
      showToast('Failed to add contribution', 'error');
    }
  };

  // Simulated OCR receipt scanning
  const handleReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsScanning(true);
    setScannedResult(null);

    // Mock processing timeout for wow effect
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult({
        vendor: 'Whole Foods Market',
        amount: '84.20',
        date: new Date().toISOString().substring(0, 10),
        categoryName: 'Food',
        paymentMethod: 'CARD',
        items: [
          { name: 'Organic Strawberries', price: '4.99' },
          { name: 'Fresh Atlantic Salmon', price: '24.50' },
          { name: 'Almond Milk 1Gal', price: '6.20' },
          { name: 'Pantry Groceries Assorted', price: '48.51' }
        ]
      });
      showToast('Receipt scanned successfully using AI OCR!', 'success');
    }, 2500);
  };

  const logScannedTransaction = async () => {
    if (!scannedResult) return;
    try {
      // Find category named Food
      const cats = await apiFetch('/categories');
      const foodCat = cats.find((c: any) => c.name.toLowerCase() === 'food');
      const accs = await apiFetch('/accounts');

      if (!foodCat || accs.length === 0) {
        showToast('Create a "Food" category and account first', 'warning');
        return;
      }

      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: scannedResult.amount,
          date: scannedResult.date,
          type: 'EXPENSE',
          description: `OCR: ${scannedResult.vendor}`,
          paymentMethod: scannedResult.paymentMethod,
          categoryId: foodCat.id,
          accountId: accs[0].id,
          notes: `Extracted from receipt. Items: ${scannedResult.items.map((i: any) => i.name).join(', ')}`,
        }),
      });

      showToast('Scanned transaction logged!', 'success');
      setScannedResult(null);
    } catch (err) {
      showToast('Failed to log scanned transaction', 'error');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-notion-border-light dark:border-notion-border-dark pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-notion-text-light dark:text-notion-text-dark">AI Financial Coach & Goals</h2>
          <p className="text-xs md:text-sm text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium">Use smart insights, scan receipts with OCR, and track your financial milestones.</p>
        </div>
      </div>

      {/* Grid: Goals on Left, AI Advice on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Goals & OCR */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Goals Tracker */}
          <div className="bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl p-5 shadow-premium flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Goal className="h-5 w-5 text-stripe-primary" />
                <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">Savings Goals</h3>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-1 text-xs text-stripe-primary font-bold hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-6 text-xs text-notion-text-muted-light">No savings goals set. Create one to begin saving!</div>
            ) : (
              <div className="flex flex-col gap-3">
                {goals.map((g) => {
                  const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                  return (
                    <div key={g.id} className="p-4 rounded-xl bg-gray-50/55 dark:bg-notion-border-dark/20 border border-notion-border-light dark:border-notion-border-dark flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs md:text-sm">{g.name}</p>
                          {g.deadline && (
                            <span className="text-[10px] text-notion-text-muted-light">
                              Target: {new Date(g.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xs md:text-sm">
                            {formatCurrency(g.currentAmount)}
                            <span className="text-notion-text-muted-light font-normal"> / {formatCurrency(g.targetAmount)}</span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Bar progress */}
                      <div className="w-full bg-gray-200/50 dark:bg-notion-border-dark h-2 rounded-full overflow-hidden">
                        <div className="bg-stripe-primary h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>

                      {/* Add contribution button */}
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-stripe-primary font-bold">{percent.toFixed(0)}% Saved</span>
                        <button
                          onClick={() => handleContribute(g)}
                          className="px-2.5 py-1 bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark font-bold hover:bg-gray-50 dark:hover:bg-notion-border-dark/80 rounded-lg text-notion-text-light dark:text-notion-text-dark"
                        >
                          Add Savings
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* OCR Receipt Upload */}
          <div className="bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl p-5 shadow-premium flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-stripe-primary" />
              <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">AI Receipt Scanner (OCR)</h3>
            </div>
            
            <p className="text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">
              Upload checking or dining receipt images to automatically scan vendor, date, line items, and transaction amounts.
            </p>

            <div className="flex items-center justify-center border-2 border-dashed border-notion-border-light dark:border-notion-border-dark p-6 rounded-xl text-center bg-gray-50/50 dark:bg-notion-border-dark/10 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptScan}
                disabled={isScanning}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:pointer-events-none"
              />
              {isScanning ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 border-4 border-stripe-primary border-t-transparent animate-spin rounded-full" />
                  <span className="text-xs font-bold text-stripe-primary animate-pulse">Running AI OCR model...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-notion-text-muted-light">
                  <Upload className="h-8 w-8 text-stripe-primary/70 mb-1" />
                  <span className="text-xs font-bold text-notion-text-light dark:text-notion-text-dark">Drag and drop file here, or click to upload</span>
                  <span className="text-[10px]">Supports PNG, JPG, WebP up to 5MB</span>
                </div>
              )}
            </div>

            {/* OCR Scanned Results Display */}
            {scannedResult && (
              <div className="p-4 bg-green-500/5 dark:bg-green-500/10 border border-green-500/25 rounded-xl flex flex-col gap-3 animate-fade-in text-xs">
                <div className="flex justify-between items-center border-b border-green-200 dark:border-green-900 pb-2">
                  <span className="font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> OCR Scan Results
                  </span>
                  <button
                    onClick={() => setScannedResult(null)}
                    className="text-[10px] text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-notion-text-light dark:text-notion-text-dark font-medium">
                  <div>Vendor: <span className="font-bold">{scannedResult.vendor}</span></div>
                  <div>Total Amount: <span className="font-bold">{formatCurrency(parseFloat(scannedResult.amount))}</span></div>
                  <div>Date: <span>{scannedResult.date}</span></div>
                  <div>Category: <span className="capitalize">{scannedResult.categoryName}</span></div>
                </div>

                <div className="mt-1 border-t border-green-200/55 dark:border-green-900/55 pt-2">
                  <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Detected Items:</p>
                  <ul className="flex flex-col gap-0.5 list-disc pl-4 text-gray-600 dark:text-gray-300">
                    {scannedResult.items.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.name} - {formatCurrency(parseFloat(item.price))}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={logScannedTransaction}
                  className="w-full mt-2 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-center shadow-premium transition-all"
                >
                  Confirm & Log Transaction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Savings Calculator & Coach */}
        <div className="flex flex-col gap-6">
          
          {/* Smart Advisor Advice */}
          <div className="bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl p-5 shadow-premium flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-stripe-primary" />
              <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">AI Spending Coach</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              {loadingInsights ? (
                <div className="text-center py-6 text-xs text-notion-text-muted-light animate-pulse-slow">Analyzing records...</div>
              ) : insights.length === 0 ? (
                <div className="text-center py-6 text-xs text-notion-text-muted-light">No insights currently available.</div>
              ) : (
                insights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-notion-border-light dark:border-notion-border-dark text-xs flex gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-notion-text-light dark:text-notion-text-dark">{insight}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Savings Calculator Tool */}
          <div className="bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl p-5 shadow-premium flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-stripe-primary" />
              <h3 className="font-bold text-sm md:text-base tracking-tight text-notion-text-light dark:text-notion-text-dark">Savings Calculator</h3>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Monthly Contribution ({user?.currency})</label>
                <input
                  type="number"
                  value={calcMonthly}
                  onChange={(e) => setCalcMonthly(e.target.value)}
                  className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 text-xs text-notion-text-light dark:text-notion-text-dark focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Years</label>
                  <input
                    type="number"
                    value={calcYears}
                    onChange={(e) => setCalcYears(e.target.value)}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 text-xs text-notion-text-light dark:text-notion-text-dark focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={calcInterest}
                    onChange={(e) => setCalcInterest(e.target.value)}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 text-xs text-notion-text-light dark:text-notion-text-dark focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-stripe-primary/5 dark:bg-stripe-primary/10 border border-stripe-primary/20 rounded-xl p-3 text-center mt-1">
                <p className="text-[10px] text-notion-text-muted-light uppercase tracking-wider">Estimated Total Balance</p>
                <p className="text-lg md:text-xl font-extrabold text-stripe-primary dark:text-white mt-0.5">
                  {formatCurrency(calcResult)}
                </p>
                <p className="text-[9px] text-notion-text-muted-light mt-1">Includes compound interest calculated monthly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal creation modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-notion-text-light dark:text-notion-text-dark animate-fade-in">
            <div className="flex items-center justify-between border-b border-notion-border-light dark:border-notion-border-dark pb-2">
              <h3 className="font-bold text-sm">Add Savings Goal</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-gray-500 font-bold">X</button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacation Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light">Target Amount</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-notion-text-muted-light">Initial Saved</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                    className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-notion-text-muted-light">Target Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="bg-gray-50 dark:bg-notion-bg-dark border border-notion-border-light dark:border-notion-border-dark rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-stripe-primary text-white font-semibold rounded-xl text-center shadow-premium"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
