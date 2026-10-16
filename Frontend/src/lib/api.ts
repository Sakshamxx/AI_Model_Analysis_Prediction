import { supabase } from './supabase';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:8000';

async function token(): Promise<string> {
  const { data } = await supabase().auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new Error('Please log in first.');
  return t;
}

async function call<T>(path: string, init?: RequestInit, auth = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${await token()}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `Request failed (${res.status}).`);
  }
  return res.json() as Promise<T>;
}

export interface SampleSchema {
  feature_order: string[];
  example: Record<string, unknown>;
  tiers: string[];
}

export interface PriceResult {
  predicted_price_per_1m_output_tokens: number;
  logged: boolean;
  history_id: string | null;
}

export interface TierResult {
  predicted_tier: string;
  probabilities: Record<string, number>;
  logged: boolean;
  history_id: string | null;
}

export const api = {
  sampleFeatures: () => call<SampleSchema>('/schema/sample-features', undefined, false),
  health: () => call<{ ok: boolean }>('/health', undefined, false),
  me: () => call<{ id: string; email: string | null }>('/me'),
  predictPrice: (features: Record<string, unknown>) =>
    call<PriceResult>('/predict/price', { method: 'POST', body: JSON.stringify({ features }) }),
  predictTier: (features: Record<string, unknown>) =>
    call<TierResult>('/predict/tier', { method: 'POST', body: JSON.stringify({ features }) }),
  feedbackPrice: (features: Record<string, unknown>, actual_price: number, predicted_price?: number) =>
    call<{ stored: boolean }>('/feedback/price', {
      method: 'POST',
      body: JSON.stringify({ features, actual_price, predicted_price }),
    }),
  feedbackTier: (history_id: string, actual_tier: string) =>
    call<{ stored: boolean }>('/feedback/tier', {
      method: 'POST',
      body: JSON.stringify({ history_id, actual_tier }),
    }),
  history: (kind: 'predictions' | 'classifications' | 'feedback' | 'rag', limit = 50) =>
    call<{ rows: Record<string, unknown>[] }>(`/history/${kind}?limit=${limit}`),
};
