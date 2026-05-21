import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles, Paperclip, Square, Trash2 } from 'lucide-react';
import { useAction, useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import RobotAvatar from '../components/RobotAvatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SUGGESTIONS = [
  'How should I divide tasks?',
  'Suggest workflow optimization',
  'Generate productivity tips',
  'Analyze project risk',
];

const MOCK_REPLIES = {
  'how should i divide tasks?': "Group by surface area, not feature. Carve a vertical slice (UI + API + data) per engineer so each can ship independently. For this sprint: Jordan on auth, Mira on dashboard, Sam on the AI scoring loop.",
  'suggest workflow optimization': "Move stand-up to async — Loom or text. You'll get ~45 minutes/person/day back. Replace it with one 30-min focused sync on Wednesdays.",
  'generate productivity tips': "Top three: 1) Batch shallow work to a single block after lunch. 2) Protect mornings for deep work. 3) End each day with a 5-min written hand-off.",
  'analyze project risk': "Risk is concentrated in Payments (dependency chain of 4) and Auth (external SDK lag). Parallelize Payments and timebox Auth research to 2 days max before committing.",
  default: "Here's what I'd recommend — split the deliverable into 3 vertical slices, pair engineers on the first slice, and ship the riskiest piece behind a feature flag by Thursday.",
};

export default function ChatAssistant() {
  const { user } = useAuth();
  const [localMessages, setLocalMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);

  const sendMessageAction = useAction(api.chat.sendMessage);
  const clearChatMutation = useMutation(api.chat.clearChatHistory);
  const chatHistory = useQuery(api.chat.getChatHistory, { limit: 50 });

  const greeting = { role: 'ai', text: `Hi ${user?.name || 'there'} — I'm your TaskFlow AI co-pilot. Ask me about tasks, risk, scheduling, or how to unblock your team.` };

  // Build display messages from Convex history + local messages
  const historyMessages = chatHistory
    ? chatHistory.slice().reverse().flatMap(m => [
        { role: 'user', text: m.message },
        { role: 'ai', text: m.response },
      ])
    : [];

  const allMessages = historyMessages.length > 0
    ? [greeting, ...historyMessages, ...localMessages]
    : [greeting, ...localMessages];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [allMessages, typing]);

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || typing) return;
    setInput('');
    setTyping(true);

    // Add user message immediately for instant feedback
    setLocalMessages(m => [...m, { role: 'user', text: t }]);

    try {
      // Try real Gemini via Convex
      const result = await sendMessageAction({ message: t });
      setLocalMessages(m => [...m, { role: 'ai', text: result.response }]);
    } catch {
      // Graceful mock fallback if Gemini not configured
      await new Promise(r => setTimeout(r, 900));
      const key = t.toLowerCase();
      const reply = MOCK_REPLIES[key] || MOCK_REPLIES.default;
      setLocalMessages(m => [...m, { role: 'ai', text: reply }]);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = async () => {
    setLocalMessages([]);
    try { await clearChatMutation(); } catch { }
  };

  const userInitials = (user?.name || 'You').substring(0, 2).toUpperCase();

  return (
    <div className="grid lg:grid-cols-[1fr,320px] gap-6 h-[calc(100vh-9rem)]">
      <div className="glass flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-neon-blue grid place-items-center glow-purple">
                <Sparkles className="w-5 h-5"/>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-bg"/>
            </div>
            <div>
              <div className="font-display font-semibold">TaskFlow Assistant</div>
              <div className="text-xs text-white/40">{typing ? 'thinking…' : 'online · Gemini powered'}</div>
            </div>
          </div>
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-rose-400 transition">
            <Trash2 className="w-3.5 h-3.5"/>Clear
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {allMessages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg grid place-items-center text-xs font-semibold shrink-0
                  ${m.role === 'user' ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-purple to-neon-blue'}`}>
                  {m.role === 'user' ? userInitials : 'AI'}
                </div>
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-gradient-to-br from-purple/40 to-neon-blue/30 rounded-tr-sm'
                    : 'bg-white/[0.04] border border-white/10 rounded-tl-sm'}`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-neon-blue grid place-items-center text-xs font-semibold">AI</div>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                  {[0,1,2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-purple-glow"
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}/>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions (only on fresh chat) */}
        {allMessages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full text-xs glass hover:border-purple/40 transition">{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-end gap-2 glass p-2 rounded-2xl">
            <button className="p-2 text-white/40 hover:text-white"><Paperclip className="w-4 h-4"/></button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
              placeholder="Ask anything about your projects…"
              className="flex-1 bg-transparent resize-none outline-none text-sm py-2 placeholder:text-white/30 max-h-32"
            />
            <button onClick={() => setListening(l => !l)}
              className={`p-2 rounded-lg transition ${listening ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'text-white/40 hover:text-white'}`}>
              {listening ? <Square className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
            </button>
            <button onClick={() => send()} disabled={!input.trim() || typing}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple to-neon-blue disabled:opacity-40 transition">
              <Send className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>

      {/* Robot sidebar */}
      <div className="glass p-6 flex flex-col items-center text-center overflow-hidden relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple/20 blur-3xl rounded-full"/>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-blue/20 blur-3xl rounded-full"/>
        <div className="relative">
          <RobotAvatar size={200} talking={typing}/>
          <div className="font-display text-xl font-semibold mt-4">Co-pilot</div>
          <p className="text-sm text-white/50 max-w-xs mt-2">Powered by Gemini AI. Ask about tasks, risks, deadlines, or team productivity.</p>
          <div className="grid grid-cols-2 gap-2 mt-6 text-xs">
            {['Risk scoring','Workload bal.','Daily brief','Smart routing'].map(l => (
              <div key={l} className="glass px-3 py-2 flex items-center gap-2 text-left">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-glow shadow-[0_0_6px_#A78BFA]"/>{l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
