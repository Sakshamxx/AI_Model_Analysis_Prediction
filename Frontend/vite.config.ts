import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// NOTE: .wgsl files go through vgpu's own resolver (handles relative
// ./x.wgsl imports AND @vgpu/wgsl-std/*). shader strings must reach the
// runtime pristine: minify:false. Plain ?raw imports would leave the
// transitive shaders (stars/disk/gbuffer/geodesic) out of the bundle.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), wgslVitePlugin({ minify: false })],
})
