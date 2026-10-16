import { useEffect, useState } from 'react';

export function useLandingData<T>(file: string): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let live = true;
    fetch(`/data/${file}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live) setData(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [file]);
  return data;
}
