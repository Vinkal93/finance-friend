import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion } from 'framer-motion';
import { ArrowLeft, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface DashboardWidget {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'balance', label: 'Balance Card', icon: '💰', visible: true },
  { id: 'quick-stats', label: 'Quick Stats', icon: '📊', visible: true },
  { id: 'tools', label: 'Financial Tools', icon: '🛠️', visible: true },
  { id: 'monthly-summary', label: 'Monthly Summary', icon: '📋', visible: true },
  { id: 'recent-tx', label: 'Recent Transactions', icon: '📝', visible: true },
  { id: 'goals-progress', label: 'Goals Progress', icon: '🎯', visible: true },
  { id: 'budget-overview', label: 'Budget Overview', icon: '💳', visible: true },
  { id: 'savings-tip', label: 'Savings Tip', icon: '💡', visible: true },
];

export default function DashboardCustomizePage() {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useLocalStorage<DashboardWidget[]>('finance-dashboard-widgets', DEFAULT_WIDGETS);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setWidgets(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    setWidgets(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    toast.success('Dashboard layout reset!');
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Customize Dashboard</h1>
        <button onClick={resetLayout} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center" title="Reset">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Toggle visibility and reorder widgets. Tap arrows to move items up/down.</p>

      <div className="space-y-2">
        {widgets.map((widget, idx) => (
          <motion.div
            key={widget.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`flex items-center gap-3 bg-card rounded-xl p-3.5 card-shadow transition-all ${!widget.visible ? 'opacity-50' : ''}`}
          >
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveUp(idx)} disabled={idx === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs">▲</button>
              <button onClick={() => moveDown(idx)} disabled={idx === widgets.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs">▼</button>
            </div>
            <span className="text-xl">{widget.icon}</span>
            <span className="flex-1 text-sm font-semibold">{widget.label}</span>
            <button onClick={() => toggleWidget(widget.id)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${widget.visible ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
              {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Hide widgets you don't use to keep your dashboard clean. Reorder them to see what matters most first.
        </p>
      </div>
    </div>
  );
}
