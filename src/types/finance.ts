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

export const EXPENSE_ICONS: Record<ExpenseCategory, string> = {
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

export const INCOME_ICONS: Record<IncomeCategory, string> = {
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

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  note: string;
  date: string;
  paymentMode?: string;
  recurring?: boolean;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
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
