import { useState } from 'react';
import { ArrowUpRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OceanCanvas } from '../ocean/OceanCanvas';

const EXPLORE = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict and Analyze' },
  { to: '/assistant', label: 'AI Assistant' },
  { to: '/history', label: 'Past Predictions' },
  { to: '/login', label: 'Login' },
];

function OrbitVisual() {
  return (
    <div className="relative hidden h-full min-h-[280px] items-center justify-center overflow-hidden sm:flex" aria-hidden>
      {[300, 220, 140, 70].map((size) => (
        <span
          key={size}
          className="absolute rounded-full border border-dashed border-gray-300"
          style={{ width: size, height: size }}
        />
      ))}
      <span className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm">
        <Box size={22} />
      </span>
      {[
        { top: '12%', left: '30%', c: '#a855f7' },
        { top: '22%', left: '68%', c: '#0ea5e9' },
        { top: '58%', left: '78%', c: '#f59e0b' },
        { top: '72%', left: '38%', c: '#10b981' },
        { top: '42%', left: '18%', c: '#ec4899' },
      ].map((dot, i) => (
        <span
          key={i}
          className="absolute h-3 w-3 rounded-full shadow"
          style={{ top: dot.top, left: dot.left, background: dot.c }}
        />
      ))}
    </div>
  );
}

export function Footer() {
  const [webgpuFailed, setWebgpuFailed] = useState(false);
  return (
    <footer className="relative overflow-hidden bg-black">
      <div className="absolute inset-0">
        {!webgpuFailed ? (
          <OceanCanvas onError={() => setWebgpuFailed(true)} />
        ) : (
          <div className="auth-fallback" aria-hidden />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-24">
        <div className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-24px_rgba(0,0,0,0.6)] md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
              Live predictions
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              Predict any model's price
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-gray-500">
              Enter context, capabilities, and provider — get the price tier and cost estimate trained
              on 4,400 real listings.
            </p>
            <div className="mt-7">
              <Link
                to="/predict"
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Start predicting
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <OrbitVisual />
        </div>

        <div className="grid gap-10 px-2 pb-4 pt-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white">
                <Box size={17} />
              </span>
              AI Model Analyser
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              Live pricing across thousands of AI models. Predict costs and find the best value.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Explore</p>
            <ul className="mt-4 space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/50 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Project</p>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://github.com/Sakshamxx/AI_Model_Analysis_Prediction"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
                >
                  GitHub Repository
                  <ArrowUpRight size={14} />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sakshamxx"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
                >
                  Developed by Saksham
                  <ArrowUpRight size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-white/10 px-2 pb-2 pt-6 text-[13px] text-white/40 sm:flex-row sm:items-center">
          <p>© 2026 AI Model Analyser · All rights reserved</p>
          <p>
            Developed by{' '}
            <a
              href="https://github.com/Sakshamxx"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-white/60 underline-offset-4 hover:underline"
            >
              Saksham
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
