import type { Transaction } from '@/types/finance';

export interface AnomalyResult {
  isAnomaly: boolean;
  reason?: string;
  avg?: number;
  max?: number;
}

/**
 * Detects whether a new transaction is unusual compared to the user's history
 * for the same category. Returns reason string if anomalous.
 *
 * Heuristics:
 * - amount > 2.5x category average  OR
 * - amount > 1.3x historical max  OR
 * - amount > 5000 absolute (catch-all for first-time)
 */
export function detectAnomaly(
  newTx: { amount: number; category: string; type: 'income' | 'expense' },
  history: Transaction[]
): AnomalyResult {
  if (newTx.type !== 'expense') return { isAnomaly: false };

  const sameCat = history.filter(t => t.type === 'expense' && t.category === newTx.category);
  if (sameCat.length < 3) {
    // Not enough history — only flag genuinely huge ones
    if (newTx.amount > 10000) {
      return { isAnomaly: true, reason: `Large ${newTx.category} expense (no prior history)` };
    }
    return { isAnomaly: false };
  }

  const amounts = sameCat.map(t => t.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const max = Math.max(...amounts);

  if (newTx.amount > avg * 2.5 && newTx.amount > 500) {
    return {
      isAnomaly: true,
      reason: `${Math.round(newTx.amount / avg)}× your average ${newTx.category} spend`,
      avg,
      max,
    };
  }
  if (newTx.amount > max * 1.3) {
    return {
      isAnomaly: true,
      reason: `Highest ${newTx.category} expense yet (was max ${Math.round(max)})`,
      avg,
      max,
    };
  }
  return { isAnomaly: false, avg, max };
}
