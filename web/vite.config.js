import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  define: {
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8080/api/v1')
  },
  server: {
    port: 5173,
    cors: true
  },
  build: {
    target: 'es2020',
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['svelte']
        }
      }
    }
  }
});