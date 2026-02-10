import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { CURRENCY_OPTIONS } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Wallet, Target, ChartPie } from 'lucide-react';

const STEPS = [
  { icon: Wallet, title: 'Welcome!', desc: 'Track your income, expenses & savings in one place. Simple, secure, and smart.' },
  { icon: ChartPie, title: 'Set Up Your Profile', desc: 'Tell us a bit about yourself to personalize your experience.' },
  { icon: Target, title: 'Your Financial Goal', desc: 'Set a monthly income target and start your journey!' },
];

export default function OnboardingPage() {
  const { setCurrency, setOnboarded, setUserName, setMonthlyIncome } = useFinance();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('₹');
  const [income, setIncome] = useState('');

  const next = () => {
    if (step === 2) {
      setCurrency(selectedCurrency);
      setUserName(name || 'User');
      setMonthlyIncome(Number(income) || 0);
      setOnboarded(true);
    } else {
      setStep(s => s + 1);
    }
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === step ? 'bg-primary w-8' : i < step ? 'bg-primary/50' : 'bg-secondary'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
            <StepIcon className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-2xl font-extrabold mb-2">{STEPS[step].title}</h1>
          <p className="text-sm text-muted-foreground mb-8">{STEPS[step].desc}</p>

          {step === 1 && (
            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-card border border-border rounded-xl py-3 px-4 text-sm card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Currency</label>
                <div className="grid grid-cols-3 gap-2">
                  {CURRENCY_OPTIONS.map(c => (
                    <button
                      key={c.symbol}
                      onClick={() => setSelectedCurrency(c.symbol)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedCurrency === c.symbol ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                      }`}
                    >
                      <span className="text-lg font-bold">{c.symbol}</span>
                      <p className="text-[10px] text-muted-foreground">{c.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-left">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Monthly Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">{selectedCurrency}</span>
                <input
                  type="number"
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  placeholder="0"
                  className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 text-2xl font-bold card-shadow focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">You can change this anytime in settings</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={next}
        className="mt-10 w-full max-w-sm py-4 rounded-xl gradient-primary text-primary-foreground font-bold fab-shadow active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        {step === 2 ? 'Get Started' : 'Continue'}
        <ArrowRight className="w-5 h-5" />
      </button>

      {step === 0 && (
        <button onClick={() => { setOnboarded(true); }} className="mt-4 text-sm text-muted-foreground">
          Skip setup →
        </button>
      )}
    </div>
  );
}
