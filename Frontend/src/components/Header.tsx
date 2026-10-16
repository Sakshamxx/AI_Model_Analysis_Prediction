import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from './Logo';

const LINKS = [
  { to: '/predict', label: 'Predict' },
  { to: '/assistant', label: 'Assistant' },
  { to: '/history', label: 'History' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dark = !scrolled;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'border-b border-gray-200/70 bg-white/70 backdrop-blur-xl' : ''
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span
            className={`text-[17px] font-semibold tracking-tight transition-colors ${
              dark ? 'text-white' : 'text-gray-900'
            }`}
          >
            ModelX
          </span>
        </Link>

        <nav
          className={`hidden items-center gap-1 rounded-full border px-1.5 py-1 backdrop-blur-xl transition-colors duration-300 md:flex ${
            dark ? 'border-white/10 bg-white/[0.06]' : 'border-gray-200 bg-white/70 shadow-sm'
          }`}
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  dark
                    ? isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:text-white'
                    : isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/login"
          className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-all ${
            dark
              ? 'bg-white text-gray-900 hover:bg-white/85'
              : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          Login
        </Link>
      </div>
    </header>
  );
}
