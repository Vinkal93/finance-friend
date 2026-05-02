import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Props {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const TRIGGER = 110; // increased from 60 — needs longer pull
const MAX_PULL = 160;

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [enabled] = useLocalStorage<boolean>('finance-ptr-enabled', true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;
    if (window.scrollY > 5) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || !enabled) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff <= 0) { setPullDistance(0); return; }
    // Resistance curve — feels heavier as you pull more
    const resisted = Math.min(MAX_PULL, diff * 0.55);
    setPullDistance(resisted);
  };

  const handleTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= TRIGGER && !refreshing) {
      setRefreshing(true);
      try { await onRefresh(); } finally { setRefreshing(false); }
    }
    setPullDistance(0);
  };

  if (!enabled) return <>{children}</>;

  const progress = Math.min(1, pullDistance / TRIGGER);

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {(pullDistance > 0 || refreshing) && (
        <motion.div
          className="flex items-center justify-center overflow-hidden"
          animate={{ height: refreshing ? 50 : pullDistance }}
          transition={{ duration: refreshing ? 0.2 : 0 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-primary ${refreshing ? 'animate-spin' : ''}`}
            style={{
              transform: refreshing ? 'none' : `rotate(${progress * 360}deg)`,
              opacity: refreshing ? 1 : progress,
            }}
          />
        </motion.div>
      )}
      {children}
    </div>
  );
}
