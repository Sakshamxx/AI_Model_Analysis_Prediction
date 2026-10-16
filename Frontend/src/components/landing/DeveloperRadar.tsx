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

const COLORS = ['#a855f7', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'];

export function DeveloperRadar() {
  const devs = useLandingData<Dev[]>('developers.json');
  if (!devs) {
    return <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />;
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
      <div className="mb-2 flex flex-wrap gap-4">
        {top.map((d, i) => (
          <span key={d.developer} className="flex items-center gap-1.5 text-xs text-white/55">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.developer} · {d.listings.toLocaleString()}
          </span>
        ))}
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
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
  );
}
