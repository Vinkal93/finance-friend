import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_QUICK_ITEMS, type QuickItem } from '@/components/QuickAddFAB';
import { useFinance } from '@/context/FinanceContext';
import { EMOJI_PICKER } from '@/types/finance';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Rent', 'Other'];

export default function QuickAddSettingsPage() {
  const navigate = useNavigate();
  const { currency } = useFinance();
  const [items, setItems] = useLocalStorage<QuickItem[]>('finance-quick-items', DEFAULT_QUICK_ITEMS);

  // Notify QuickAddFAB when items change so it picks up updates immediately
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('quick-items-changed'));
  }, [items]);

  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newEmoji, setNewEmoji] = useState('☕');
  const [newCategory, setNewCategory] = useState('Food');
  const [showPicker, setShowPicker] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<QuickItem | null>(null);
  const [editPicker, setEditPicker] = useState(false);

  const addItem = () => {
    if (!newLabel.trim() || !newAmount) {
      toast.error('Label and amount required');
      return;
    }
    const item: QuickItem = {
      id: crypto.randomUUID(),
      emoji: newEmoji,
      label: newLabel.trim(),
      amount: Number(newAmount),
      category: newCategory,
    };
    setItems([...items, item]);
    setNewLabel(''); setNewAmount(''); setNewEmoji('☕');
    toast.success('Quick item added');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    toast.success('Removed');
  };

  const move = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    const next = [...items];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setItems(next);
  };

  const startEdit = (item: QuickItem) => {
    setEditId(item.id);
    setEditDraft({ ...item });
    setEditPicker(false);
  };

  const saveEdit = () => {
    if (!editDraft) return;
    if (!editDraft.label.trim() || !editDraft.amount) {
      toast.error('Label and amount required');
      return;
    }
    setItems(items.map(i => i.id === editDraft.id ? editDraft : i));
    setEditId(null);
    setEditDraft(null);
    toast.success('Updated');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditDraft(null);
  };

  const reset = () => {
    setItems(DEFAULT_QUICK_ITEMS);
    toast.success('Reset to defaults');
  };

  return (
    <div className="pb-28 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Quick Add Settings</h1>
        <button onClick={reset} className="text-xs text-muted-foreground font-semibold">Reset</button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Customize the ⚡ floating button items. Tap ✏️ to edit any item inline.
      </p>

      {/* Add new */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 card-shadow mb-5">
        <h3 className="text-sm font-bold mb-3">Add New Quick Item</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Emoji</label>
            <button onClick={() => setShowPicker(!showPicker)} className="w-full h-11 rounded-lg bg-secondary text-2xl flex items-center justify-center">
              {newEmoji}
            </button>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Label</label>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Chai"
              className="w-full h-11 bg-secondary rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        {showPicker && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-secondary rounded-xl">
            {EMOJI_PICKER.map(e => (
              <button key={e} onClick={() => { setNewEmoji(e); setShowPicker(false); }}
                className="w-9 h-9 rounded-lg bg-card flex items-center justify-center text-xl">{e}</button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Amount ({currency})</label>
            <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0"
              className="w-full h-11 bg-secondary rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="w-full h-11 bg-secondary rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button onClick={addItem} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Quick Item
        </button>
      </motion.div>

      {/* Existing items */}
      <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Your Quick Items ({items.length})</h3>
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, idx) => {
            const isEditing = editId === item.id && editDraft;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="bg-card rounded-xl p-3 card-shadow">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditPicker(!editPicker)} className="w-11 h-11 rounded-lg bg-secondary text-2xl flex items-center justify-center shrink-0">
                        {editDraft!.emoji}
                      </button>
                      <input value={editDraft!.label} onChange={e => setEditDraft({ ...editDraft!, label: e.target.value })} placeholder="Label"
                        className="flex-1 h-11 bg-secondary rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    {editPicker && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-secondary rounded-lg">
                        {EMOJI_PICKER.map(e => (
                          <button key={e} onClick={() => { setEditDraft({ ...editDraft!, emoji: e }); setEditPicker(false); }}
                            className="w-8 h-8 rounded-md bg-card flex items-center justify-center text-lg">{e}</button>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={editDraft!.amount} onChange={e => setEditDraft({ ...editDraft!, amount: Number(e.target.value) })} placeholder="Amount"
                        className="h-10 bg-secondary rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <select value={editDraft!.category} onChange={e => setEditDraft({ ...editDraft!, category: e.target.value })}
                        className="h-10 bg-secondary rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button onClick={cancelEdit} className="flex-1 py-2 rounded-lg bg-secondary text-xs font-bold flex items-center justify-center gap-1">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-[10px] disabled:opacity-30">▲</button>
                      <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-[10px] disabled:opacity-30">▼</button>
                    </div>
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.category} • {currency}{item.amount}</p>
                    </div>
                    <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-lg bg-expense/10 flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-expense" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No quick items yet</p>
        )}
      </div>
    </div>
  );
}
