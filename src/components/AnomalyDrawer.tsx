import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  anomaly: { category: string; current: number; avg: number; ratio: number } | null;
  onClose: () => void;
}

export default function AnomalyDrawer({ open, anomaly, onClose }: Props) {
  const { currency } = useFinance();
  if (!anomaly) return null;

  const markNormal = () => {
    const key = 'finance-anomaly-normalized';
    let list: string[] = [];
    try { list = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
    const monthKey = `${anomaly.category}::${new Date().toISOString().slice(0, 7)}`;
    if (!list.includes(monthKey)) list.push(monthKey);
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('anomaly-normalized'));
    toast.success(`${anomaly.category} marked as normal for this month`);
    onClose();
  };

  const diff = anomaly.current - anomaly.avg;
  const pctOver = Math.round((diff / anomaly.avg) * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-5 pb-8 max-w-lg mx-auto safe-bottom max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-secondary rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-expense/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-expense" />
                </div>
                <h2 className="text-base font-bold">Unusual Spending</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-expense/5 border border-expense/20 rounded-2xl p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="text-lg font-bold">{anomaly.category}</p>
              <p className="text-[11px] text-expense mt-1">{Math.round(anomaly.ratio * 100)}% of your typical spend</p>
            </div>

            {/* Comparison bars */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">This month</span>
                  <span className="font-bold text-expense">{currency}{Math.round(anomaly.current).toLocaleString()}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.6 }}
                    className="h-full bg-expense rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">Your average</span>
                  <span className="font-bold">{currency}{Math.round(anomaly.avg).toLocaleString()}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${100 / anomaly.ratio}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }} className="h-full bg-primary rounded-full" />
                </div>
              </div>
            </div>

            {/* Diff card */}
            <div className="bg-secondary rounded-2xl p-4 mb-5">
              <p className="text-xs text-muted-foreground mb-1">You spent extra</p>
              <p className="text-2xl font-extrabold text-expense">+{currency}{Math.round(diff).toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{pctOver}% above your usual {anomaly.category} spending</p>
            </div>

            <button onClick={markNormal}
              className="w-full py-3.5 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Mark as Normal
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              We won't flag this category as anomaly for the rest of this month.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
