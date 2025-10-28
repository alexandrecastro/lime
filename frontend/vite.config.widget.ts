import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/ClaimWidget.tsx'),
      name: 'ClaimWidget',
      fileName: 'lime-widget',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'public',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
