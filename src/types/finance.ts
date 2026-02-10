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

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  note: string;
  date: string;
  paymentMode?: string;
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
