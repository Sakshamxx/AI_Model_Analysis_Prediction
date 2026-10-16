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
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
      <div className="mb-2 flex flex-wrap gap-4">
        {top.map((d, i) => (
          <span key={d.developer} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.developer} · {d.listings.toLocaleString()}
          </span>
        ))}
      </div>
      <div className="h-96">
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
  );
}
