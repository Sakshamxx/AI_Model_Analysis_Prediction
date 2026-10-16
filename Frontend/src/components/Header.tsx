import { Link, NavLink } from 'react-router-dom';
import { Logo } from './Logo';

const LINKS = [
  { to: '/predict', label: 'Predict' },
  { to: '/assistant', label: 'Assistant' },
  { to: '/history', label: 'History' },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/45 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="text-[17px] font-semibold tracking-tight text-white">ModelX</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-1 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/login"
          className="rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-gray-900 transition-colors hover:bg-white/85"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
