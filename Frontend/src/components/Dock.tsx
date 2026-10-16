import { useRef, useState } from 'react';
import { Activity, History, Home, Settings, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/predict', label: 'Predict and Analyze', Icon: Activity },
  { to: '/assistant', label: 'AI Assistant', Icon: Sparkles },
  { to: '/history', label: 'Past Predictions', Icon: History },
  { to: '/settings', label: 'Account Settings', Icon: Settings },
];

export function Dock() {
  const barRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);

  function scaleFor(index: number): number {
    if (mouseX === null) return 1;
    const el = barRef.current?.children[index] as HTMLElement | undefined;
    if (!el) return 1;
    const rect = el.getBoundingClientRect();
    const dist = Math.abs(mouseX - (rect.left + rect.width / 2));
    return 1 + 0.55 * Math.exp(-((dist / 70) ** 2));
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 pb-[env(safe-area-inset-bottom)]"
    >
      <div
        ref={barRef}
        onMouseMove={(e) => setMouseX(e.clientX)}
        onMouseLeave={() => setMouseX(null)}
        className="flex items-end gap-1.5 rounded-3xl border border-white/15 bg-black/45 px-3 py-2.5 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-150"
      >
        {ITEMS.map(({ to, label, Icon, end }, i) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className="group relative flex flex-col items-center"
          >
            {({ isActive }) => (
              <>
                <span className="pointer-events-none absolute -top-11 whitespace-nowrap rounded-lg border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] text-white/85 opacity-0 backdrop-blur-xl transition-all duration-200 group-hover:-top-12 group-hover:opacity-100">
                  {label}
                </span>
                <span
                  className={`flex items-center justify-center rounded-2xl transition-all duration-150 ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  style={{
                    width: 44 * scaleFor(i),
                    height: 44 * scaleFor(i),
                    transformOrigin: 'bottom center',
                  }}
                >
                  <Icon size={20} />
                </span>
                <span
                  className={`mt-1 h-1 w-1 rounded-full transition-opacity ${
                    isActive ? 'bg-white opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
