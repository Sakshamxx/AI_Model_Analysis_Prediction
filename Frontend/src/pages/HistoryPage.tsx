import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useSession } from '../hooks/useSession';

type Kind = 'predictions' | 'classifications' | 'feedback' | 'rag';
type Row = Record<string, unknown>;

const TABS: { id: Kind; label: string }[] = [
  { id: 'predictions', label: 'Prices' },
  { id: 'classifications', label: 'Tiers' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'rag', label: 'Assistant' },
];

const PAGE = 10;

function summary(kind: Kind, row: Row): string {
  if (kind === 'predictions') return `$${Number(row.predicted_price ?? 0).toFixed(4)} / 1M`;
  if (kind === 'classifications')
    return `${String(row.predicted_tier ?? '?')}${row.actual_tier ? ` → ${row.actual_tier}` : ''}`;
  if (kind === 'feedback') return `$${Number(row.actual_price ?? 0).toFixed(4)} actual`;
  return String(row.question ?? '').slice(0, 80);
}

export default function HistoryPage() {
  const { session, ready } = useSession();
  const [kind, setKind] = useState<Kind>('predictions');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError(null);
    setPage(0);
    api
      .history(kind, 100)
      .then((r) => setRows(r.rows))
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load history.'))
      .finally(() => setLoading(false));
  }, [session, kind]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : rows;
    return [...list].sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
  }, [rows, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice(page * PAGE, page * PAGE + PAGE);

  if (!ready) return null;
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-xl font-semibold text-white">Login required</h1>
          <p className="mt-2 text-sm text-white/50">Your history lives behind your account.</p>
          <Link to="/login" className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 pb-32 pt-28">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-accent/80">Archive</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">Past Predictions</h1>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setKind(t.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  kind === t.id ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/75'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search…"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/60 sm:max-w-xs"
          />
        </div>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-white/50">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="mt-8 text-sm text-red-300">{error}</p>
        ) : view.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-white">Nothing here yet</p>
            <p className="mt-1.5 text-sm text-white/45">
              {query ? 'No rows match your search.' : 'Run a prediction and it will appear here.'}
            </p>
            {!query && (
              <Link
                to="/predict"
                className="mt-5 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900"
              >
                Predict now
              </Link>
            )}
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-3">
              {view.map((r) => {
                const id = String(r.id ?? Math.random());
                const expanded = open === id;
                return (
                  <li key={id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    <button
                      onClick={() => setOpen(expanded ? null : id)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <span>
                        <span className="block text-sm font-medium text-white">{summary(kind, r)}</span>
                        <span className="mt-0.5 block text-xs text-white/40">
                          {String(r.created_at ?? '').replace('T', ' ').slice(0, 19)}
                          {typeof r.model_name === 'string' ? ` · ${r.model_name}` : ''}
                        </span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {expanded && (
                      <pre className="max-h-72 overflow-auto border-t border-white/10 bg-black/40 p-5 text-xs leading-relaxed text-white/60">
                        {JSON.stringify(r.features ?? r, null, 2)}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex items-center justify-between text-sm text-white/45">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="tabular-nums">
                {page + 1} / {pages} · {filtered.length} rows
              </span>
              <button
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
