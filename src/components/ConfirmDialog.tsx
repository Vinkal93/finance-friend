import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Trash2, Download } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', destructive = false, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-6"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm card-shadow"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${destructive ? 'bg-expense/10' : 'bg-primary/10'}`}>
                {destructive ? <Trash2 className="w-5 h-5 text-expense" /> : <Download className="w-5 h-5 text-primary" />}
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-semibold active:scale-[0.98] transition-transform">
                {cancelText}
              </button>
              <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl font-semibold text-primary-foreground active:scale-[0.98] transition-transform ${destructive ? 'bg-expense' : 'gradient-primary'}`}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
