import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
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
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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
    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
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
          messages: [...messages, userMsg],
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
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m));
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
        <div>
          <h1 className="text-base font-bold">AI Finance Assistant</h1>
          <p className="text-[10px] text-muted-foreground">Personalized insights from your data</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ paddingBottom: '8rem' }}>
        {messages.length === 0 && (
          <div className="py-8">
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3">🤖</span>
              <p className="text-sm font-bold mb-1">Hi {userName || 'there'}!</p>
              <p className="text-xs text-muted-foreground">Apne paise ke baare me kuch bhi pucho</p>
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
        <div className="flex gap-2 items-end">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask anything..."
            disabled={loading}
            className="flex-1 bg-card border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform">
            {loading ? <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" /> : <Send className="w-5 h-5 text-primary-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
}
