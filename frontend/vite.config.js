import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        fastRefresh: isDev,
        jsxRuntime: 'automatic',
      }),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages'),
        '@services': resolve(__dirname, './src/services'),
        '@contexts': resolve(__dirname, './src/contexts'),
        '@utils': resolve(__dirname, './src/utils'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@assets': resolve(__dirname, './src/assets'),
      },
    },

    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProd,
      minify: isProd ? 'esbuild' : false,
      target: 'es2015',
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,

      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@headlessui/react', '@heroicons/react', 'framer-motion'],
            'query-vendor': ['@tanstack/react-query', 'axios'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'chart-vendor': ['recharts'],
            'utils-vendor': ['clsx', 'date-fns'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const extType = info[info.length - 1];
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${extType}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${extType}`;
            }
            if (/\.css$/i.test(assetInfo.name)) {
              return `assets/css/[name]-[hash].${extType}`;
            }
            return `assets/[name]-[hash].${extType}`;
          },
        },
      },

      cssCodeSplit: true,
      cssTarget: 'es2015',
    },

    css: {
      postcss: './postcss.config.js',
      devSourcemap: isDev,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'react-hook-form',
        '@hookform/resolvers',
        'zod',
        'framer-motion',
        'react-hot-toast',
        'recharts',
        'date-fns',
        'clsx',
      ],
      exclude: ['@headlessui/react', '@heroicons/react'],
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDev,
    },

    preview: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: true,
      coverage: {
        provider: 'c8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          'src/**/*.test.{js,jsx,ts,tsx}',
          'src/**/*.spec.{js,jsx,ts,tsx}',
        ],
      },
    },
  };
});
