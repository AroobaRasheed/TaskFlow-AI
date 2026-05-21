import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  // Ensure Vite exposes VITE_* env vars to the frontend
  envPrefix: 'VITE_',
});
