import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFinance } from '@/context/FinanceContext';
import { Subscription } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Trash2, Pause, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

const SUB_ICONS = ['📺', '🎵', '🏋️', '☁️', '📱', '🎮', '📰', '🍿', '📦', '🔒'];

export default function SubscriptionTrackerPage() {
  const navigate = useNavigate();
  const { currency } = useFinance();
  const [subs, setSubs] = useLocalStorage<Subscription[]>('finance-subscriptions', []);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [icon, setIcon] = useState('📺');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => { setName(''); setAmount(''); setCycle('monthly'); setIcon('📺'); setShowForm(false); };

  const handleAdd = () => {
    if (!name || !amount) { toast.error('Fill all fields'); return; }
    setSubs(prev => [...prev, { id: crypto.randomUUID(), name, amount: Number(amount), cycle, icon, active: true }]);
    toast.success('Subscription added!');
    resetForm();
  };

  const toggleActive = (id: string) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDelete = () => {
    if (deleteId) { setSubs(prev => prev.filter(s => s.id !== deleteId)); toast.success('Subscription deleted'); setDeleteId(null); }
  };

  const monthlyTotal = subs.filter(s => s.active).reduce((sum, s) => sum + (s.cycle === 'monthly' ? s.amount : s.amount / 12), 0);
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Subscriptions</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"><Plus className="w-5 h-5" /></button>
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="text-xl font-extrabold">{currency}{Math.round(monthlyTotal).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Yearly</p>
            <p className="text-xl font-extrabold">{currency}{Math.round(yearlyTotal).toLocaleString()}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{subs.filter(s => s.active).length} active subscriptions</p>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Add Subscription</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {SUB_ICONS.map(i => (
                      <button key={i} onClick={() => setIcon(i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border ${icon === i ? 'border-primary bg-primary/10' : 'border-border'}`}>{i}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Netflix" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Billing Cycle</label>
                  <div className="flex gap-2">
                    {(['monthly', 'yearly'] as const).map(c => (
                      <button key={c} onClick={() => setCycle(c)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${cycle === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAdd} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold">Add Subscription</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {subs.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📺</span>
          <p className="text-lg font-bold">No subscriptions</p>
          <p className="text-sm text-muted-foreground">Track your recurring subscriptions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((sub, i) => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-xl p-4 card-shadow ${!sub.active ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sub.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.cycle === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                </div>
                <p className="text-sm font-bold">{currency}{sub.amount.toLocaleString()}</p>
                <button onClick={() => toggleActive(sub.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  {sub.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button onClick={() => setDeleteId(sub.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-expense"><Trash2 className="w-3 h-3" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Subscription?" message="This subscription will be removed from tracking." confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
