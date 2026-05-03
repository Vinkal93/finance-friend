import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Loader2, History, Plus, Trash2, X, Lock, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getAIUsage, consumeAIQuery, unlockAIWithAd, type AIUsageInfo } from '@/lib/ads';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Msg[];
  updatedAt: number;
}

const SUGGESTIONS = [
  'Mera paisa kahan ja raha hai is mahine?',
  'Kya main 80,000 ka iPhone afford kar sakta hu?',
  'Kahan kharcha kam karu?',
  'Mere savings tips do',
  'Budget kaise plan karu?',
];

export default function AIAssistantPage() {
  const { transactions, budgets, goals, currency, monthlyIncome, userName } = useFinance();
  const navigate = useNavigate();

  const [conversations, setConversations] = useLocalStorage<Conversation[]>('finance-ai-chats', []);
  const [activeId, setActiveId] = useLocalStorage<string>('finance-ai-active', '');
  const [showHistory, setShowHistory] = useState(false);

  const active = conversations.find(c => c.id === activeId);
  const messages = active?.messages || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<AIUsageInfo>(() => getAIUsage());
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshUsage = () => setUsage(getAIUsage());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    refreshUsage();
    const t = setInterval(refreshUsage, 30000);
    return () => clearInterval(t);
  }, []);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      const ok = await unlockAIWithAd();
      if (ok) {
        toast.success('5 extra AI queries unlocked!');
        refreshUsage();
        setShowUnlock(false);
      } else {
        toast.error('Ad could not be loaded — try again later');
      }
    } finally {
      setUnlocking(false);
    }
  };

  const ensureActive = (): Conversation => {
    if (active) return active;
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations(prev => [conv, ...prev]);
    setActiveId(conv.id);
    return conv;
  };

  const updateActive = (updater: (c: Conversation) => Conversation) => {
    setConversations(prev => prev.map(c => c.id === activeId ? updater(c) : c));
  };

  const newChat = () => {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations(prev => [conv, ...prev]);
    setActiveId(conv.id);
    setShowHistory(false);
  };

  const openChat = (id: string) => {
    setActiveId(id);
    setShowHistory(false);
  };

  const deleteChat = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setActiveId('');
  };

  const buildContext = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const byCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return {
      currency,
      userName: userName || 'User',
      monthlyIncome,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      expensesByCategory: byCategory,
      budgets: budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })),
      goals: goals.map(g => ({ name: g.name, target: g.targetAmount, saved: g.savedAmount })),
      recentTransactions: transactions.slice(0, 10).map(t => ({
        type: t.type, amount: t.amount, category: t.category, note: t.note, date: t.date,
      })),
    };
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const u = getAIUsage();
    if (!u.canQuery) {
      setShowUnlock(true);
      return;
    }
    consumeAIQuery();
    refreshUsage();
    const conv = ensureActive();
    const userMsg: Msg = { role: 'user', content: text };
    const newMessages = [...conv.messages, userMsg];

    // Title = first user message (truncated)
    const title = conv.messages.length === 0 ? text.slice(0, 40) : conv.title;

    setConversations(prev => prev.map(c => c.id === conv.id
      ? { ...c, messages: newMessages, title, updatedAt: Date.now() }
      : c));
    setInput('');
    setLoading(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          financeContext: buildContext(),
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error('AI rate limit, thodi der baad try karo');
        else if (resp.status === 402) toast.error('AI credits khatam');
        else toast.error('AI request failed');
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      // Add empty assistant message
      setConversations(prev => prev.map(c => c.id === conv.id
        ? { ...c, messages: [...newMessages, { role: 'assistant', content: '' }], updatedAt: Date.now() }
        : c));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              setConversations(prev => prev.map(c => {
                if (c.id !== conv.id) return c;
                const msgs = [...newMessages, { role: 'assistant' as const, content: assistantText }];
                return { ...c, messages: msgs, updatedAt: Date.now() };
              }));
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const sortedConvs = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 border-b border-border bg-background">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">{active?.title || 'AI Finance Assistant'}</h1>
          <p className="text-[10px] text-muted-foreground">Personalized insights from your data</p>
        </div>
        <button onClick={() => setShowHistory(true)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <History className="w-4 h-4" />
        </button>
        <button onClick={newChat} className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      {/* History drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowHistory(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-card border-r border-border overflow-y-auto safe-top">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-sm">Chat History</h2>
                <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2">
                <button onClick={newChat} className="w-full flex items-center gap-2 p-3 rounded-lg gradient-primary text-primary-foreground text-xs font-bold mb-2">
                  <Plus className="w-4 h-4" /> New chat
                </button>
                {sortedConvs.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-6">No chats yet</p>
                )}
                {sortedConvs.map(c => (
                  <div key={c.id} className={`group flex items-center gap-2 p-2.5 rounded-lg mb-1 ${c.id === activeId ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary'}`}>
                    <button onClick={() => openChat(c.id)} className="flex-1 text-left min-w-0">
                      <p className="text-xs font-semibold truncate">{c.title}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString()} • {c.messages.length} msgs</p>
                    </button>
                    <button onClick={() => deleteChat(c.id)} className="w-7 h-7 rounded-md bg-expense/10 flex items-center justify-center shrink-0">
                      <Trash2 className="w-3.5 h-3.5 text-expense" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ paddingBottom: '8rem' }}>
        {messages.length === 0 && (
          <div className="py-8">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3">🤖</span>
              <p className="text-sm font-bold mb-1">Hi {userName || 'there'}!</p>
              <p className="text-xs text-muted-foreground">Apne paise ke baare me kuch bhi pucho</p>
              {sortedConvs.length > 0 && (
                <button onClick={() => setShowHistory(true)} className="text-[10px] text-primary font-bold mt-2 inline-flex items-center gap-1">
                  <History className="w-3 h-3" /> {sortedConvs.length} previous chat{sortedConvs.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Try asking:</p>
            <div className="space-y-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="w-full text-left p-3 rounded-xl bg-card card-shadow text-xs hover:bg-secondary transition-colors">
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user' ? 'gradient-primary text-primary-foreground' : 'bg-card card-shadow'
              }`}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none [&>*]:my-1 [&_p]:text-sm [&_li]:text-sm [&_strong]:font-bold [&_ul]:pl-4 [&_ol]:pl-4">
                    <ReactMarkdown>{m.content || '...'}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-card card-shadow rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-background border-t border-border p-3 safe-bottom z-40">
        {/* Usage bar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] text-muted-foreground">
            {usage.used}/{usage.freeLimit + usage.bonus} queries today
            {usage.bonus > 0 && <span className="text-primary"> • +{usage.bonus} bonus</span>}
          </p>
          {!usage.canQuery && (
            <button onClick={() => setShowUnlock(true)}
              className="text-[10px] font-bold text-primary inline-flex items-center gap-1">
              <Play className="w-3 h-3" /> Unlock 5 more
            </button>
          )}
        </div>
        <div className="flex gap-2 items-end">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder={usage.canQuery ? 'Ask anything...' : 'Daily limit reached — watch ad to unlock'}
            disabled={loading || !usage.canQuery}
            className="flex-1 bg-card border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button onClick={() => usage.canQuery ? send(input) : setShowUnlock(true)} disabled={loading || (usage.canQuery && !input.trim())}
            className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform">
            {loading ? <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" /> :
              !usage.canQuery ? <Lock className="w-5 h-5 text-primary-foreground" /> :
              <Send className="w-5 h-5 text-primary-foreground" />}
          </button>
        </div>
      </div>

      {/* Rewarded unlock dialog */}
      <AnimatePresence>
        {showUnlock && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60" onClick={() => !unlocking && setShowUnlock(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-card rounded-3xl p-6 card-shadow">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-3">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-base font-bold mb-1">Daily limit reached</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Watch a short ad to unlock <b className="text-primary">5 more AI queries</b> today.
                </p>
                <button onClick={handleUnlock} disabled={unlocking}
                  className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                  {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {unlocking ? 'Loading ad...' : 'Watch Ad & Unlock'}
                </button>
                <button onClick={() => setShowUnlock(false)} disabled={unlocking}
                  className="w-full mt-2 py-2.5 text-xs text-muted-foreground font-semibold">
                  Maybe later
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
  );
}
