/**
 * On-device categorization fallback when AI is unavailable.
 * Uses keyword rules + past behavior (most-frequent category for same note keyword).
 */
import type { Transaction } from '@/types/finance';

const RULES: { keywords: string[]; category: string }[] = [
  { keywords: ['zomato', 'swiggy', 'restaurant', 'cafe', 'pizza', 'burger', 'meal', 'lunch', 'dinner', 'breakfast', 'food', 'chai', 'coffee', 'tea', 'snack', 'grocery', 'groceries', 'vegetable', 'fruit'], category: 'Food' },
  { keywords: ['uber', 'ola', 'cab', 'taxi', 'auto', 'rickshaw', 'metro', 'bus', 'train', 'flight', 'fuel', 'petrol', 'diesel', 'parking', 'toll'], category: 'Travel' },
  { keywords: ['rent', 'lease', 'maintenance', 'society'], category: 'Rent' },
  { keywords: ['electricity', 'water', 'gas', 'bill', 'recharge', 'wifi', 'internet', 'broadband', 'mobile', 'dth', 'phone'], category: 'Bills' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'shop', 'shopping', 'mall', 'clothes', 'shoes', 'shirt', 'dress'], category: 'Shopping' },
  { keywords: ['medicine', 'doctor', 'hospital', 'pharmacy', 'apollo', 'health', 'gym', 'medical'], category: 'Health' },
  { keywords: ['movie', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube', 'game', 'pubg', 'concert', 'party', 'entertainment'], category: 'Entertainment' },
  { keywords: ['school', 'college', 'course', 'udemy', 'coursera', 'book', 'tuition', 'education', 'class'], category: 'Education' },
  { keywords: ['salary', 'wage'], category: 'Salary' },
  { keywords: ['freelance', 'project', 'gig', 'client'], category: 'Freelance' },
  { keywords: ['dividend', 'stock', 'mutual', 'fund', 'fd', 'interest', 'crypto'], category: 'Investment' },
];

export interface CategorizeResult {
  category: string;
  confidence: number;
  source: 'history' | 'rule' | 'fallback';
}

export function categorizeOnDevice(
  note: string,
  type: 'income' | 'expense',
  history: Transaction[]
): CategorizeResult {
  const noteLower = note.trim().toLowerCase();
  if (!noteLower) return { category: type === 'expense' ? 'Other' : 'Other', confidence: 0, source: 'fallback' };

  // 1. History match: any prior tx with similar note keyword?
  const tokens = noteLower.split(/\s+/).filter(t => t.length > 2);
  const historyMatches: Record<string, number> = {};
  for (const tx of history) {
    if (tx.type !== type) continue;
    const txNote = (tx.note || '').toLowerCase();
    for (const tok of tokens) {
      if (txNote.includes(tok)) {
        historyMatches[tx.category] = (historyMatches[tx.category] || 0) + 1;
        break;
      }
    }
  }
  const historyTop = Object.entries(historyMatches).sort((a, b) => b[1] - a[1])[0];
  if (historyTop && historyTop[1] >= 2) {
    return { category: historyTop[0], confidence: Math.min(1, historyTop[1] / 5), source: 'history' };
  }

  // 2. Rule-based keyword match
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (noteLower.includes(kw)) {
        return { category: rule.category, confidence: 0.7, source: 'rule' };
      }
    }
  }

  // 3. Single-history match (lower confidence)
  if (historyTop) {
    return { category: historyTop[0], confidence: 0.4, source: 'history' };
  }

  return { category: type === 'expense' ? 'Other' : 'Other', confidence: 0, source: 'fallback' };
}
