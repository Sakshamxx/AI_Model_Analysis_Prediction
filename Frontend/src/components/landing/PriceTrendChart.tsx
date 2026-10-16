import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLandingData } from './useLandingData';

interface WeekPoint {
  week: string;
  median: number;
  min: number;
  models: number;
}

export function PriceTrendChart() {
  const data = useLandingData<WeekPoint[]>('price-trend.json');
  if (!data) {
    return <div className="h-72 animate-pulse rounded-3xl border border-gray-200 bg-gray-50" />;
  }
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Median input price per 1M tokens · log scale</p>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-600" /> Median
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Cheapest
          </span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid stroke="#eef0f3" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              minTickGap={90}
              tickFormatter={(w: string) => w.slice(0, 7)}
            />
            <YAxis
              scale="log"
              domain={['auto', 'auto']}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 12,
                boxShadow: '0 8px 30px -12px rgba(0,0,0,0.2)',
              }}
              labelFormatter={(w) => `Week of ${w}`}
              formatter={(value, name) => [
                `$${value}`,
                name === 'median' ? 'Median' : 'Cheapest',
              ]}
            />
            <Line type="monotone" dataKey="median" stroke="#9333ea" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="min" stroke="#0ea5e9" strokeWidth={1.5} dot={false} opacity={0.85} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
