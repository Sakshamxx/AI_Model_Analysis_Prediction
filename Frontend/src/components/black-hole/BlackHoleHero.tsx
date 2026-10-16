import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createRenderer } from './renderer';

interface BlackHoleHeroProps {
  className?: string;
  style?: CSSProperties;
  onError?: (error: Error) => void;
}

/** Host for the optimized black-hole renderer (pulled via `npx vgpu examples pull optimized-black-hole`).
 *  Renderer, pipeline, settings and shaders are untouched — only the React shell was adapted
 *  (removed Next.js directive, added error/fallback passthrough). */
export function BlackHoleHero({ className = '', style, onError }: BlackHoleHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer({ canvas });
    void renderer.ready.then(
      () => {
        if (!cancelled) setIsReady(true);
      },
      (error: unknown) => {
        if (!cancelled) {
          onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
        }
      },
    );
    return () => {
      cancelled = true;
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        className={`block h-full w-full touch-none transition-opacity duration-500 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default BlackHoleHero;
