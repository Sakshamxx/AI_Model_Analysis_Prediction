import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../lib/supabase';

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

type Mode = 'login' | 'signup';

export default function AuthCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'Something went wrong.');
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
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  }

  if (!supabaseConfigured) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-red-400/20 bg-red-950/40 p-6 text-center backdrop-blur-xl">
        <p className="text-sm text-red-200">Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Frontend/.env.local</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <div className="p-8">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-white">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-1.5 text-center text-sm text-white/50">
          {mode === 'login' ? 'Sign in to continue' : 'Join to start predicting'}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-xl border border-white/10 bg-black/30 p-1">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`rounded-lg py-2 text-sm font-medium capitalize transition-all duration-300 ${
                mode === m ? 'bg-white/10 text-white shadow' : 'text-white/45 hover:text-white/75'
              }`}
            >
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 transition-colors focus-within:border-accent/60">
            <Mail size={17} className="shrink-0 text-white/35 transition-colors group-focus-within:text-accent" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30"
            />
          </label>

          <label className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 transition-colors focus-within:border-accent/60">
            <Lock size={17} className="shrink-0 text-white/35 transition-colors group-focus-within:text-accent" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/30"
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
              className="flex items-start gap-2 overflow-hidden text-[13px] leading-snug text-red-300"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-shard to-accent py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(168,85,247,0.7)] disabled:opacity-60"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </span>
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/30">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white/85 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.09] disabled:opacity-60"
        >
          {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleMark />}
          Continue with Google
        </button>
      </div>
    </motion.div>
  );
}
