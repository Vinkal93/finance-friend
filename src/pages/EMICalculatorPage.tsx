import { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EMICalculatorPage() {
  const navigate = useNavigate();
  const { currency } = useFinance();
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');

  const result = useMemo(() => {
    const P = Number(principal);
    const r = Number(rate) / 12 / 100;
    const n = Number(tenure) * 12;
    if (!P || !r || !n) return null;
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    return { emi: Math.round(emi), totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest) };
  }, [principal, rate, tenure]);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">EMI Calculator</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow space-y-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Loan Amount ({currency})</label>
          <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full bg-secondary rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Interest Rate (% per year)</label>
          <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className="w-full bg-secondary rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tenure (years)</label>
          <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} className="w-full bg-secondary rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 space-y-4">
          <div className="bg-card rounded-2xl p-6 card-shadow text-center">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-7 h-7 text-primary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Monthly EMI</p>
            <p className="text-3xl font-extrabold text-primary">{currency}{result.emi.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-4 card-shadow text-center">
              <p className="text-xs text-muted-foreground">Total Interest</p>
              <p className="text-lg font-bold text-expense">{currency}{result.totalInterest.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-xl p-4 card-shadow text-center">
              <p className="text-xs text-muted-foreground">Total Payment</p>
              <p className="text-lg font-bold">{currency}{result.totalPayment.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold mb-2">💡 Quick Facts</h3>
            <p className="text-xs text-foreground/80">• You'll pay {currency}{result.totalInterest.toLocaleString()} as interest over {tenure} years</p>
            <p className="text-xs text-foreground/80 mt-1">• That's {Math.round((result.totalInterest / Number(principal)) * 100)}% of your loan amount in interest</p>
            <p className="text-xs text-foreground/80 mt-1">• Prepaying just 1 extra EMI/year can save ~15% interest</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
