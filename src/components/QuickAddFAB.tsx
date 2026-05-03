import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Settings as SettingsIcon } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

export interface QuickItem {
  id: string;
  emoji: string;
  label: string;
  amount: number;
  category: string;
}

export const DEFAULT_QUICK_ITEMS: QuickItem[] = [
  { id: '1', emoji: '☕', label: 'Chai', amount: 30, category: 'Food' },
  { id: '2', emoji: '🍕', label: 'Food', amount: 200, category: 'Food' },
  { id: '3', emoji: '🚗', label: 'Cab', amount: 150, category: 'Travel' },
  { id: '4', emoji: '⛽', label: 'Petrol', amount: 500, category: 'Travel' },
  { id: '5', emoji: '🛒', label: 'Grocery', amount: 500, category: 'Food' },
  { id: '6', emoji: '💊', label: 'Medicine', amount: 200, category: 'Health' },
];

const STORAGE_KEY = 'finance-quick-items';

function readItems(): QuickItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_QUICK_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_QUICK_ITEMS;
  } catch { return DEFAULT_QUICK_ITEMS; }
}

export default function QuickAddFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addTransaction, currency } = useFinance();
  // Read fresh from localStorage every time menu opens (fix sync bug)
  const [items, setItems] = useState<QuickItem[]>(() => readItems());

  // Refresh when menu opens, when storage changes (other tab), or custom event
  useEffect(() => {
    if (open) setItems(readItems());
  }, [open]);

  useEffect(() => {
    const reload = () => setItems(readItems());
    window.addEventListener('storage', reload);
    window.addEventListener('quick-items-changed', reload);
    return () => {
      window.removeEventListener('storage', reload);
      window.removeEventListener('quick-items-changed', reload);
    };
  }, []);

  // Only show on home page (after hooks)
  if (location.pathname !== '/') return null;

  const quickAdd = (item: QuickItem) => {
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
            className="fixed bottom-32 right-4 z-50 bg-card rounded-2xl p-4 card-shadow w-60 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-muted-foreground">⚡ Quick Add</p>
              <button onClick={() => { navigate('/quick-add-settings'); setOpen(false); }} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                <SettingsIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-4">
                No quick items. Tap ⚙ to add some.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {items.map(item => (
                  <button key={item.id} onClick={() => quickAdd(item)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-secondary active:scale-95 transition-transform">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-[10px] font-semibold">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground">{currency}{item.amount}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setOpen(!open)}
        className="fixed right-4 z-[60] w-12 h-12 rounded-full gradient-accent fab-shadow flex items-center justify-center text-primary-foreground active:scale-90 transition-transform"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
        {open ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
      </button>
    </>
  );
}
