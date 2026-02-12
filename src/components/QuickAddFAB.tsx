import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { toast } from 'sonner';

const QUICK_ITEMS = [
  { emoji: '☕', label: 'Chai', amount: 30, category: 'Food' },
  { emoji: '🍕', label: 'Food', amount: 200, category: 'Food' },
  { emoji: '🚗', label: 'Cab', amount: 150, category: 'Travel' },
  { emoji: '⛽', label: 'Petrol', amount: 500, category: 'Travel' },
  { emoji: '🛒', label: 'Grocery', amount: 500, category: 'Food' },
  { emoji: '💊', label: 'Medicine', amount: 200, category: 'Health' },
];

export default function QuickAddFAB() {
  const [open, setOpen] = useState(false);
  const { addTransaction, currency } = useFinance();

  const quickAdd = (item: typeof QUICK_ITEMS[0]) => {
    addTransaction({
      type: 'expense',
      amount: item.amount,
      category: item.category,
      note: item.label,
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI',
    });
    toast.success(`${item.emoji} ${item.label} ${currency}${item.amount} added!`);
    setOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-50 bg-card rounded-2xl p-4 card-shadow w-56">
            <p className="text-xs font-bold mb-3 text-muted-foreground">⚡ Quick Add</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ITEMS.map(item => (
                <button key={item.label} onClick={() => quickAdd(item)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-secondary active:scale-95 transition-transform">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                  <span className="text-[9px] text-muted-foreground">{currency}{item.amount}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full gradient-accent fab-shadow flex items-center justify-center text-primary-foreground active:scale-90 transition-transform">
        {open ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
      </button>
    </>
  );
}
