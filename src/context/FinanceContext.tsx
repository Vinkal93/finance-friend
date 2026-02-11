import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, Goal } from '@/types/finance';
import { toast } from 'sonner';

export type ThemeMode = 'light' | 'dark' | 'glass';

interface CustomCategory {
  id: string;
  name: string;
  emoji: string;
  forType: 'income' | 'expense';
}

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  currency: string;
  setCurrency: (c: string) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  userName: string;
  setUserName: (n: string) => void;
  monthlyIncome: number;
  setMonthlyIncome: (n: number) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  customCategories: CustomCategory[];
  addCustomCategory: (c: Omit<CustomCategory, 'id'>) => void;
  resetAll: () => void;
}

const FinanceContext = createContext<FinanceState | null>(null);

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 45000, category: 'Salary', note: 'Monthly salary', date: '2026-02-01', paymentMode: 'Bank Transfer' },
  { id: '2', type: 'expense', amount: 1200, category: 'Food', note: 'Groceries', date: '2026-02-02', paymentMode: 'UPI' },
  { id: '3', type: 'expense', amount: 3500, category: 'Bills', note: 'Electricity bill', date: '2026-02-03', paymentMode: 'Net Banking' },
  { id: '4', type: 'expense', amount: 800, category: 'Travel', note: 'Cab rides', date: '2026-02-04', paymentMode: 'UPI' },
  { id: '5', type: 'income', amount: 12000, category: 'Freelance', note: 'Web project', date: '2026-02-05', paymentMode: 'Bank Transfer' },
  { id: '6', type: 'expense', amount: 5000, category: 'Shopping', note: 'New shoes', date: '2026-02-06', paymentMode: 'Card' },
  { id: '7', type: 'expense', amount: 2000, category: 'Entertainment', note: 'Movie & dinner', date: '2026-02-07', paymentMode: 'Cash' },
  { id: '8', type: 'expense', amount: 15000, category: 'Rent', note: 'Monthly rent', date: '2026-02-01', paymentMode: 'Bank Transfer' },
  { id: '9', type: 'expense', amount: 1500, category: 'Health', note: 'Medicine', date: '2026-02-08', paymentMode: 'UPI' },
];

const SAMPLE_BUDGETS: Budget[] = [
  { id: '1', category: 'Food', limit: 8000, spent: 4200 },
  { id: '2', category: 'Travel', limit: 3000, spent: 1800 },
  { id: '3', category: 'Shopping', limit: 5000, spent: 5000 },
  { id: '4', category: 'Entertainment', limit: 3000, spent: 2000 },
  { id: '5', category: 'Bills', limit: 6000, spent: 3500 },
];

const SAMPLE_GOALS: Goal[] = [
  { id: '1', name: 'Emergency Fund', icon: '🛡️', targetAmount: 100000, savedAmount: 45000, deadline: '2026-12-31' },
  { id: '2', name: 'New Laptop', icon: '💻', targetAmount: 80000, savedAmount: 32000, deadline: '2026-06-30' },
  { id: '3', name: 'Vacation Trip', icon: '✈️', targetAmount: 50000, savedAmount: 12000, deadline: '2026-08-15' },
];

