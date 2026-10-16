import { useLandingData } from './useLandingData';

interface Cheap {
  model: string;
  developer: string;
  provider: string;
  price: number;
}

export function BudgetBoard() {
  const rows = useLandingData<Cheap[]>('cheapest.json');
  if (!rows) {
    return <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />;
  }
  const max = Math.max(...rows.map((r) => r.price));
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
      <p className="mb-5 text-sm text-white/60">Cheapest output prices per 1M tokens</p>
      <ul className="space-y-4">
        {rows.map((r, i) => (
          <li key={`${r.model}-${r.provider}`}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className="truncate text-sm text-white/85">
                {r.model} <span className="text-white/40">· {r.developer} via {r.provider}</span>
              </p>
              <p className="shrink-0 text-sm font-semibold text-white">${r.price.toFixed(3)}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(4, (r.price / max) * 100)}%`,
                  background: i % 2 ? 'linear-gradient(90deg,#0ea5e9,#38bdf8)' : 'linear-gradient(90deg,#7c3aed,#a855f7)',
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
