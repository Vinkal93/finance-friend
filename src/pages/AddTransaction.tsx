import { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ExpenseCategory, IncomeCategory, EXPENSE_ICONS, INCOME_ICONS, PAYMENT_MODES } from '@/types/finance';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

const EXPENSE_CATS: ExpenseCategory[] = ['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Custom'];
const INCOME_CATS: IncomeCategory[] = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];

export default function AddTransaction() {
  const { addTransaction, updateTransaction, transactions, currency } = useFinance();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [recurring, setRecurring] = useState(false);

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
      }
    }
  }, [editId, transactions]);

  const categories = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  const icons = type === 'expense' ? EXPENSE_ICONS : INCOME_ICONS;

  const handleSubmit = () => {
    if (!amount || !category) { toast.error('Please fill amount and category'); return; }
    const data = { type, amount: parseFloat(amount), category: category as any, note, date, paymentMode, recurring };
    if (editId) {
      updateTransaction(editId, data);
      toast.success('Transaction updated!');
    } else {
      addTransaction(data);
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} added!`);
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
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all active:scale-95 ${category === cat ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'}`}>
              <span className="text-xl">{(icons as any)[cat]}</span>
              <span className="text-[11px] font-medium">{cat}</span>
            </button>
          ))}
        </div>
      </div>

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

      {/* Note, Date, Recurring */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="What was this for?"
            className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${recurring ? 'bg-primary border-primary' : 'border-border'}`}>
            {recurring && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>
          <div>
            <p className="text-sm font-medium">Recurring</p>
            <p className="text-xs text-muted-foreground">Repeats every month</p>
          </div>
        </label>
      </div>

      {/* Submit */}
      <button onClick={handleSubmit}
        className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-base fab-shadow active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        <Check className="w-5 h-5" />
        {editId ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
      </button>
    </div>
  );
}
