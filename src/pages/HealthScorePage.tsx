import { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Shield, Target, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HealthScorePage() {
  const { transactions, budgets, goals, currency } = useFinance();
  const navigate = useNavigate();

  const score = useMemo(() => {
    let s = 50;
    const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

    // Savings rate (max 30 pts)
    const savingsRate = income > 0 ? (income - expense) / income : 0;
    s += Math.min(savingsRate * 100, 30);

    // Budget adherence (max 20 pts)
    const underBudget = budgets.filter(b => b.spent <= b.limit).length;
    const budgetScore = budgets.length > 0 ? (underBudget / budgets.length) * 20 : 10;
    s += budgetScore;

    // Goal progress (max 20 pts)
    const goalProgress = goals.length > 0 ? goals.reduce((a, g) => a + Math.min(g.savedAmount / g.targetAmount, 1), 0) / goals.length * 20 : 0;
    s += goalProgress;

    // Penalty for overspending
    if (expense > income) s -= 20;

    return Math.min(100, Math.max(0, Math.round(s)));
  }, [transactions, budgets, goals]);

  const getGrade = (s: number) => {
    if (s >= 90) return { grade: 'A+', color: 'text-income', bg: 'bg-income/10', msg: 'Outstanding! Your finances are in great shape!' };
    if (s >= 75) return { grade: 'A', color: 'text-income', bg: 'bg-income/10', msg: 'Great job! Keep up the good habits.' };
    if (s >= 60) return { grade: 'B', color: 'text-primary', bg: 'bg-primary/10', msg: 'Good, but there\'s room for improvement.' };
    if (s >= 40) return { grade: 'C', color: 'text-warning', bg: 'bg-warning/10', msg: 'Average. Consider cutting unnecessary expenses.' };
    return { grade: 'D', color: 'text-expense', bg: 'bg-expense/10', msg: 'Needs attention. Review your spending habits.' };
  };

  const { grade, color, bg, msg } = getGrade(score);

  const tips = useMemo(() => {
    const t: string[] = [];
    const income = transactions.filter(tx => tx.type === 'income').reduce((a, tx) => a + tx.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'expense').reduce((a, tx) => a + tx.amount, 0);
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    if (savingsRate < 20) t.push(`💡 Your savings rate is ${Math.round(savingsRate)}%. Try to save at least 20% of income.`);
    const overBudgets = budgets.filter(b => b.spent > b.limit);
    if (overBudgets.length > 0) t.push(`⚠️ ${overBudgets.length} budget(s) exceeded. Reduce spending in ${overBudgets.map(b => b.category).join(', ')}.`);
    if (goals.length === 0) t.push('🎯 Set at least one savings goal to improve your score.');
    const slowGoals = goals.filter(g => g.savedAmount < g.targetAmount * 0.3);
    if (slowGoals.length > 0) t.push(`🐢 ${slowGoals.length} goal(s) need more contributions.`);
    if (expense > income) t.push('🚨 You\'re spending more than you earn! Cut expenses immediately.');
    if (t.length === 0) t.push('🌟 Everything looks great! Keep maintaining your financial health.');
    return t;
  }, [transactions, budgets, goals]);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Financial Health Score</h1>
      </div>

      {/* Score Circle */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-8 card-shadow text-center mb-6">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="52" fill="none"
              stroke={score >= 60 ? 'hsl(var(--income))' : score >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--expense))'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${score * 3.27} 327`}
              initial={{ strokeDasharray: '0 327' }}
              animate={{ strokeDasharray: `${score * 3.27} 327` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-extrabold ${color}`}>{score}</span>
            <span className={`text-lg font-bold ${color}`}>{grade}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{msg}</p>
      </motion.div>

      {/* Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <h2 className="text-sm font-bold mb-3">Score Breakdown</h2>
        <div className="space-y-3">
          {[
            { icon: <Wallet className="w-4 h-4" />, label: 'Savings Rate', max: 30 },
            { icon: <Shield className="w-4 h-4" />, label: 'Budget Discipline', max: 20 },
            { icon: <Target className="w-4 h-4" />, label: 'Goal Progress', max: 20 },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'Base Score', max: 50 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{item.icon}</div>
              <div className="flex-1">
                <p className="text-xs font-medium">{item.label}</p>
                <div className="w-full h-1.5 bg-secondary rounded-full mt-1">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (score / 100) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground">/{item.max}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <h2 className="text-sm font-bold mb-3">💡 Improvement Tips</h2>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <p key={i} className="text-xs text-foreground/80">{tip}</p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
