import { useState } from 'react';
import AeroShards from '../components/AeroShards';

export default function AuthPage() {
  const [webgpuFailed, setWebgpuFailed] = useState(false);

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-void">
      {!webgpuFailed ? (
        <AeroShards
          shardColor="#896ABD"
          accentColor="#A855F7"
          placement="full"
          material="glass"
          markers="plus"
          count={1300}
          depthOfField={0.75}
          vignette={0.3}
          mouseInteraction
          pulseOnClick
          holdToGather
          onError={() => setWebgpuFailed(true)}
          style={{ position: 'absolute', inset: 0 }}
        />
      ) : (
        <div className="auth-fallback" aria-hidden />
      )}

      {/* auth card mounts here next */}
      <div className="pointer-events-none absolute left-6 top-6 select-none">
        <p className="text-sm font-semibold tracking-[0.3em] text-white/70">AI MODEL ANALYSER</p>
      </div>
    </div>
  );
}
