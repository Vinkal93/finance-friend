import { useParams, useNavigate } from 'react-router-dom';
import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS, INCOME_ICONS } from '@/types/finance';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil, Trash2, Calendar, CreditCard, Tag, FileText, RefreshCw, Target } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, currency, deleteTransaction, goals } = useFinance();
  const [showDelete, setShowDelete] = useState(false);

  const tx = transactions.find(t => t.id === id);
  if (!tx) return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto text-center py-20">
      <span className="text-5xl block mb-4">🔍</span>
      <p className="text-lg font-bold">Transaction not found</p>
      <button onClick={() => navigate('/')} className="mt-4 text-primary font-semibold text-sm">Go Home</button>
    </div>
  );

  const isIncome = tx.type === 'income';
  const icon = tx.customEmoji || (isIncome ? INCOME_ICONS[tx.category] : EXPENSE_ICONS[tx.category]) || '📌';
  const goal = tx.goalId ? goals.find(g => g.id === tx.goalId) : null;

  const handleDelete = () => {
    deleteTransaction(tx.id);
    toast.success('Transaction deleted');
    navigate(-1);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Transaction Details</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 card-shadow text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl mx-auto mb-4">
          {icon}
        </div>
        <p className="text-sm text-muted-foreground mb-1">{tx.category}</p>
        <p className={`text-3xl font-extrabold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
        </p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${isIncome ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
          {tx.type.toUpperCase()}
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 card-shadow space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground">Note</p>
            <p className="text-sm font-medium">{tx.note || 'No note'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground">Date</p>
            <p className="text-sm font-medium">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</p>
          </div>
        </div>
        {tx.paymentMode && (
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Payment Mode</p>
              <p className="text-sm font-medium">{tx.paymentMode}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground">Category</p>
            <p className="text-sm font-medium">{icon} {tx.category}</p>
          </div>
        </div>
        {tx.recurring && (
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Recurring</p>
              <p className="text-sm font-medium">Monthly recurring transaction</p>
            </div>
          </div>
        )}
        {goal && (
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Contributing to</p>
              <p className="text-sm font-medium">{goal.icon} {goal.name}</p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => navigate(`/add?edit=${tx.id}`)} className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button onClick={() => setShowDelete(true)} className="flex-1 py-3.5 rounded-xl bg-expense text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <ConfirmDialog open={showDelete} title="Delete Transaction?" message={`Delete "${tx.note || tx.category}"? This cannot be undone.`} confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </div>
  );
}
