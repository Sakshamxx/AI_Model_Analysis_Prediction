import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useMotionValue } from 'motion/react';
import { createRenderer } from './renderer';
import { createLayoutStore, type CardHandle } from './layout-store';

interface LiquidContextValue {
  register: (handle: CardHandle) => () => void;
  failed: boolean;
}

const LiquidContext = createContext<LiquidContextValue>({
  register: () => () => {},
  failed: false,
});

/** One shared liquid-glass stage: a single WebGPU canvas behind all boxes.
 *  Boxes register themselves via <LiquidBox>. If WebGPU fails, boxes fall
 *  back to solid dark glass so the page still looks designed. */
export function LiquidStage({ children, className = '' }: { children: ReactNode; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [store] = useState(createLayoutStore);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);

  const register = useCallback(
    (handle: CardHandle) => store.register(handle),
    [store],
  );
  const ctx = useMemo(() => ({ register, failed }), [register, failed]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: '200px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active || failed) return;
    const canvas = canvasRef.current;
    const container = hostRef.current;
    if (!canvas || !container) return;
    let cancelled = false;
    let renderer: ReturnType<typeof createRenderer> | null = null;
    try {
      renderer = createRenderer({ canvas, container, store, controls: false, autoPlay: false });
      void renderer.ready.then(
        undefined,
        () => {
          if (!cancelled) setFailed(true);
        },
      );
    } catch {
      setFailed(true);
    }
    return () => {
      cancelled = true;
      renderer?.dispose();
    };
  }, [active, failed, store]);

  return (
    <LiquidContext.Provider value={ctx}>
      <div ref={hostRef} className={`relative ${className}`}>
        {!failed && (
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        )}
        {children}
      </div>
    </LiquidContext.Provider>
  );
}

/** A transparent box that the liquid renderer pours glass beneath.
 *  Falls back to solid dark glass when WebGPU is unavailable. */
export function LiquidBox({
  id,
  children,
  className = '',
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { register, failed } = useContext(LiquidContext);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const hoveredRef = useRef(false);
  const [, setHover] = useState(false);

  const handle = useMemo<CardHandle>(
    () => ({
      id,
      layer: 'grid',
      element: null,
      x,
      y,
      scale,
      rotate,
      present: true,
      get hovered() {
        return hoveredRef.current;
      },
    }),
    [id, x, y, scale, rotate],
  );

  useLayoutEffect(() => {
    handle.element = ref.current;
    return register(handle);
  }, [register, handle]);

  return (
    <div
      ref={ref}
      onPointerEnter={() => {
        hoveredRef.current = true;
        setHover(true);
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
        setHover(false);
      }}
      className={
        failed
          ? `relative rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl ${className}`
          : `relative rounded-3xl border border-white/15 bg-transparent ${className}`
      }
    >
      {children}
    </div>
  );
}
