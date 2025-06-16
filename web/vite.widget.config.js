import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'es2020',
    lib: {
      entry: 'src/widget.js',
      name: 'CPQConfigurator',
      fileName: 'cpq-widget',
      formats: ['umd', 'es']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    outDir: 'dist-widget'
  },
  define: {
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8080/api/v1')
  }
});