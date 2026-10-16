// Builds public/data/*.json from the real CSVs. Run: node scripts/build-data.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, '..', 'Data');
const OUT = join(ROOT, 'public', 'data');
mkdirSync(OUT, { recursive: true });

function parseCsv(path) {
  const [header, ...lines] = readFileSync(path, 'utf8').trim().split('\n');
  const cols = header.split(',');
  return lines.map((l) => {
    // quoted fields contain commas (model names); split carefully
    const cells = l.match(/(".*?"|[^,]+)(?=\n|$)|(".*?"|[^,]+)(?=,)/g) ?? [];
    const row = {};
    cols.forEach((c, i) => {
      let v = (cells[i] ?? '').trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/""/g, '"');
      row[c] = v;
    });
    return row;
  });
}

const num = (v) => {
  const n = Number(v);
  return v === '' || Number.isNaN(n) ? null : n;
};
const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const models = parseCsv(join(DATA, 'ai_models_2026.csv'));
const history = parseCsv(join(DATA, 'ai_model_price_history.csv'));

// 1) weekly input-price trend (chat/responses, priced rows)
const weeks = new Map();
for (const h of history) {
  if (h.mode !== 'chat' && h.mode !== 'responses') continue;
  const p = num(h.input_price_per_1m_tokens);
  if (p === null || p <= 0) continue;
  if (!weeks.has(h.week_start)) weeks.set(h.week_start, []);
  weeks.get(h.week_start).push(p);
}
const trend = [...weeks.entries()]
  .map(([week, prices]) => ({ week, median: +median(prices).toFixed(4), min: Math.min(...prices), models: prices.length }))
  .sort((a, b) => (a.week < b.week ? -1 : 1));
writeFileSync(join(OUT, 'price-trend.json'), JSON.stringify(trend));

// 2) developer metrics (chat/responses, priced) for radar + KPIs
const CAPS = Object.keys(models[0]).filter((c) => c.startsWith('supports_'));
const devs = new Map();
for (const m of models) {
  if (m.mode !== 'chat' && m.mode !== 'responses') continue;
  const out = num(m.output_price_per_1m_tokens);
  if (out === null || out <= 0) continue;
  if (!devs.has(m.developer)) devs.set(m.developer, { listings: 0, out: [], ctx: [], caps: [] });
  const d = devs.get(m.developer);
  d.listings += 1;
  d.out.push(out);
  const ctx = num(m.max_input_tokens);
  if (ctx !== null) d.ctx.push(ctx);
  d.caps.push(CAPS.filter((c) => m[c] === 'True' || m[c] === 'TRUE').length);
}
const devRows = [...devs.entries()].map(([developer, d]) => ({
  developer,
  listings: d.listings,
  medianOutput: +median(d.out).toFixed(3),
  medianContext: Math.round(median(d.ctx) ?? 0),
  avgCaps: +(d.caps.reduce((a, b) => a + b, 0) / d.caps.length).toFixed(2),
}));
devRows.sort((a, b) => b.listings - a.listings);
writeFileSync(join(OUT, 'developers.json'), JSON.stringify(devRows.slice(0, 8)));

// 3) cheapest chat models (budget board)
const priced = models
  .filter((m) => (m.mode === 'chat' || m.mode === 'responses') && num(m.output_price_per_1m_tokens) > 0)
  .map((m) => ({
    model: m.model_name,
    developer: m.developer,
    provider: m.provider,
    price: num(m.output_price_per_1m_tokens),
  }))
  .sort((a, b) => a.price - b.price);
writeFileSync(join(OUT, 'cheapest.json'), JSON.stringify(priced.slice(0, 6)));
const maxPrice = priced[0] ? priced[Math.min(49, priced.length - 1)].price : 1;

// 4) KPIs
const chatPriced = models.filter(
  (m) => (m.mode === 'chat' || m.mode === 'responses') && num(m.input_price_per_1m_tokens) > 0,
);
const first = trend[0]?.median ?? null;
const last = trend[trend.length - 1]?.median ?? null;
const kpis = {
  listings: models.length,
  uniqueModels: new Set(models.map((m) => (m.model_name || '').toLowerCase())).size,
  developers: new Set(models.map((m) => m.developer)).size,
  providers: new Set(models.map((m) => m.provider)).size,
  cheapestNow: last,
  dropPct: first && last ? Math.round((1 - last / first) * 100) : null,
  budgetMax: maxPrice,
};
writeFileSync(join(OUT, 'kpis.json'), JSON.stringify(kpis));
console.log('wrote price-trend, developers, cheapest, kpis:', trend.length, devRows.length, priced.length);
