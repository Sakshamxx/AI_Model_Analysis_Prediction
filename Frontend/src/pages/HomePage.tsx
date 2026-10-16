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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/60" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-medium uppercase tracking-[0.4em] text-white/50"
          >
            AI Model Analyser
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] md:text-7xl"
          >
            Price of Intelligence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/60"
          >
            Live pricing across 4,400 AI models. Predict costs, compare providers, find the best value.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              to="/predict"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-b from-[#b46bff] via-accent to-[#7c3aed] px-7 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_12px_32px_-10px_rgba(168,85,247,0.8)] transition-all duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_16px_40px_-8px_rgba(168,85,247,0.9)]"
            >
              Predict and Analyze
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/assistant"
              className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-medium text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/[0.1]"
            >
              <Sparkles size={16} />
              AI Assistant
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="relative border-t border-gray-100 bg-white">
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

      <Footer />
    </div>
  );
}
