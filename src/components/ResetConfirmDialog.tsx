import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * GitHub-style 3-step destructive confirmation.
 * Step 1: Warning + "I understand"
 * Step 2: Acknowledgement of consequences + "Yes, delete"
 * Step 3: Type "DELETE" to confirm
 */
export default function ResetConfirmDialog({ open, onConfirm, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) {
      setStep(1);
      setTyped('');
    }
  }, [open]);

  const close = () => {
    onCancel();
    setStep(1);
    setTyped('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm card-shadow border-2 border-expense/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-expense/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-expense" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-expense">Danger Zone</h3>
                <p className="text-[10px] text-muted-foreground">Step {step} of 3</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-expense' : 'bg-secondary'}`} />
              ))}
            </div>

            {step === 1 && (
              <>
                <p className="text-sm font-semibold mb-2">⚠️ Are you absolutely sure?</p>
                <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                  This will <b>permanently delete ALL your data</b>:<br />
                  • All transactions<br />
                  • All budgets, goals, bills<br />
                  • Smart tags, templates, custom categories<br />
                  • Settings, theme, PIN, recovery phone<br /><br />
                  <b>This action cannot be undone.</b>
                </p>
                <div className="flex gap-2">
                  <button onClick={close} className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold">Cancel</button>
                  <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-expense/10 text-expense text-sm font-semibold">I understand</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm font-semibold mb-2">😟 Last chance to back out</p>
                <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                  Did you <b>export your data</b> as backup? Once deleted, there's <b>no recovery</b> — even a full reinstall won't bring it back.
                  <br /><br />
                  Tap "Yes, continue" only if you have backed up or truly want to start fresh.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-expense/20 text-expense text-sm font-semibold">Yes, continue</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-sm font-semibold mb-2">🔐 Final confirmation</p>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Type <code className="px-1.5 py-0.5 bg-secondary rounded text-expense font-bold">DELETE</code> in the box below to confirm permanent deletion.
                </p>
                <input
                  autoFocus
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full bg-secondary rounded-lg py-3 px-4 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-expense/30"
                />
                <div className="flex gap-2">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold">Back</button>
                  <button
                    disabled={typed !== 'DELETE'}
                    onClick={() => { onConfirm(); close(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                      typed === 'DELETE' ? 'bg-expense text-primary-foreground' : 'bg-secondary text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Forever
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
