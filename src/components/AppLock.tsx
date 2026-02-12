import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function AppLock({ children }: Props) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const storedPin = localStorage.getItem('finance-pin');

  useEffect(() => {
    if (!storedPin) setUnlocked(true);
  }, [storedPin]);

  if (unlocked || !storedPin) return <>{children}</>;

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === storedPin) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 500);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">Enter PIN</h1>
        <p className="text-sm text-muted-foreground mb-8">Enter your 4-digit PIN to unlock</p>

        <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} className="flex gap-4 justify-center mb-10">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${
              i < pin.length ? (error ? 'bg-expense scale-110' : 'bg-primary scale-110') : 'bg-muted'
            }`} />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-4 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
            <button key={d} onClick={() => handleDigit(String(d))}
              className="w-16 h-16 rounded-2xl bg-card card-shadow flex items-center justify-center text-xl font-bold active:scale-95 transition-transform">
              {d}
            </button>
          ))}
          <div />
          <button onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-card card-shadow flex items-center justify-center text-xl font-bold active:scale-95 transition-transform">
            0
          </button>
          <button onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center active:scale-95 transition-transform">
            <Delete className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
