import { useState } from 'react';
import AeroShards from '../components/AeroShards';
import AuthCard from '../components/AuthCard';

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

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AuthCard />
      </div>
    </div>
  );
}
