import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Exposes on 0.0.0.0 for phone/mobile access over Wi-Fi
    allowedHosts: true, // Allows all hosts (fixes ngrok "Blocked request: Host is not allowed")
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'process.env': {},
  },
});
