import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LiquidBox } from '../liquid/LiquidStage';
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
    return <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />;
  }
  return (
    <LiquidBox id="chart-trend" className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-white/55">Median input price per 1M tokens · log scale</p>
        <div className="flex gap-4 text-xs text-white/45">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Median
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Cheapest
          </span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              minTickGap={90}
              tickFormatter={(w: string) => w.slice(0, 7)}
            />
            <YAxis
              scale="log"
              domain={['auto', 'auto']}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(16,14,23,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(w) => `Week of ${w}`}
              formatter={(value, name) => [
                `$${value}`,
                name === 'median' ? 'Median' : 'Cheapest',
              ]}
            />
            <Line type="monotone" dataKey="median" stroke="#a855f7" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="min" stroke="#38bdf8" strokeWidth={1.5} dot={false} opacity={0.85} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </LiquidBox>
  );
}