function applyThemeClass(t: ThemeMode) {
  document.documentElement.classList.remove('dark', 'glass');
  if (t !== 'light') document.documentElement.classList.add(t);
  const meta = document.querySelector('#theme-color-meta');
  if (meta) {
    const colors: Record<ThemeMode, string> = { light: '#f5f7f5', dark: '#171f2b', glass: '#141b2d' };
    meta.setAttribute('content', colors[t]);
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const s = localStorage.getItem('finance-transactions');
    return s ? JSON.parse(s) : SAMPLE_TRANSACTIONS;
  });
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const s = localStorage.getItem('finance-budgets');
    return s ? JSON.parse(s) : SAMPLE_BUDGETS;
  });
  const [goals, setGoals] = useState<Goal[]>(() => {
    const s = localStorage.getItem('finance-goals');
    return s ? JSON.parse(s) : SAMPLE_GOALS;
  });
  const [currency, setCurrency] = useState(() => localStorage.getItem('finance-currency') || '₹');
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('finance-onboarded') === 'true');
  const [userName, setUserName] = useState(() => localStorage.getItem('finance-username') || '');
  const [monthlyIncome, setMonthlyIncome] = useState(() => Number(localStorage.getItem('finance-monthly-income')) || 0);
  const [theme, setThemeState] = useState<ThemeMode>(() => (localStorage.getItem('finance-theme') as ThemeMode) || 'light');
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => {
    const s = localStorage.getItem('finance-custom-cats');
    return s ? JSON.parse(s) : [];
  });

  // Persist all state
  useEffect(() => { localStorage.setItem('finance-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('finance-budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('finance-goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('finance-currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('finance-onboarded', String(onboarded)); }, [onboarded]);
  useEffect(() => { localStorage.setItem('finance-username', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('finance-monthly-income', String(monthlyIncome)); }, [monthlyIncome]);
  useEffect(() => { localStorage.setItem('finance-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('finance-custom-cats', JSON.stringify(customCategories)); }, [customCategories]);

  // Apply theme on mount
  useEffect(() => { applyThemeClass(theme); }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    applyThemeClass(t);
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [newTx, ...prev]);

    // Goal contribution
    if (t.goalId) {
      setGoals(prev => {
        const updated = prev.map(g => g.id === t.goalId ? { ...g, savedAmount: g.savedAmount + t.amount } : g);
        const goal = updated.find(g => g.id === t.goalId);
        if (goal && goal.savedAmount >= goal.targetAmount) {
          toast.success(`🎉 Congratulations! You've achieved your "${goal.name}" goal!`);
        }
        return updated;
      });
    }

    if (t.type === 'expense') {
      setBudgets(prev => {
        const updated = prev.map(b =>
          b.category === t.category ? { ...b, spent: b.spent + t.amount } : b
        );
        const budget = updated.find(b => b.category === t.category);
        if (budget && budget.spent >= budget.limit) {
          toast.warning(`⚠️ Budget exceeded for ${t.category}! Spent ${currency}${budget.spent.toLocaleString()} of ${currency}${budget.limit.toLocaleString()}`);
        } else if (budget && budget.spent >= budget.limit * 0.8) {
          toast.info(`${t.category} budget is at ${Math.round((budget.spent / budget.limit) * 100)}%`);
        }
        return updated;
      });
    }
  }, [currency]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addBudget = useCallback((b: Omit<Budget, 'id'>) => {
    setBudgets(prev => [...prev, { ...b, id: crypto.randomUUID() }]);
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  const addGoal = useCallback((g: Omit<Goal, 'id'>) => {
    setGoals(prev => [...prev, { ...g, id: crypto.randomUUID() }]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      const goal = updated.find(g => g.id === id);
      if (goal && goal.savedAmount >= goal.targetAmount) {
        toast.success(`🎉 Congratulations! You've achieved your "${goal.name}" goal!`);
      }
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const addCustomCategory = useCallback((c: Omit<CustomCategory, 'id'>) => {
    setCustomCategories(prev => [...prev, { ...c, id: crypto.randomUUID() }]);
  }, []);

  const resetAll = useCallback(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('finance-'));
    keys.forEach(k => localStorage.removeItem(k));
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setCurrency('₹');
    setUserName('');
    setMonthlyIncome(0);
    setOnboarded(false);
    setCustomCategories([]);
    setTheme('light');
    toast.success('All data reset! Starting fresh.');
  }, [setTheme]);

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, goals, currency, setCurrency,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal,
      onboarded, setOnboarded,
      userName, setUserName,
      monthlyIncome, setMonthlyIncome,
      theme, setTheme,
      customCategories, addCustomCategory,
      resetAll,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
