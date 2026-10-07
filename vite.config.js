import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // Allows tunnels and mobile connections without 403
    cors: true
  }
});
