import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../lib/supabase';

type Mode = 'login' | 'signup';

const COPY: Record<Mode, { title: string; subtitle: string; cta: string; switchHint: string }> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to explore live model prices',
    cta: 'Log in',
    switchHint: 'New here? Create an account above.',
  },
  signup: {
    title: 'Create account',
    subtitle: 'Join to predict prices and save history',
    cta: 'Sign up',
    switchHint: 'Already joined? Log in above.',
  },
};

function friendlyError(message: string): string {
  if (/supabaseurl/i.test(message)) {
    return 'Cannot reach the server. Restart the frontend dev server and try again.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Incorrect email or password. Try again.';
  }
  if (/user already registered|already exists/i.test(message)) {
    return 'This email already has an account. Switch to Log in.';
  }
  if (/error sending confirmation email|error sending .*email/i.test(message)) {
    return 'Could not send the confirmation email. Turn OFF “Confirm email” in Supabase Auth, or fix the SMTP password.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email first, then log in.';
  }
  if (/network|fetch|failed/i.test(message)) {
    return 'Network error. Check your connection and retry.';
  }
  return message;
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.7-5.35 3.7a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.15-2.1A9 9 0 1 0 12 21a9 9 0 0 0 9.35-9.9z"
      />
    </svg>
  );
}

export default function AuthCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[mode];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const client = supabase();
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
      }
      navigate('/predict', { replace: true });
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error } = await supabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/predict` },
      });
      if (error) throw error;
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Google sign-in failed.'));
      setGoogleLoading(false);
    }
  }

  if (!supabaseConfigured) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-red-400/20 bg-red-950/40 p-6 text-center backdrop-blur-xl">
        <p className="text-sm text-red-200">Server not connected. Add the Supabase keys to Frontend/.env.local and restart the dev server.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl backdrop-saturate-150"
    >
      {/* liquid sheen sweeping the top edge */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />

      <div className="relative p-8">
        <h1 className="text-center text-[26px] font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          {copy.title}
        </h1>
        <p className="mt-1.5 text-center text-[13px] text-white/55">{copy.subtitle}</p>

        <div className="mt-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/40 p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`rounded-xl py-2 text-sm font-medium capitalize transition-all duration-300 ${
                mode === m
                  ? 'bg-gradient-to-b from-white/20 to-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.4)]'
                  : 'text-white/45 hover:text-white/75'
              }`}
            >
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <label className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all focus-within:border-accent/60 focus-within:shadow-[inset_0_2px_8px_rgba(0,0,0,0.45),0_0_0_3px_rgba(168,85,247,0.15)]">
            <Mail size={17} className="shrink-0 text-white/35 transition-colors group-focus-within:text-accent" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/30"
            />
          </label>

          <label className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all focus-within:border-accent/60 focus-within:shadow-[inset_0_2px_8px_rgba(0,0,0,0.45),0_0_0_3px_rgba(168,85,247,0.15)]">
            <Lock size={17} className="shrink-0 text-white/35 transition-colors group-focus-within:text-accent" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (6+ characters)"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-white/35 transition-colors hover:text-white/70"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 overflow-hidden rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-[13px] leading-snug text-red-200"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#b46bff] via-accent to-[#7c3aed] py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_12px_32px_-10px_rgba(168,85,247,0.8)] transition-all duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_16px_40px_-8px_rgba(168,85,247,0.9)] disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {copy.cta}
            </span>
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/30">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
          or
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.1] to-white/[0.03] py-3.5 text-sm font-medium text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:from-white/[0.16] hover:to-white/[0.06] disabled:opacity-60"
        >
          {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleMark />}
          Continue with Google
        </button>

        <p className="mt-5 text-center text-xs text-white/35">{copy.switchHint}</p>
      </div>
    </motion.div>
  );
}
