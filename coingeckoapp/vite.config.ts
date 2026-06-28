import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/CriptoCoinGeckoApp/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth'],
          recharts: ['recharts'],
          vendor: ['@tanstack/react-query', 'react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
