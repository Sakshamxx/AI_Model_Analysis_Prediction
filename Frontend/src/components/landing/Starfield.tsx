import { useEffect, useRef } from 'react';

interface StarfieldProps {
  className?: string;
  density?: number;
  color?: string;
}

/** Featherweight 2D starfield: twinkling dots on transparent canvas.
 *  Pauses off-screen, renders once statically under reduced motion. */
export function Starfield({ className = '', density = 9000, color = '137,106,189' }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

    let stars: { x: number; y: number; r: number; phase: number; speed: number }[] = [];
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      w = parent!.clientWidth;
      h = parent!.clientHeight;
      canvas!.width = Math.max(1, Math.round(w * ratio));
      canvas!.height = Math.max(1, Math.round(h * ratio));
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.round((w * h) / density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
      }));
    }

    function paint(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      // fade with depth: denser toward the top so the hero melts into the page
      for (const s of stars) {
        const depthFade = 1 - (s.y / Math.max(h, 1)) * 0.75;
        const tw = reduced ? 0.6 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + time * 0.001 * s.speed));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${(tw * depthFade).toFixed(3)})`;
        ctx.fill();
      }
    }

    function tick(time: number) {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      paint(time);
    }

    resize();
    if (reduced) {
      paint(0);
    } else {
      raf = requestAnimationFrame(tick);
    }
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      io.disconnect();
    };
  }, [density, color]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
