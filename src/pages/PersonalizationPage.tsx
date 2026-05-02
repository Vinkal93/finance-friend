import { useFinance } from '@/context/FinanceContext';
import { ThemeMode, AccentColor, FontSize } from '@/context/FinanceContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Type, Paintbrush, RefreshCw, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getAdsEnabled, setAdsEnabled } from '@/lib/ads';
import { useState } from 'react';
import { toast } from 'sonner';

const THEMES: { value: ThemeMode; label: string; icon: string; desc: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️', desc: 'Clean & bright' },
  { value: 'dark', label: 'Dark', icon: '🌙', desc: 'Easy on eyes' },
  { value: 'glass', label: 'Glass', icon: '✨', desc: 'Glassmorphism' },
];
const ACCENTS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'green', label: 'Green', color: 'bg-[hsl(152,58%,38%)]' },
  { value: 'blue', label: 'Blue', color: 'bg-[hsl(217,91%,60%)]' },
  { value: 'purple', label: 'Purple', color: 'bg-[hsl(270,70%,60%)]' },
  { value: 'orange', label: 'Orange', color: 'bg-[hsl(25,95%,55%)]' },
  { value: 'red', label: 'Red', color: 'bg-[hsl(0,72%,55%)]' },
  { value: 'teal', label: 'Teal', color: 'bg-[hsl(180,60%,40%)]' },
];
const FONT_SIZES: { value: FontSize; label: string; desc: string }[] = [
  { value: 'small', label: 'A', desc: 'Small' },
  { value: 'medium', label: 'A', desc: 'Medium' },
  { value: 'large', label: 'A', desc: 'Large' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-secondary'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function PersonalizationPage() {
  const { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize } = useFinance();
  const navigate = useNavigate();
  const [ptrEnabled, setPtrEnabled] = useLocalStorage<boolean>('finance-ptr-enabled', true);
  const [adsOn, setAdsOn] = useState(getAdsEnabled());

  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Personalization</h1>
      </div>

      <p className="text-xs text-muted-foreground mb-5">Customize the look, feel & behavior of your app.</p>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Theme</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(t => (
            <button key={t.value} onClick={() => setTheme(t.value)}
              className={`p-3 rounded-xl border text-center transition-all ${theme === t.value ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'}`}>
              <span className="text-2xl block mb-1">{t.icon}</span>
              <p className="text-xs font-bold">{t.label}</p>
              <p className="text-[9px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Accent */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Paintbrush className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Accent Color</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map(a => (
            <button key={a.value} onClick={() => setAccentColor(a.value)}
              className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full ${a.color} transition-all ${accentColor === a.value ? 'ring-4 ring-primary/30 scale-110' : ''}`} />
              <span className="text-[10px] font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Font Size */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Type className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold">Font Size</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SIZES.map((f, i) => (
            <button key={f.value} onClick={() => setFontSize(f.value)}
              className={`p-3 rounded-xl border text-center transition-all ${fontSize === f.value ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border'}`}>
              <span className={`block mb-1 font-bold ${i === 0 ? 'text-sm' : i === 1 ? 'text-lg' : 'text-2xl'}`}>{f.label}</span>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Behavior */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" /> Behavior
        </h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Pull-to-Refresh</p>
            <p className="text-[10px] text-muted-foreground">Swipe down on Dashboard to refresh data</p>
          </div>
          <Toggle checked={ptrEnabled} onChange={setPtrEnabled} />
        </div>
        <div className="flex items-center justify-between py-2 border-t border-border mt-2 pt-3">
          <div>
            <p className="text-sm font-medium">Show Ads</p>
            <p className="text-[10px] text-muted-foreground">Support free development</p>
          </div>
          <Toggle checked={adsOn} onChange={(v) => { setAdsEnabled(v); setAdsOn(v); toast.success(v ? 'Ads enabled' : 'Ads disabled'); }} />
        </div>
      </motion.div>
    </div>
  );
}
