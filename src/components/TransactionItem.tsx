import { Transaction, EXPENSE_ICONS, INCOME_ICONS } from '@/types/finance';
import { useFinance } from '@/context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Props {
  transaction: Transaction;
  showActions?: boolean;
}

export default function TransactionItem({ transaction, showActions = false }: Props) {
  const { currency, deleteTransaction } = useFinance();
  const navigate = useNavigate();
  const isIncome = transaction.type === 'income';
  const icon = transaction.customEmoji
    || (isIncome ? INCOME_ICONS[transaction.category] : EXPENSE_ICONS[transaction.category])
    || '📌';
  const [swiped, setSwiped] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) setSwiped(true);
    else setSwiped(false);
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    toast.success('Transaction deleted');
    setShowDeleteConfirm(false);
  };

  const handleClick = () => {
    navigate(`/transaction/${transaction.id}`);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 bg-expense/10 rounded-xl">
        <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg bg-expense text-primary-foreground">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swiped ? -80 : 0 }}
        className="flex items-center gap-3 py-3 bg-card relative z-10 cursor-pointer"
        onClick={handleClick}
      >
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{transaction.category}</p>
          <p className="text-xs text-muted-foreground truncate">
            {transaction.note}
            {transaction.paymentMode && <span className="ml-1 opacity-60">• {transaction.paymentMode}</span>}
            {transaction.recurring && <span className="ml-1">🔄</span>}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
            {isIncome ? '+' : '-'}{currency}{transaction.amount.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        {showActions && (
          <div className="flex gap-1 ml-1">
            <button onClick={(e) => { e.stopPropagation(); navigate(`/add?edit=${transaction.id}`); }} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Transaction?"
        message={`Delete "${transaction.note || transaction.category}" (${currency}${transaction.amount.toLocaleString()})? This cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
