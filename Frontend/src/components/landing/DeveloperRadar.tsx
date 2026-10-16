import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { LiquidBox } from '../liquid/LiquidStage';
import { useLandingData } from './useLandingData';

interface Dev {
  developer: string;
  listings: number;
  medianOutput: number;
  medianContext: number;
  avgCaps: number;
}

const COLORS = ['#a855f7', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'];

const fmtCtx = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : `${Math.round(n / 1000)}K`;

export function DeveloperRadar() {
  const devs = useLandingData<Dev[]>('developers.json');
  if (!devs) {
    return <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />;
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
    <LiquidBox id="chart-radar" className="p-6 md:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[300px_1fr]">
        <ol className="space-y-1">
          {top.map((d, i) => (
            <li
              key={d.developer}
              className="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <span
                className="w-7 shrink-0 text-2xl font-semibold tabular-nums"
                style={{ color: COLORS[i % COLORS.length] }}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{d.developer}</span>
                <span className="mt-0.5 block text-xs tabular-nums text-white/45">
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
              <PolarGrid stroke="rgba(255,255,255,0.14)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(16,14,23,0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
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
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </LiquidBox>
  );
}
