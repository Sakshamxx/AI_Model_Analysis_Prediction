import { useEffect, useRef, useState } from 'react';
import { createRenderer } from './renderer';

interface OceanCanvasProps {
  className?: string;
  onError?: (error: Error) => void;
}

/** Mounts the FFT-ocean renderer only while visible (heavy 512² sim),
 *  preserving its lifecycle and cleanup. Adapted shell; engine untouched. */
export function OceanCanvas({ className = '', onError }: OceanCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
      {visible && !failed && <OceanView onError={() => setFailed(true)} />}
    </div>
  );
}

function OceanView({ onError }: { onError: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer({ canvas });
    void renderer.ready.then(undefined, () => onError());
    return () => renderer.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}

export default OceanCanvas;
