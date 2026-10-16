import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type PriceResult, type SampleSchema, type TierResult } from '../lib/api';
import { useSession } from '../hooks/useSession';

const CAP_LABEL: Record<string, string> = {
  supports_vision: 'Vision',
  supports_function_calling: 'Tool calling',
  supports_reasoning: 'Reasoning',
  supports_prompt_caching: 'Prompt caching',
  supports_pdf_input: 'PDF input',
  supports_web_search: 'Web search',
  supports_audio_input: 'Audio input',
  supports_audio_output: 'Audio output',
  supports_video_input: 'Video input',
  supports_response_schema: 'Structured output',
  supports_computer_use: 'Computer use',
  supports_system_messages: 'System messages',
};

const pretty = (col: string) =>
  CAP_LABEL[col] ?? col.replace(/^supports_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

type Values = Record<string, string | boolean | null>;

export default function PredictPage() {
  const { session, ready } = useSession();
  const [schema, setSchema] = useState<SampleSchema | null>(null);
  const [values, setValues] = useState<Values>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<PriceResult | null>(null);
  const [tier, setTier] = useState<TierResult | null>(null);
  const [actualPrice, setActualPrice] = useState('');
  const [correctTier, setCorrectTier] = useState('');
  const [fbMsg, setFbMsg] = useState<string | null>(null);

  useEffect(() => {
    api
      .sampleFeatures()
      .then((s) => {
        setSchema(s);
        const init: Values = {};
        for (const c of s.feature_order) {
          const v = s.example[c];
          init[c] = typeof v === 'boolean' ? v : v === null || v === undefined ? '' : String(v);
        }
        setValues(init);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load model schema.'));
  }, []);

  if (!ready) return null;
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <h1 className="text-xl font-semibold text-white">Login required</h1>
          <p className="mt-2 text-sm text-white/50">Sign in to run predictions.</p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const strings = schema?.feature_order.filter((c) => typeof schema.example[c] === 'string') ?? [];
  const numbers = schema?.feature_order.filter((c) => typeof schema.example[c] === 'number') ?? [];
  const bools = schema?.feature_order.filter((c) => typeof schema.example[c] === 'boolean') ?? [];

  function payload(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const c of schema?.feature_order ?? []) {
      const v = values[c];
      if (typeof schema?.example[c] === 'number') {
        out[c] = v === '' || v === null ? null : Number(v);
      } else {
        out[c] = v === '' ? null : v;
      }
    }
    return out;
  }

  async function onPredict(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFbMsg(null);
    setLoading(true);
    try {
      const f = payload();
      const [p, t] = await Promise.all([api.predictPrice(f), api.predictTier(f)]);
      setPrice(p);
      setTier(t);
      setCorrectTier('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  }

  async function sendPriceFeedback() {
    const n = Number(actualPrice);
    if (!(n >= 0)) {
      setFbMsg('Enter a valid price first.');
      return;
    }
    try {
      await api.feedbackPrice(payload(), n, price?.predicted_price_per_1m_output_tokens);
      setFbMsg('Thanks — your price was saved for retraining.');
    } catch (err) {
      setFbMsg(err instanceof Error ? err.message : 'Could not save feedback.');
    }
  }

  async function sendTierFeedback() {
    if (!tier?.history_id || !correctTier) {
      setFbMsg('Pick the correct tier first.');
      return;
    }
    try {
      await api.feedbackTier(tier.history_id, correctTier);
      setFbMsg('Thanks — tier correction saved for retraining.');
    } catch (err) {
      setFbMsg(err instanceof Error ? err.message : 'Could not save feedback.');
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 pb-32 pt-28">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-accent/80">Workspace</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Predict and Analyze
        </h1>

        {error && (
          <p className="mt-4 flex items-center gap-2 text-sm text-red-300">
            <AlertCircle size={15} /> {error}
          </p>
        )}

        {!schema ? (
          <div className="mt-8 h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />
        ) : (
          <form onSubmit={onPredict} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-white">Model identity</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {strings.map((c) => (
                    <label key={c} className="block">
                      <span className="mb-1.5 block text-xs text-white/45">{pretty(c)}</span>
                      <input
                        value={(values[c] as string) ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [c]: e.target.value }))}
                        placeholder={String(schema.example[c] ?? '')}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/60"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-white">Scale and pricing</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {numbers.map((c) => (
                    <label key={c} className="block">
                      <span className="mb-1.5 block text-xs text-white/45">{pretty(c)}</span>
                      <input
                        value={(values[c] as string) ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [c]: e.target.value }))}
                        placeholder={String(schema.example[c] ?? '')}
                        inputMode="decimal"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm tabular-nums text-white outline-none placeholder:text-white/25 focus:border-accent/60"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-white">Capabilities</h2>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {bools.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValues((v) => ({ ...v, [c]: !v[c] }))}
                      className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all ${
                        values[c]
                          ? 'border-accent/60 bg-accent/15 text-white'
                          : 'border-white/10 bg-black/40 text-white/50 hover:text-white/80'
                      }`}
                    >
                      {pretty(c)}
                      <span
                        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                          values[c] ? 'justify-end bg-accent' : 'justify-start bg-white/15'
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#b46bff] via-accent to-[#7c3aed] py-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all hover:shadow-[0_16px_40px_-8px_rgba(168,85,247,0.9)] disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Analyzing…' : 'Predict and Analyze'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-white">Result</h2>
                {!price || !tier ? (
                  <p className="mt-3 text-sm text-white/40">Run a prediction to see price and tier here.</p>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="mt-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-semibold tabular-nums text-transparent">
                      ${price.predicted_price_per_1m_output_tokens.toFixed(4)}
                    </p>
                    <p className="mt-1 text-xs text-white/45">per 1M output tokens</p>
                    <p className="mt-4 inline-block rounded-full border border-accent/40 bg-accent/15 px-3.5 py-1.5 text-sm font-medium text-white">
                      {tier.predicted_tier}
                    </p>
                    <div className="mt-4 space-y-2">
                      {Object.entries(tier.probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([k, v]) => (
                          <div key={k}>
                            <div className="mb-1 flex justify-between text-xs text-white/50">
                              <span>{k}</span>
                              <span className="tabular-nums">{(v * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-accent" style={{ width: `${v * 100}%` }} />
                            </div>
                          </div>
                        ))}
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/35">
                      <CheckCircle2 size={12} />
                      {price.logged ? 'Saved to your history' : 'Not saved (database unreachable)'}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-white">Teach the model</h2>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs text-white/45">Real price you observed</span>
                  <input
                    value={actualPrice}
                    onChange={(e) => setActualPrice(e.target.value)}
                    placeholder="e.g. 2.50"
                    inputMode="decimal"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm tabular-nums text-white outline-none placeholder:text-white/25 focus:border-accent/60"
                  />
                </label>
                <button
                  type="button"
                  onClick={sendPriceFeedback}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.06] py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/[0.1]"
                >
                  Submit price
                </button>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs text-white/45">Correct tier (if wrong)</span>
                  <select
                    value={correctTier}
                    onChange={(e) => setCorrectTier(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-accent/60"
                  >
                    <option value="">Select…</option>
                    {schema.tiers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={sendTierFeedback}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.06] py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/[0.1]"
                >
                  Submit correction
                </button>
                {fbMsg && <p className="mt-3 text-[13px] text-white/60">{fbMsg}</p>}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
