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
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
        >
          <p className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            {item.value}
          </p>
          <p className="mt-1.5 text-[13px] text-white/45">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
