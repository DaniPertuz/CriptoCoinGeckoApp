import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const base = isGitHubPages && repositoryName ? `/${repositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
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
})
