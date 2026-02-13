import { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Tag, PieChart as PieIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

export interface SmartTag {
  id: string;
  name: string;
  emoji: string;
  parentCategory: string;
}

const COLORS = ['#2d9d6f', '#e8553a', '#e89c3a', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#ef4444', '#06b6d4', '#84cc16'];

export default function SmartTagsPage() {
  const { transactions, currency } = useFinance();
  const navigate = useNavigate();
  const [tags, setTags] = useLocalStorage<SmartTag[]>('finance-smart-tags', []);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏷️');
  const [newParent, setNewParent] = useState('Food');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<string>('all');

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const addTag = () => {
    if (!newName.trim()) { toast.error('Enter tag name'); return; }
    setTags(prev => [...prev, { id: crypto.randomUUID(), name: newName.trim(), emoji: newEmoji, parentCategory: newParent }]);
    setNewName(''); setNewEmoji('🏷️'); setShowAdd(false);
    toast.success('Tag added!');
  };

  const handleDelete = () => {
    if (deleteId) {
      setTags(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
      toast.success('Tag deleted');
    }
  };

  // Tag analytics - match transactions by note containing tag name
  const tagAnalytics = useMemo(() => {
    const filteredTags = selectedParent === 'all' ? tags : tags.filter(t => t.parentCategory === selectedParent);
    return filteredTags.map(tag => {
      const matchingTx = transactions.filter(t =>
        t.category === tag.parentCategory &&
        t.note.toLowerCase().includes(tag.name.toLowerCase())
      );
      const total = matchingTx.reduce((s, t) => s + t.amount, 0);
      return { name: `${tag.emoji} ${tag.name}`, value: total, tag };
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [tags, transactions, selectedParent]);

  const totalTagged = tagAnalytics.reduce((s, d) => s + d.value, 0);

  // Group tags by parent
  const groupedTags = useMemo(() => {
    const map: Record<string, SmartTag[]> = {};
    tags.forEach(t => {
      if (!map[t.parentCategory]) map[t.parentCategory] = [];
      map[t.parentCategory].push(t);
    });
    return map;
  }, [tags]);

  const EMOJI_OPTIONS = ['🏷️', '🍕', '☕', '🛵', '⛽', '🚇', '🎬', '💊', '📱', '🛒', '🏋️', '📦', '🧾', '💇', '🐾', '🌐'];

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Smart Tags</h1>
        <button onClick={() => setShowAdd(true)} className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Add Tag Form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
          <h3 className="text-sm font-bold mb-3">Create Sub-tag</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Parent Category</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => (
                  <button key={cat} onClick={() => setNewParent(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${newParent === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tag Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Zomato, Groceries, Uber"
                className="w-full bg-secondary rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)}
                    className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${newEmoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-secondary'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-secondary text-sm font-semibold">Cancel</button>
              <button onClick={addTag} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Create Tag</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tag Analytics */}
      {tags.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 card-shadow mb-4">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Tag-wise Analytics</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setSelectedParent('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedParent === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              All
            </button>
            {Object.keys(groupedTags).map(cat => (
              <button key={cat} onClick={() => setSelectedParent(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedParent === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {cat}
              </button>
            ))}
          </div>
          {tagAnalytics.length > 0 ? (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tagAnalytics} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {tagAnalytics.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${currency}${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {tagAnalytics.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-medium">{d.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold">{currency}{d.value.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({totalTagged > 0 ? Math.round((d.value / totalTagged) * 100) : 0}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">Add tags matching transaction notes to see analytics</p>
          )}
        </motion.div>
      )}

      {/* Tags List grouped by category */}
      {Object.entries(groupedTags).length > 0 ? (
        Object.entries(groupedTags).map(([cat, catTags]) => (
          <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">{cat}</h3>
            <div className="bg-card rounded-2xl card-shadow divide-y divide-border">
              {catTags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tag.emoji}</span>
                    <span className="text-sm font-semibold">{tag.name}</span>
                  </div>
                  <button onClick={() => setDeleteId(tag.id)} className="w-7 h-7 rounded-lg bg-expense/10 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-expense" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-16">
          <span className="text-5xl block mb-3">🏷️</span>
          <p className="text-sm font-semibold mb-1">No tags yet</p>
          <p className="text-xs text-muted-foreground">Create sub-tags to track exactly where money goes</p>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Tag?" message="This tag will be removed. Continue?" confirmText="Delete" destructive onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
