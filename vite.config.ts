import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The backend only trusts the origins in CORS_ORIGINS (http://localhost:5173), for
    // CORS and for its Origin check on /auth/*. Fail fast instead of silently moving to
    // another port whose origin the backend rejects (403 "Untrusted request origin").
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Fixed value so tests never depend on a developer's .env.local.
    env: { VITE_API_BASE_URL: 'http://api.test/api/v1' },
    restoreMocks: true,
  },
})
