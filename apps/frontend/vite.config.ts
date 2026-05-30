import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, './src'),
    },
    extensions: [
      '.web.tsx', '.tsx',
      '.web.ts', '.ts',
      '.web.jsx', '.jsx',
      '.web.js', '.js',
    ],
  },
  define: {
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
      jsx: 'automatic',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
