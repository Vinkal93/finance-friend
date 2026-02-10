import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ExpenseCategory, IncomeCategory, EXPENSE_ICONS, INCOME_ICONS } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

const EXPENSE_CATS: ExpenseCategory[] = ['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Custom'];
const INCOME_CATS: IncomeCategory[] = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];

export default function AddTransaction() {
  const { addTransaction } = useFinance();
  const navigate = useNavigate();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  const icons = type === 'expense' ? EXPENSE_ICONS : INCOME_ICONS;

  const handleSubmit = () => {
    if (!amount || !category) {
      toast.error('Please fill amount and category');
      return;
    }
    addTransaction({
      type,
      amount: parseFloat(amount),
      category: category as any,
      note,
      date,
    });
    toast.success(`${type === 'income' ? 'Income' : 'Expense'} added!`);
    navigate('/');
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Add Transaction</h1>
      </div>

      {/* Type Toggle */}
      <div className="bg-secondary rounded-xl p-1 flex mb-6">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setCategory(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === t
                ? t === 'expense' ? 'bg-expense text-primary-foreground' : 'bg-income text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {t === 'expense' ? '💸 Expense' : '💰 Income'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₹</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 text-2xl font-bold card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <div className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all active:scale-95 ${
                category === cat
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-border bg-card'
              }`}
            >
              <span className="text-xl">{(icons as any)[cat]}</span>
              <span className="text-[11px] font-medium">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Note & Date */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What was this for?"
            className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-base fab-shadow active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        Add {type === 'income' ? 'Income' : 'Expense'}
      </button>
    </div>
  );
}
