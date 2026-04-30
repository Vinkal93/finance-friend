import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete, Phone, ShieldQuestion } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: React.ReactNode;
}

const MAX_ATTEMPTS = 3;

export default function AppLock({ children }: Props) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const storedPin = localStorage.getItem('finance-pin');
  const recoveryPhone = localStorage.getItem('finance-recovery-phone') || '';

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
        const next = attempts + 1;
        setAttempts(next);
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 500);
        if (next >= MAX_ATTEMPTS) {
          setShowForgot(true);
          toast.error('3 wrong attempts. Use phone recovery.');
        }
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  const handlePhoneRecover = () => {
    if (!recoveryPhone) {
      toast.error('No recovery phone set. Contact support or reinstall.');
      return;
    }
    if (phoneInput.replace(/\D/g, '') === recoveryPhone.replace(/\D/g, '')) {
      localStorage.removeItem('finance-pin');
      toast.success('PIN removed! You can set a new one in Settings.');
      setUnlocked(true);
    } else {
      toast.error('Phone number does not match');
    }
  };

  const phoneHint = recoveryPhone ? `••••••${recoveryPhone.slice(-2)}` : 'No phone set';

  if (showForgot) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <ShieldQuestion className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-xl font-bold mb-2">Forgot PIN?</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the recovery phone number you registered.<br />
            <span className="text-xs">Hint: ends with <b>{phoneHint}</b></span>
          </p>

          <div className="relative mb-3">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              placeholder="Enter full phone number"
              className="w-full bg-card border border-border rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button onClick={handlePhoneRecover} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm mb-2">
            Recover Access
          </button>
          <button onClick={() => { setShowForgot(false); setAttempts(0); }} className="w-full py-2.5 rounded-xl bg-secondary text-sm font-semibold">
            Back to PIN
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">Enter PIN</h1>
        <p className="text-sm text-muted-foreground mb-2">Enter your 4-digit PIN to unlock</p>
        {attempts > 0 && (
          <p className="text-[11px] text-expense mb-6">
            {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts === 1 ? '' : 's'} left
          </p>
        )}
        {attempts === 0 && <div className="mb-6" />}

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
          <button onClick={() => setShowForgot(true)} className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-[10px] font-semibold text-muted-foreground active:scale-95">
            Forgot?
          </button>
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
