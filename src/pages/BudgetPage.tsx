import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

const ALL_CATEGORIES = ['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Custom'];

export default function BudgetPage() {
  const { budgets, currency, addBudget, updateBudget, deleteBudget } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  const usedCategories = budgets.map(b => b.category);
  const availableCategories = ALL_CATEGORIES.filter(c => !usedCategories.includes(c) || (editId && budgets.find(b => b.id === editId)?.category === c));

  const resetForm = () => { setEditId(null); setCategory('Food'); setLimit(''); setShowForm(false); };

  const openEdit = (b: typeof budgets[0]) => {
    setEditId(b.id); setCategory(b.category); setLimit(String(b.limit)); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!limit || Number(limit) <= 0) { toast.error('Enter a valid limit'); return; }
    if (editId) {
      updateBudget(editId, { category, limit: Number(limit) });
      toast.success('Budget updated!');
    } else {
      addBudget({ category, limit: Number(limit), spent: 0 });
      toast.success('Budget created!');
    }
    resetForm();
  };

  const confirmDelete = (id: string) => setDeleteConfirm(id);
  const handleDelete = () => {
    if (deleteConfirm) { deleteBudget(deleteConfirm); toast.success('Budget deleted'); setDeleteConfirm(null); }
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">February 2026</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-28 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{editId ? 'Edit Budget' : 'New Budget'}</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableCategories.map(cat => (
                      <button key={cat} onClick={() => setCategory(cat)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${category === cat ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'}`}>
                        <span className="text-xl">{EXPENSE_ICONS[cat] || '📌'}</span>
                        <span className="text-[11px] font-medium">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Monthly Limit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">{currency}</span>
                    <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3.5 pl-10 pr-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold fab-shadow active:scale-[0.98] transition-transform">
                  {editId ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 bg-card rounded-2xl p-5 card-shadow">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-extrabold">{currency}{totalSpent.toLocaleString()}</p>
          </div>
          <p className="text-sm text-muted-foreground">of {currency}{totalLimit.toLocaleString()}</p>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full rounded-full ${overallPct > 90 ? 'bg-expense' : overallPct > 70 ? 'bg-warning' : 'bg-primary'}`} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{Math.round(overallPct)}% of budget used</p>
      </motion.div>

      {budgets.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">💰</span>
          <p className="text-lg font-bold mb-1">No budgets yet</p>
          <p className="text-sm text-muted-foreground">Tap "+" to set your first budget limit</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {budgets.map((budget, i) => {
          const pct = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
          const isOver = budget.spent >= budget.limit;
          return (
            <motion.div key={budget.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className={`bg-card rounded-xl p-4 card-shadow ${isOver ? 'ring-2 ring-expense/30' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{EXPENSE_ICONS[budget.category] || '📌'}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">{budget.category}</p>
                    <div className="flex items-center gap-1">
                      {isOver && <AlertTriangle className="w-4 h-4 text-expense" />}
                      <button onClick={() => openEdit(budget)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => confirmDelete(budget.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-expense"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{currency}{budget.spent.toLocaleString()} / {currency}{budget.limit.toLocaleString()}</p>
                </div>
                <span className={`text-xs font-bold ${isOver ? 'text-expense' : 'text-primary'}`}>{Math.round(pct)}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }} className={`h-full rounded-full ${isOver ? 'bg-expense' : pct > 70 ? 'bg-warning' : 'bg-primary'}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Budget?"
        message="This budget will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
