import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, Goal } from '@/types/finance';
import { toast } from 'sonner';

export type ThemeMode = 'light' | 'dark' | 'glass';
export type AccentColor = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'teal';
export type FontSize = 'small' | 'medium' | 'large';

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
  accentColor: AccentColor;
  setAccentColor: (c: AccentColor) => void;
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
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

const ACCENT_CSS: Record<AccentColor, { primary: string; gradient: string; ring: string }> = {
  green: { primary: '152 58% 38%', gradient: 'linear-gradient(135deg, hsl(152,58%,38%), hsl(160,60%,30%))', ring: '152 58% 38%' },
  blue: { primary: '217 91% 60%', gradient: 'linear-gradient(135deg, hsl(217,91%,60%), hsl(230,80%,50%))', ring: '217 91% 60%' },
  purple: { primary: '270 70% 60%', gradient: 'linear-gradient(135deg, hsl(270,70%,60%), hsl(290,60%,50%))', ring: '270 70% 60%' },
  orange: { primary: '25 95% 55%', gradient: 'linear-gradient(135deg, hsl(25,95%,55%), hsl(15,90%,48%))', ring: '25 95% 55%' },
  red: { primary: '0 72% 55%', gradient: 'linear-gradient(135deg, hsl(0,72%,55%), hsl(350,80%,48%))', ring: '0 72% 55%' },
  teal: { primary: '180 60% 40%', gradient: 'linear-gradient(135deg, hsl(180,60%,40%), hsl(195,70%,35%))', ring: '180 60% 40%' },
};

function applyThemeClass(t: ThemeMode) {
  document.documentElement.classList.remove('dark', 'glass');
  if (t !== 'light') document.documentElement.classList.add(t);
  const meta = document.querySelector('#theme-color-meta');
  if (meta) {
    const colors: Record<ThemeMode, string> = { light: '#f5f7f5', dark: '#171f2b', glass: '#141b2d' };
    meta.setAttribute('content', colors[t]);
  }
}

function applyAccentColor(accent: AccentColor, theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'glass') return; // glass has its own accent
  const css = ACCENT_CSS[accent];
  root.style.setProperty('--primary', css.primary);
  root.style.setProperty('--ring', css.ring);
  root.style.setProperty('--gradient-primary', css.gradient);
  root.style.setProperty('--gradient-hero', css.gradient);
  root.style.setProperty('--shadow-fab', `0 6px 20px -4px hsl(${css.primary} / 0.4)`);
  root.style.setProperty('--income', css.primary);
}

function applyFontSize(fs: FontSize) {
  const sizes: Record<FontSize, string> = { small: '14px', medium: '16px', large: '18px' };
  document.documentElement.style.fontSize = sizes[fs];
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
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => (localStorage.getItem('finance-accent') as AccentColor) || 'green');
  const [fontSize, setFontSizeState] = useState<FontSize>(() => (localStorage.getItem('finance-fontsize') as FontSize) || 'medium');
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => {
    const s = localStorage.getItem('finance-custom-cats');
    return s ? JSON.parse(s) : [];
  });

  // Persist
  useEffect(() => { localStorage.setItem('finance-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('finance-budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('finance-goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('finance-currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('finance-onboarded', String(onboarded)); }, [onboarded]);
  useEffect(() => { localStorage.setItem('finance-username', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('finance-monthly-income', String(monthlyIncome)); }, [monthlyIncome]);
  useEffect(() => { localStorage.setItem('finance-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('finance-accent', accentColor); }, [accentColor]);
  useEffect(() => { localStorage.setItem('finance-fontsize', fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem('finance-custom-cats', JSON.stringify(customCategories)); }, [customCategories]);

  // Apply on mount
  useEffect(() => {
    applyThemeClass(theme);
    applyAccentColor(accentColor, theme);
    applyFontSize(fontSize);
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    applyThemeClass(t);
    // Re-apply accent after theme change (unless glass)
    const accent = (localStorage.getItem('finance-accent') as AccentColor) || 'green';
    setTimeout(() => applyAccentColor(accent, t), 50);
  }, []);

  const setAccentColor = useCallback((c: AccentColor) => {
    setAccentColorState(c);
    const t = (localStorage.getItem('finance-theme') as ThemeMode) || 'light';
    applyAccentColor(c, t);
  }, []);

  const setFontSize = useCallback((f: FontSize) => {
    setFontSizeState(f);
    applyFontSize(f);
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [newTx, ...prev]);

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
          toast.warning(`⚠️ Budget exceeded for ${t.category}!`);
        } else if (budget && budget.spent >= budget.limit * 0.8) {
          toast.info(`${t.category} budget is at ${Math.round((budget.spent / budget.limit) * 100)}%`);
        }
        return updated;
      });
    }
  }, []);

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
    // Also clear PIN key (already starts with finance-) and session flags
    sessionStorage.removeItem('dashboard-loaded');
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setCurrency('₹');
    setUserName('');
    setMonthlyIncome(0);
    setOnboarded(false);
    setCustomCategories([]);
    setTheme('light');
    setAccentColor('green');
    setFontSize('medium');
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--ring');
    document.documentElement.style.removeProperty('--gradient-primary');
    document.documentElement.style.removeProperty('--gradient-hero');
    document.documentElement.style.removeProperty('--shadow-fab');
    document.documentElement.style.removeProperty('--income');
    document.documentElement.style.fontSize = '16px';
    toast.success('All data reset! Starting fresh.');
  }, [setTheme, setAccentColor, setFontSize]);

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
      accentColor, setAccentColor,
      fontSize, setFontSize,
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
