import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { GOAL_ICONS } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function GoalsPage() {
  const { goals, currency, addGoal, updateGoal, deleteGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [savingsInput, setSavingsInput] = useState('');
  const [savingsGoalId, setSavingsGoalId] = useState<string | null>(null);

  const resetForm = () => { setName(''); setIcon('🎯'); setTarget(''); setSaved(''); setDeadline(''); setEditId(null); setShowForm(false); };

  const openEdit = (g: typeof goals[0]) => {
    setEditId(g.id); setName(g.name); setIcon(g.icon); setTarget(String(g.targetAmount)); setSaved(String(g.savedAmount)); setDeadline(g.deadline); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name || !target) { toast.error('Fill name and target amount'); return; }
    if (editId) {
      updateGoal(editId, { name, icon, targetAmount: Number(target), savedAmount: Number(saved) || 0, deadline });
      toast.success('Goal updated!');
    } else {
      addGoal({ name, icon, targetAmount: Number(target), savedAmount: Number(saved) || 0, deadline });
      toast.success('Goal created! 🎯');
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteConfirmId) { deleteGoal(deleteConfirmId); toast.success('Goal deleted'); setDeleteConfirmId(null); }
  };

  const addSavings = () => {
    if (!savingsGoalId || !savingsInput) return;
    const amt = Number(savingsInput);
    if (amt <= 0) { toast.error('Enter a valid amount'); return; }
    const goal = goals.find(g => g.id === savingsGoalId);
    if (goal) {
      updateGoal(savingsGoalId, { savedAmount: goal.savedAmount + amt });
      toast.success(`Added ${currency}${amt.toLocaleString()} to ${goal.name}!`);
    }
    setSavingsGoalId(null);
    setSavingsInput('');
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your savings goals</p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-10 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{editId ? 'Edit Goal' : 'New Goal'}</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_ICONS.map(i => (
                      <button key={i} onClick={() => setIcon(i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border ${icon === i ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'}`}>{i}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Goal Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Laptop" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Amount</label>
                  <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Already Saved</label>
                  <input type="number" value={saved} onChange={e => setSaved(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Deadline</label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold fab-shadow active:scale-[0.98] transition-transform">
                  {editId ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Savings Input Modal */}
      <AnimatePresence>
        {savingsGoalId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-2xl p-6 w-full max-w-sm card-shadow">
              <h3 className="text-lg font-bold mb-3">Add Savings</h3>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">{currency}</span>
                <input type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3.5 pl-10 pr-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setSavingsGoalId(null); setSavingsInput(''); }} className="flex-1 py-3 rounded-xl bg-secondary font-semibold">Cancel</button>
                <button onClick={addSavings} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-bold">Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 bg-card rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-xl font-extrabold">{currency}{goals.reduce((s, g) => s + g.savedAmount, 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of {currency}{goals.reduce((s, g) => s + g.targetAmount, 0).toLocaleString()} target</p>
          </div>
        </div>
      </motion.div>

      {goals.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🎯</span>
          <p className="text-lg font-bold mb-1">No goals yet</p>
          <p className="text-sm text-muted-foreground">Tap "+" to create your first savings goal</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {goals.map((goal, i) => {
          const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          const remaining = goal.targetAmount - goal.savedAmount;
          const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

          return (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="bg-card rounded-xl p-4 card-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{goal.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">{goal.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{daysLeft} days left</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-primary mr-1">{Math.round(pct)}%</span>
                      <button onClick={() => openEdit(goal)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => setDeleteConfirmId(goal.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-expense"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mt-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }} className={`h-full rounded-full ${pct >= 100 ? 'bg-income' : 'bg-primary'}`} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{currency}{goal.savedAmount.toLocaleString()} saved</p>
                    <p className="text-xs font-medium">{currency}{remaining.toLocaleString()} to go</p>
                  </div>
                  <button onClick={() => setSavingsGoalId(goal.id)} className="mt-2 w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold active:scale-[0.98] transition-transform">
                    + Add Savings
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <ConfirmDialog open={!!deleteConfirmId} title="Delete Goal?" message="This goal and its progress will be permanently removed." confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteConfirmId(null)} />
    </div>
  );
}
