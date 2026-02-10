import { useLocation, useNavigate } from 'react-router-dom';
import { Home, PieChart, Target, Wallet, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/budget', icon: Wallet, label: 'Budget' },
  { path: '/add', icon: Plus, label: 'Add', isFab: true },
  { path: '/analytics', icon: PieChart, label: 'Analytics' },
  { path: '/goals', icon: Target, label: 'Goals' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, label, isFab }) => {
          const isActive = location.pathname === path;

          if (isFab) {
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="relative -mt-6 w-14 h-14 rounded-full gradient-primary fab-shadow flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
              >
                <Plus className="w-7 h-7" />
              </button>
            );
          }

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 relative"
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-6 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
