import { useEffect, useState } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useSession } from '../hooks/useSession';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
  when: string;
}

export default function AssistantPage() {
  const { session, ready } = useSession();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    api
      .history('rag', 50)
      .then((r) => {
        const flat: Msg[] = [];
        for (const row of [...r.rows].reverse()) {
          flat.push({
            role: 'user',
            text: String(row.question ?? ''),
            when: String(row.created_at ?? ''),
          });
          flat.push({
            role: 'assistant',
            text: String(row.answer ?? ''),
            when: String(row.created_at ?? ''),
          });
        }
        setMsgs(flat);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (!ready) return null;
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-xl font-semibold text-white">Login required</h1>
          <p className="mt-2 text-sm text-white/50">Sign in to talk to the assistant.</p>
          <Link to="/login" className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black px-6 pb-32 pt-28">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-accent/80">Assistant</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">AI Assistant</h1>

        <div className="mt-6 flex-1 space-y-4">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 size={16} className="animate-spin" /> Loading conversations…
            </p>
          ) : msgs.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-white">No conversations yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-white/45">
                The answering engine arrives in the last phase. Past conversations will appear here
                automatically.
              </p>
            </div>
          ) : (
            msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Bot size={15} />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-white text-gray-900' : 'border border-white/10 bg-white/[0.04] text-white/85'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className={`mt-1.5 text-[11px] ${m.role === 'user' ? 'text-gray-400' : 'text-white/35'}`}>
                    {String(m.when).replace('T', ' ').slice(0, 19)}
                  </p>
                </div>
                {m.role === 'user' && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
                    <User size={15} />
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="sticky bottom-24 mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 pl-4 backdrop-blur-xl">
          <input
            disabled
            placeholder="The answering engine arrives in the last phase…"
            className="w-full bg-transparent text-sm text-white/40 outline-none placeholder:text-white/30"
          />
          <button
            disabled
            aria-label="Send (unavailable)"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
