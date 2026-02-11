export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 'Salary' | 'Freelance' | 'Business' | 'Investment' | 'Other';

export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Rent'
  | 'Bills'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Education'
  | 'Custom';

export const EXPENSE_ICONS: Record<string, string> = {
  Food: '🍔',
  Travel: '🚗',
  Rent: '🏠',
  Bills: '⚡',
  Shopping: '🛒',
  Health: '💊',
  Entertainment: '🎮',
  Education: '📚',
  Custom: '📌',
};

export const INCOME_ICONS: Record<string, string> = {
  Salary: '💰',
  Freelance: '💻',
  Business: '🏢',
  Investment: '📈',
  Other: '💵',
};

export const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Net Banking', 'Bank Transfer', 'Wallet'] as const;
export type PaymentMode = typeof PAYMENT_MODES[number];

export const CURRENCY_OPTIONS = [
  { symbol: '₹', name: 'INR', label: 'Indian Rupee' },
  { symbol: '$', name: 'USD', label: 'US Dollar' },
  { symbol: '€', name: 'EUR', label: 'Euro' },
  { symbol: '£', name: 'GBP', label: 'British Pound' },
  { symbol: '¥', name: 'JPY', label: 'Japanese Yen' },
] as const;

export const GOAL_ICONS = ['🛡️', '💻', '✈️', '🏠', '🚗', '📱', '🎓', '💍', '🏥', '🎯', '💪', '🎁'] as const;

export const EMOJI_PICKER = ['🍕', '☕', '🎬', '🏋️', '🎵', '📦', '🎂', '🧾', '🔧', '💼', '🚌', '🏥', '📱', '🎁', '🐾', '🌐', '🔌', '💇', '🧹', '🎓'] as const;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
  paymentMode?: string;
  recurring?: boolean;
  customEmoji?: string;
  goalId?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  icon: string;
  isPaid: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: 'monthly' | 'yearly';
  icon: string;
  active: boolean;
}

export interface SplitExpense {
  id: string;
  description: string;
  totalAmount: number;
  date: string;
  paidBy: string;
  participants: { name: string; share: number; settled: boolean }[];
}

export interface NetWorthItem {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  amount: number;
  icon: string;
}

export interface SavingsChallenge {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  savedAmount: number;
  startDate: string;
  endDate: string;
  completedDays: string[];
}
