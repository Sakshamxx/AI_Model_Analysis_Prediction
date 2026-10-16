import { useState } from 'react';
import { OceanCanvas } from '../ocean/OceanCanvas';

function GithubMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

export function Footer() {
  const [webgpuFailed, setWebgpuFailed] = useState(false);
  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0">
        {!webgpuFailed ? (
          <OceanCanvas onError={() => setWebgpuFailed(true)} />
        ) : (
          <div className="auth-fallback" aria-hidden />
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/55" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-28 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-white/45">
          AI Model Analyser
        </p>
        <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] md:text-6xl">
          Know the price before you prompt
        </h2>
        <p className="mt-4 max-w-xl text-[15px] text-white/60">
          Open data, trained models, and live predictions — from 2023 to today.
        </p>
        <a
          href="https://github.com/Sakshamxx/AI_Model_Analysis_Prediction"
          target="_blank"
          rel="noreferrer"
          className="mt-8 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-medium text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/[0.1]"
        >
          <GithubMark />
          View the repository
        </a>
        <p className="mt-10 text-[13px] text-white/40">
          Developed by{' '}
          <a
            href="https://github.com/Sakshamxx"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Saksham
          </a>
        </p>
      </div>
    </footer>
  );
}
