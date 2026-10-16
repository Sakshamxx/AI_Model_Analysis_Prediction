import { useState } from 'react';

export function Logo({ size = 34, rounded = 10 }: { size?: number; rounded?: number }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <span
        aria-label="ModelX logo"
        className="flex items-center justify-center bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] font-bold text-white"
        style={{ width: size, height: size, borderRadius: rounded, fontSize: size * 0.52 }}
      >
        X
      </span>
    );
  }
  return (
    <img
      src="/logo.png"
      alt="ModelX logo"
      width={size}
      height={size}
      onError={() => setMissing(true)}
      style={{ borderRadius: rounded }}
      className="object-cover"
    />
  );
}
