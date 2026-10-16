import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlackHoleHero } from '../components/black-hole/BlackHoleHero';
import { BudgetBoard } from '../components/landing/BudgetBoard';
import { DeveloperRadar } from '../components/landing/DeveloperRadar';
import { Footer } from '../components/landing/Footer';
import { KpiRow } from '../components/landing/KpiRow';
import { PriceTrendChart } from '../components/landing/PriceTrendChart';
import { Section } from '../components/landing/Section';
import Particles from '../components/landing/Particles';

export default function HomePage() {
  const [webgpuFailed, setWebgpuFailed] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {!webgpuFailed ? (
            <BlackHoleHero onError={() => setWebgpuFailed(true)} />
          ) : (
            <div className="auth-fallback" aria-hidden />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] bg-gradient-to-t from-black via-black/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-start justify-center px-6 text-left">
          <motion.p
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-medium uppercase tracking-[0.4em] text-white/50"
          >
            ModelX · Choose the best model possible
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-2xl text-5xl font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] md:text-7xl"
          >
            Price of{' '}
            <span className="bg-gradient-to-r from-[#c4b5fd] via-[#a855f7] to-[#e9d5ff] bg-clip-text text-transparent">
              Intelligence
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60"
          >
            Live pricing across 4,400 AI models. Predict costs, compare providers, find the best
            value.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/predict"
              className="group flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-black/70 px-7 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_32px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-black/90"
            >
              Predict and Analyze
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/assistant"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] px-7 py-3.5 text-sm font-medium text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl transition-all duration-300 hover:border-white/30 hover:bg-white/[0.14]"
            >
              <Sparkles size={16} />
              AI Assistant
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="relative bg-black">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[44vh] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(168,85,247,0.12),transparent)]" />
        <Particles
          particleCount={220}
          particleSpread={11}
          speed={0.08}
          particleColors={['#896ABD', '#A855F7', '#c4b5fd']}
          particleBaseSize={60}
          glow={0.5}
          twinkle={0.4}
          drift="up"
          driftSpeed={0.5}
          opacity={0.85}
          className="pointer-events-none absolute inset-0"
        />
        <div className="relative">
        <Section eyebrow="Snapshot" title="Market at a glance">
          <KpiRow />
        </Section>

        <Section eyebrow="Trend" title="Models are getting cheaper">
          <PriceTrendChart />
        </Section>

        <Section eyebrow="Developers" title="Who ships the most">
          <DeveloperRadar />
        </Section>

        <Section eyebrow="Value" title="Most budget-friendly right now">
          <BudgetBoard />
        </Section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
