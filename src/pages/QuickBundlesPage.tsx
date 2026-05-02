import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Layers, Zap, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFinance } from '@/context/FinanceContext';
import { toast } from 'sonner';

interface BundleItem {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
}
interface Bundle {
  id: string;
  name: string;
  emoji: string;
  items: BundleItem[];
}

const SAMPLE_BUNDLES: Bundle[] = [
  {
    id: 'salary-day',
    name: 'Salary Day',
    emoji: '💰',
    items: [
      { type: 'income', amount: 50000, category: 'Salary', note: 'Monthly salary' },
      { type: 'expense', amount: 15000, category: 'Rent', note: 'Rent' },
      { type: 'expense', amount: 5000, category: 'Bills', note: 'Utilities' },
    ],
  },
  {
    id: 'weekend-out',
    name: 'Weekend Outing',
    emoji: '🎉',
    items: [
      { type: 'expense', amount: 800, category: 'Travel', note: 'Cab' },
      { type: 'expense', amount: 1500, category: 'Food', note: 'Dinner' },
      { type: 'expense', amount: 500, category: 'Entertainment', note: 'Movie' },
    ],
  },
];

export default function QuickBundlesPage() {
  const navigate = useNavigate();
  const { addTransaction, currency } = useFinance();
  const [bundles, setBundles] = useLocalStorage<Bundle[]>('finance-bundles', SAMPLE_BUNDLES);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [items, setItems] = useState<BundleItem[]>([]);
  const [draftType, setDraftType] = useState<'income' | 'expense'>('expense');
  const [draftAmt, setDraftAmt] = useState('');
  const [draftCat, setDraftCat] = useState('Food');
  const [draftNote, setDraftNote] = useState('');

  const addDraft = () => {
    if (!draftAmt) { toast.error('Amount required'); return; }
    setItems([...items, { type: draftType, amount: Number(draftAmt), category: draftCat, note: draftNote }]);
    setDraftAmt(''); setDraftNote('');
  };

  const saveBundle = () => {
    if (!name || items.length === 0) { toast.error('Name + at least 1 item'); return; }
    setBundles([...bundles, { id: crypto.randomUUID(), name, emoji, items }]);
    toast.success('Bundle saved!');
    setShowForm(false); setName(''); setEmoji('📦'); setItems([]);
  };

  const applyBundle = (b: Bundle) => {
    const today = new Date().toISOString().split('T')[0];
    b.items.forEach(it => addTransaction({
      type: it.type, amount: it.amount, category: it.category, note: it.note,
      date: today, paymentMode: 'UPI',
    }));
    toast.success(`${b.emoji} Applied "${b.name}" — ${b.items.length} entries added`);
  };

  const removeBundle = (id: string) => {
    setBundles(bundles.filter(b => b.id !== id));
    toast.success('Bundle removed');
  };

  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Quick Bundles</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-5">
        Save full sets of income + expense items and apply them all in one tap. Perfect for salary day or recurring routines.
      </p>

      {bundles.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-bold">No bundles yet</p>
          <p className="text-xs text-muted-foreground">Tap + to create one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map(b => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <p className="text-sm font-bold">{b.name}</p>
                    <p className="text-[10px] text-muted-foreground">{b.items.length} items</p>
                  </div>
                </div>
                <button onClick={() => removeBundle(b.id)} className="w-8 h-8 rounded-lg bg-expense/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-expense" />
                </button>
              </div>
              <div className="space-y-1.5 mb-3">
                {b.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] bg-secondary rounded-lg px-3 py-1.5">
                    <span className="font-medium">{it.type === 'income' ? '💰' : '💸'} {it.category} — {it.note || 'No note'}</span>
                    <span className={`font-bold ${it.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {it.type === 'income' ? '+' : '-'}{currency}{it.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => applyBundle(b)}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
                <Zap className="w-4 h-4" /> Apply All
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-28 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">New Bundle</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2}
                  className="bg-secondary rounded-lg py-2.5 text-center text-xl" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Bundle name"
                  className="col-span-3 bg-secondary rounded-lg py-2.5 px-3 text-sm" />
              </div>

              <p className="text-[11px] font-bold text-muted-foreground mb-2">Items ({items.length})</p>
              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] bg-secondary rounded-lg px-3 py-1.5">
                    <span>{it.category} — {it.note}</span>
                    <span className={it.type === 'income' ? 'text-income' : 'text-expense'}>
                      {it.type === 'income' ? '+' : '-'}{currency}{it.amount}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-secondary/50 rounded-xl p-3 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select value={draftType} onChange={e => setDraftType(e.target.value as any)}
                    className="bg-card rounded-lg py-2 px-3 text-xs">
                    <option value="expense">💸 Expense</option>
                    <option value="income">💰 Income</option>
                  </select>
                  <input type="number" value={draftAmt} onChange={e => setDraftAmt(e.target.value)} placeholder="Amount"
                    className="bg-card rounded-lg py-2 px-3 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={draftCat} onChange={e => setDraftCat(e.target.value)} placeholder="Category"
                    className="bg-card rounded-lg py-2 px-3 text-xs" />
                  <input value={draftNote} onChange={e => setDraftNote(e.target.value)} placeholder="Note"
                    className="bg-card rounded-lg py-2 px-3 text-xs" />
                </div>
                <button onClick={addDraft} className="w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                  + Add Item
                </button>
              </div>

              <button onClick={saveBundle} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm">
                Save Bundle
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
