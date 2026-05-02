import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, Shield, Smartphone, Zap, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '💸', title: 'Easy Transaction Tracking', desc: 'Add income & expenses in seconds with categories, payment modes & smart tags.' },
  { icon: '🎯', title: 'Goals & Budgets', desc: 'Set savings goals, monthly budgets, and watch your progress in real time.' },
  { icon: '🤖', title: 'AI Finance Assistant', desc: 'Chat with AI to get personalized money advice based on your data.' },
  { icon: '📊', title: 'Predictive Analytics', desc: 'Forecast next month expenses, savings projections & anomaly alerts.' },
  { icon: '🔮', title: 'Forecast Calendar', desc: 'See projected spending on a calendar grid and export it as PDF.' },
  { icon: '🏷️', title: 'Smart Tags', desc: 'Sub-categorize transactions (Food → Zomato, Groceries) for fine analytics.' },
  { icon: '📑', title: 'Custom Report Builder', desc: 'Filter by date, category, payment mode. Export to CSV or PDF.' },
  { icon: '⚡', title: 'Quick Add FAB', desc: 'One-tap entry for your most-used items (Chai, Cab, Petrol, etc.)' },
  { icon: '🎨', title: 'Full Customization', desc: 'Themes (Light/Dark/Glass), accent colors, font sizes, dashboard widgets.' },
  { icon: '🔐', title: 'PIN Lock & Privacy', desc: 'Secure app with 4-digit PIN, with phone-based recovery.' },
  { icon: '☁️', title: 'Offline-First', desc: 'Works offline. AI calls auto-sync when you come back online.' },
  { icon: '📥', title: 'Data Export', desc: 'Download your transactions as CSV anytime.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">About Finance Friend</h1>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl gradient-hero p-6 text-primary-foreground elevated-shadow mb-5 text-center">
        <span className="text-5xl block mb-2">💰</span>
        <h2 className="text-xl font-extrabold">Finance Friend</h2>
        <p className="text-xs opacity-80 mt-1">Your personal money companion</p>
        <p className="text-[10px] opacity-60 mt-3">Version 1.0.0</p>
      </motion.div>

      {/* Mission */}
      <div className="bg-card rounded-2xl p-5 card-shadow mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-expense" />
          <h3 className="text-sm font-bold">Our Mission</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Make personal finance simple, smart, and stress-free for everyone. No accounts, no logins,
          no data leaving your device — just powerful tools to take control of your money.
        </p>
      </div>

      {/* Features */}
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" /> Features
      </h3>
      <div className="space-y-2 mb-5">
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl p-3 card-shadow flex items-start gap-3">
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <p className="text-xs font-bold">{f.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-card rounded-xl p-3 card-shadow text-center">
          <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-[10px] font-bold">Private</p>
          <p className="text-[9px] text-muted-foreground">Local data</p>
        </div>
        <div className="bg-card rounded-xl p-3 card-shadow text-center">
          <Smartphone className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-[10px] font-bold">Mobile</p>
          <p className="text-[9px] text-muted-foreground">Touch-first</p>
        </div>
        <div className="bg-card rounded-xl p-3 card-shadow text-center">
          <Cloud className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-[10px] font-bold">Offline</p>
          <p className="text-[9px] text-muted-foreground">Works anywhere</p>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Made with <Heart className="w-3 h-3 inline text-expense" /> for everyday people.
      </p>
    </div>
  );
}
