import { LiquidBox } from '../liquid/LiquidStage';
import { useLandingData } from './useLandingData';

interface Kpis {
  listings: number;
  uniqueModels: number;
  developers: number;
  providers: number;
  cheapestNow: number | null;
  dropPct: number | null;
}

const fmt = (n: number) => n.toLocaleString('en-US');

export function KpiRow() {
  const kpis = useLandingData<Kpis>('kpis.json');
  const items = [
    { value: kpis ? fmt(kpis.listings) : '—', label: 'Model listings' },
    { value: kpis ? fmt(kpis.uniqueModels) : '—', label: 'Unique models' },
    { value: kpis ? fmt(kpis.developers) : '—', label: 'Developers' },
    {
      value: kpis?.dropPct !== null && kpis?.dropPct !== undefined ? `−${kpis.dropPct}%` : '—',
      label: 'Median price drop since 2023',
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <LiquidBox key={item.label} id={`kpi-${i}`} className="p-6">
          <p className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-3xl font-semibold tracking-tight text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
            {item.value}
          </p>
          <p className="mt-1.5 text-[13px] text-white/50">{item.label}</p>
        </LiquidBox>
      ))}
    </div>
  );
}
