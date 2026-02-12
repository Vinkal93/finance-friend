import { motion } from 'framer-motion';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card rounded-2xl p-5 card-shadow animate-pulse ${className}`}>
      <div className="h-3 w-24 bg-muted rounded-full mb-3" />
      <div className="h-6 w-36 bg-muted rounded-full mb-2" />
      <div className="h-2 w-full bg-muted rounded-full" />
    </div>
  );
}

export function SkeletonTransaction() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-muted" />
      <div className="flex-1">
        <div className="h-3 w-20 bg-muted rounded-full mb-2" />
        <div className="h-2 w-32 bg-muted rounded-full" />
      </div>
      <div className="text-right">
        <div className="h-3 w-16 bg-muted rounded-full mb-2" />
        <div className="h-2 w-10 bg-muted rounded-full" />
      </div>
    </div>
  );
}
