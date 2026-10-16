declare module '*.wgsl' {
  const src: string;
  export default src;
}

declare module '*noise-volume.mjs' {
  import type { Gpu } from 'vgpu';
  export const NOISE_VOLUME_SIZE: number;
  export function createNoiseVolume(gpu: Gpu, size?: number, label?: string): GPUTexture;
  export function noiseVolumeSampler(vgpu: unknown, gpu: Gpu): GPUSampler;
}

declare module '*?raw' {
  const src: string;
  export default src;
}
