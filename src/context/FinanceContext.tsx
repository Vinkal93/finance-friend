import React, { createContext, useContext, useState, useCallback } from 'react';
import { Transaction, Budget, Goal } from '@/types/finance';

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  currency: string;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

const FinanceContext = createContext<FinanceState | null>(null);

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 45000, category: 'Salary', note: 'Monthly salary', date: '2026-02-01' },
  { id: '2', type: 'expense', amount: 1200, category: 'Food', note: 'Groceries', date: '2026-02-02' },
  { id: '3', type: 'expense', amount: 3500, category: 'Bills', note: 'Electricity bill', date: '2026-02-03' },
  { id: '4', type: 'expense', amount: 800, category: 'Travel', note: 'Cab rides', date: '2026-02-04' },
  { id: '5', type: 'income', amount: 12000, category: 'Freelance', note: 'Web project', date: '2026-02-05' },
  { id: '6', type: 'expense', amount: 5000, category: 'Shopping', note: 'New shoes', date: '2026-02-06' },
  { id: '7', type: 'expense', amount: 2000, category: 'Entertainment', note: 'Movie & dinner', date: '2026-02-07' },
  { id: '8', type: 'expense', amount: 15000, category: 'Rent', note: 'Monthly rent', date: '2026-02-01' },
  { id: '9', type: 'expense', amount: 1500, category: 'Health', note: 'Medicine', date: '2026-02-08' },
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

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(SAMPLE_BUDGETS);
  const [goals, setGoals] = useState<Goal[]>(SAMPLE_GOALS);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [newTx, ...prev]);
    if (t.type === 'expense') {
      setBudgets(prev =>
        prev.map(b =>
          b.category === t.category ? { ...b, spent: b.spent + t.amount } : b
        )
      );
    }
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

  const addGoal = useCallback((g: Omit<Goal, 'id'>) => {
    setGoals(prev => [...prev, { ...g, id: crypto.randomUUID() }]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, goals, currency: '₹',
      addTransaction, deleteTransaction,
      addBudget, updateBudget,
      addGoal, updateGoal, deleteGoal,
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
