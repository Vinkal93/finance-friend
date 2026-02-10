import { Transaction, EXPENSE_ICONS, INCOME_ICONS, ExpenseCategory, IncomeCategory } from '@/types/finance';
import { useFinance } from '@/context/FinanceContext';

interface Props {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: Props) {
  const { currency } = useFinance();
  const isIncome = transaction.type === 'income';
  const icon = isIncome
    ? INCOME_ICONS[transaction.category as IncomeCategory]
    : EXPENSE_ICONS[transaction.category as ExpenseCategory];

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{transaction.category}</p>
        <p className="text-xs text-muted-foreground truncate">{transaction.note}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{currency}{transaction.amount.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      </div>
    </div>
  );
}
