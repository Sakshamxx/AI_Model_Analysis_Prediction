import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useLandingData } from './useLandingData';

interface Dev {
  developer: string;
  listings: number;
  medianOutput: number;
  medianContext: number;
  avgCaps: number;
}

const COLORS = ['#9333ea', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

const fmtCtx = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : `${Math.round(n / 1000)}K`;

export function DeveloperRadar() {
  const devs = useLandingData<Dev[]>('developers.json');
  if (!devs) {
    return <div className="h-96 animate-pulse rounded-3xl border border-gray-200 bg-gray-50" />;
  }
  const top = devs.slice(0, 5);
  const maxListings = Math.max(...top.map((d) => d.listings));
  const minPrice = Math.min(...top.map((d) => d.medianOutput));
  const maxCtx = Math.log(Math.max(...top.map((d) => d.medianContext), 1));
  const metrics = [
    { key: 'scale', label: 'Catalog' },
    { key: 'value', label: 'Value' },
    { key: 'context', label: 'Context' },
    { key: 'caps', label: 'Capabilities' },
  ];
  const data = metrics.map((m) => {
    const row: Record<string, string | number> = { metric: m.label };
    top.forEach((d) => {
      if (m.key === 'scale') row[d.developer] = Math.round((d.listings / maxListings) * 100);
      if (m.key === 'value') row[d.developer] = Math.round((minPrice / d.medianOutput) * 100);
      if (m.key === 'context') row[d.developer] = Math.round((Math.log(Math.max(d.medianContext, 1)) / maxCtx) * 100);
      if (m.key === 'caps') row[d.developer] = Math.round((d.avgCaps / 12) * 100);
    });
    return row;
  });

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] md:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[300px_1fr]">
        <ol className="space-y-1">
          {top.map((d, i) => (
            <li
              key={d.developer}
              className="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-gray-50"
            >
              <span
                className="w-7 shrink-0 text-2xl font-semibold tabular-nums"
                style={{ color: COLORS[i % COLORS.length] }}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-900">{d.developer}</span>
                <span className="mt-0.5 block text-xs tabular-nums text-gray-500">
                  {d.listings.toLocaleString()} listings · ${d.medianOutput.toFixed(2)}/1M ·{' '}
                  {fmtCtx(d.medianContext)} ctx
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="h-80 lg:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              {top.map((d, i) => (
                <Radar
                  key={d.developer}
                  name={d.developer}
                  dataKey={d.developer}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
