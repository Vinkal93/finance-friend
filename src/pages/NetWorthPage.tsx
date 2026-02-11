import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFinance } from '@/context/FinanceContext';
import { NetWorthItem } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ASSET_ICONS = ['🏦', '📈', '🏠', '🚗', '💎', '🥇', '💵', '📱'];
const LIABILITY_ICONS = ['🏦', '💳', '🚗', '🏠', '📱', '🎓'];
const COLORS = ['#2d9d6f', '#3b82f6', '#e89c3a', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];

export default function NetWorthPage() {
  const navigate = useNavigate();
  const { currency } = useFinance();
  const [items, setItems] = useLocalStorage<NetWorthItem[]>('finance-networth', []);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'asset' | 'liability'>('asset');
  const [icon, setIcon] = useState('🏦');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => { setName(''); setAmount(''); setType('asset'); setIcon('🏦'); setShowForm(false); };

  const handleAdd = () => {
    if (!name || !amount) { toast.error('Fill all fields'); return; }
    setItems(prev => [...prev, { id: crypto.randomUUID(), name, type, amount: Number(amount), icon }]);
    toast.success(`${type === 'asset' ? 'Asset' : 'Liability'} added!`);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) { setItems(prev => prev.filter(i => i.id !== deleteId)); toast.success('Item deleted'); setDeleteId(null); }
  };

  const assets = items.filter(i => i.type === 'asset');
  const liabilities = items.filter(i => i.type === 'liability');
  const totalAssets = assets.reduce((s, i) => s + i.amount, 0);
  const totalLiabilities = liabilities.reduce((s, i) => s + i.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const chartData = assets.map(a => ({ name: a.name, value: a.amount }));

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Net Worth</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"><Plus className="w-5 h-5" /></button>
      </div>

      {/* Net Worth Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 card-shadow text-center mb-4">
        <p className="text-xs text-muted-foreground">Your Net Worth</p>
        <p className={`text-3xl font-extrabold ${netWorth >= 0 ? 'text-income' : 'text-expense'}`}>{currency}{netWorth.toLocaleString()}</p>
        <div className="flex justify-center gap-6 mt-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Assets</p>
            <p className="text-sm font-bold text-income">{currency}{totalAssets.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Liabilities</p>
            <p className="text-sm font-bold text-expense">{currency}{totalLiabilities.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
          <h2 className="text-sm font-bold mb-2">Asset Allocation</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-card w-full max-w-lg rounded-t-2xl p-5 pb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Add {type === 'asset' ? 'Asset' : 'Liability'}</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(['asset', 'liability'] as const).map(t => (
                    <button key={t} onClick={() => setType(t)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${type === t ? (t === 'asset' ? 'bg-income text-primary-foreground' : 'bg-expense text-primary-foreground') : 'bg-secondary text-muted-foreground'}`}>
                      {t === 'asset' ? '📈 Asset' : '📉 Liability'}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {(type === 'asset' ? ASSET_ICONS : LIABILITY_ICONS).map(i => (
                      <button key={i} onClick={() => setIcon(i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border ${icon === i ? 'border-primary bg-primary/10' : 'border-border'}`}>{i}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={type === 'asset' ? 'e.g. Savings Account' : 'e.g. Car Loan'} className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-secondary rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <button onClick={handleAdd} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold">Add {type === 'asset' ? 'Asset' : 'Liability'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assets */}
      {assets.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2 text-income">📈 Assets</h2>
          <div className="space-y-2">
            {assets.map(item => (
              <div key={item.id} className="bg-card rounded-xl p-3 card-shadow flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-medium flex-1">{item.name}</p>
                <p className="text-sm font-bold text-income">{currency}{item.amount.toLocaleString()}</p>
                <button onClick={() => setDeleteId(item.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-expense"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liabilities */}
      {liabilities.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2 text-expense">📉 Liabilities</h2>
          <div className="space-y-2">
            {liabilities.map(item => (
              <div key={item.id} className="bg-card rounded-xl p-3 card-shadow flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-medium flex-1">{item.name}</p>
                <p className="text-sm font-bold text-expense">{currency}{item.amount.toLocaleString()}</p>
                <button onClick={() => setDeleteId(item.id)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-expense"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">💰</span>
          <p className="text-lg font-bold">Track your net worth</p>
          <p className="text-sm text-muted-foreground">Add assets and liabilities</p>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Item?" message="This item will be removed from your net worth." confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
