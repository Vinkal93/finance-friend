import { useState, useEffect, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { EXPENSE_ICONS, INCOME_ICONS, PAYMENT_MODES, EMOJI_PICKER } from '@/types/finance';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SmartTag } from '@/pages/SmartTagsPage';
import { detectAnomaly } from '@/lib/anomaly';

const EXPENSE_CATS = ['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Custom'];
const INCOME_CATS = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];

export default function AddTransaction() {
  const { addTransaction, updateTransaction, transactions, currency, goals, customCategories, addCustomCategory } = useFinance();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [smartTags] = useLocalStorage<SmartTag[]>('finance-smart-tags', []);

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [recurring, setRecurring] = useState(false);
  const [goalId, setGoalId] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('📌');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const aiCategorize = async () => {
    if (!note.trim()) { toast.error('Note dalo pehle (e.g. "Zomato dinner")'); return; }
    setAiLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-categorize`;
      const history = transactions.slice(0, 50).map(t => ({ note: t.note, category: t.category, type: t.type }));
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ note, amount: Number(amount) || 0, type, history }),
      });
      if (!resp.ok) {
        if (resp.status === 429) toast.error('AI rate limit, thodi der baad');
        else if (resp.status === 402) toast.error('AI credits khatam');
        else toast.error('AI failed');
        return;
      }
      const data = await resp.json();
      if (data.category && allCats.includes(data.category)) {
        setCategory(data.category);
        toast.success(`✨ Auto-set: ${data.category}${data.confidence ? ` (${Math.round(data.confidence * 100)}%)` : ''}`);
      } else if (data.category) {
        // Fall back to "Other" or closest
        setCategory(data.category);
        toast.success(`✨ ${data.category}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('AI error');
    } finally {
      setAiLoading(false);
    }
  };


  useEffect(() => {
    if (editId) {
      const tx = transactions.find(t => t.id === editId);
      if (tx) {
        setType(tx.type);
        setAmount(String(tx.amount));
        setCategory(tx.category);
        setNote(tx.note);
        setDate(tx.date);
        setPaymentMode(tx.paymentMode || 'UPI');
        setRecurring(tx.recurring || false);
        setGoalId(tx.goalId || '');
        if (tx.customEmoji) setCustomEmoji(tx.customEmoji);
      }
    }
  }, [editId, transactions]);

  const userCustomCats = customCategories.filter(c => c.forType === type);
  const allCats = type === 'expense'
    ? [...EXPENSE_CATS, ...userCustomCats.map(c => c.name)]
    : [...INCOME_CATS, ...userCustomCats.map(c => c.name)];

  const getIcon = (cat: string) => {
    const custom = customCategories.find(c => c.name === cat);
    if (custom) return custom.emoji;
    return type === 'expense' ? (EXPENSE_ICONS[cat] || '📌') : (INCOME_ICONS[cat] || '💵');
  };

  const handleSubmit = () => {
    if (!amount || !category) { toast.error('Please fill amount and category'); return; }
    const finalCategory = category === 'Custom' && customName ? customName : category;
    const data = {
      type, amount: parseFloat(amount), category: finalCategory, note, date, paymentMode, recurring,
      customEmoji: category === 'Custom' ? customEmoji : undefined,
      goalId: goalId || undefined,
    };

    if (category === 'Custom' && customName) {
      const exists = customCategories.find(c => c.name === customName && c.forType === type);
      if (!exists) addCustomCategory({ name: customName, emoji: customEmoji, forType: type });
    }

    if (editId) {
      updateTransaction(editId, data);
      toast.success('Transaction updated!');
    } else {
      const anomaly = detectAnomaly(
        { amount: parseFloat(amount), category: finalCategory, type },
        transactions
      );
      addTransaction(data);
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} added!`);
      if (anomaly.isAnomaly) {
        setTimeout(() => {
          toast.warning(`⚠️ Unusual spend: ${anomaly.reason}`, { duration: 6000 });
        }, 400);
      }
    }
    navigate('/');
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{editId ? 'Edit' : 'Add'} Transaction</h1>
      </div>

      {/* Type Toggle */}
      <div className="bg-secondary rounded-xl p-1 flex mb-6">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} onClick={() => { setType(t); setCategory(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${type === t ? (t === 'expense' ? 'bg-expense text-primary-foreground' : 'bg-income text-primary-foreground') : 'text-muted-foreground'}`}>
            {t === 'expense' ? '💸 Expense' : '💰 Income'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">{currency}</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
            className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 text-2xl font-bold card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </motion.div>

      {/* Categories */}
      <div className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {allCats.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all active:scale-95 ${category === cat ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'}`}>
              <span className="text-xl">{getIcon(cat)}</span>
              <span className="text-[11px] font-medium">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Category Fields */}
      {category === 'Custom' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Custom Category Name</label>
            <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Zomato, Gym"
              className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emoji</label>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-14 h-14 rounded-xl border border-border bg-card flex items-center justify-center text-2xl">
              {customEmoji}
            </button>
            {showEmojiPicker && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-secondary rounded-xl">
                {EMOJI_PICKER.map(e => (
                  <button key={e} onClick={() => { setCustomEmoji(e); setShowEmojiPicker(false); }} className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-xl hover:ring-2 ring-primary/20">{e}</button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Payment Mode */}
      <div className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Payment Mode</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_MODES.map(mode => (
            <button key={mode} onClick={() => setPaymentMode(mode)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${paymentMode === mode ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Contribution */}
      {goals.length > 0 && (
        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Contribute to Goal (optional)</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setGoalId('')} className={`px-3 py-2 rounded-lg text-xs font-semibold border ${!goalId ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
              None
            </button>
            {goals.map(g => (
              <button key={g.id} onClick={() => setGoalId(g.id)} className={`px-3 py-2 rounded-lg text-xs font-semibold border ${goalId === g.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                {g.icon} {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note, Date, Recurring */}
      <div className="space-y-4 mb-8">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted-foreground">Note</label>
            <button type="button" onClick={aiCategorize} disabled={aiLoading || !note.trim()}
              className="flex items-center gap-1 text-[10px] font-bold text-primary disabled:opacity-40">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              AI auto-categorize
            </button>
          </div>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="What was this for? (e.g. Zomato dinner)"
            className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />

          {/* Smart tag auto-suggest */}
          {category && (() => {
            const matchCat = category === 'Custom' && customName ? customName : category;
            const suggestions = smartTags.filter(t => t.parentCategory === matchCat);
            if (suggestions.length === 0) return null;
            return (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Smart tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map(t => (
                    <button key={t.id} type="button" onClick={() => setNote(t.name)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        note.toLowerCase() === t.name.toLowerCase()
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                      {t.emoji} {t.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer" onClick={() => setRecurring(!recurring)}>
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${recurring ? 'bg-primary border-primary' : 'border-border'}`}>
            {recurring && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          <div>
            <p className="text-sm font-medium">Recurring</p>
            <p className="text-xs text-muted-foreground">Repeats every month</p>
          </div>
        </label>
      </div>

      <button onClick={handleSubmit}
        className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-base fab-shadow active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        <Check className="w-5 h-5" />
        {editId ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
      </button>
    </div>
  );
}
