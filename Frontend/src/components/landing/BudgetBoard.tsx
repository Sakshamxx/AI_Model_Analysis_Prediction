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
    return <div className="h-72 animate-pulse rounded-3xl border border-gray-200 bg-gray-50" />;
  }
  const max = Math.max(...rows.map((r) => r.price));
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
      <p className="mb-5 text-sm text-gray-500">Cheapest output prices per 1M tokens</p>
      <ul className="space-y-4">
        {rows.map((r, i) => (
          <li key={`${r.model}-${r.provider}`}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className="truncate text-sm text-gray-800">
                {r.model} <span className="text-gray-400">· {r.developer} via {r.provider}</span>
              </p>
              <p className="shrink-0 text-sm font-semibold text-gray-900">${r.price.toFixed(3)}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
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
