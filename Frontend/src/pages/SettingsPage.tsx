import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';

export default function SettingsPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) setName(String(session.user.user_metadata?.full_name ?? ''));
  }, [session]);

  if (!ready) return null;
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-xl font-semibold text-white">Login required</h1>
          <Link to="/login" className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const email = session.user.email ?? '—';
  const initial = (email[0] ?? '?').toUpperCase();

  async function onName(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase().auth.updateUser({ data: { full_name: name } });
      if (error) throw error;
      setMsg('Display name saved.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not save name.');
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase().auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setMsg('Password changed.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not change password.');
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    await supabase().auth.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-black px-6 pb-32 pt-28">
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-accent/80">Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">Settings</h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-xl font-semibold text-white">
              {initial}
            </span>
            <div>
              <p className="font-medium text-white">{email}</p>
              <p className="text-xs text-white/40">Signed in via Supabase Auth</p>
            </div>
          </div>

          <form onSubmit={onName} className="mt-6">
            <label className="mb-1.5 block text-xs text-white/45">Display name</label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/60"
              />
              <button
                type="submit"
                disabled={busy}
                className="shrink-0 rounded-xl bg-white px-5 text-sm font-semibold text-gray-900 disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </form>

          <form onSubmit={onPassword} className="mt-5">
            <label className="mb-1.5 block text-xs text-white/45">New password</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters"
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/60"
              />
              <button
                type="submit"
                disabled={busy || password.length < 6}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-5 text-sm font-semibold text-gray-900 disabled:opacity-60"
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                Set
              </button>
            </div>
          </form>

          {msg && (
            <p className="mt-4 flex items-center gap-1.5 text-[13px] text-white/60">
              <CheckCircle2 size={14} /> {msg}
            </p>
          )}

          <button
            onClick={onSignOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 py-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
