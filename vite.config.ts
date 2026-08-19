import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

const API_BASE = 'https://api.weather-ai.co';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.WEATHER_AI_API_KEY;
  const baseUrl = env.WEATHER_AI_BASE_URL || API_BASE;

  const makeProxy = (localPath: string, upstreamPath: string): ProxyOptions => ({
    target: baseUrl,
    changeOrigin: true,
    secure: true,
    rewrite: (path) => path.replace(new RegExp(`^${localPath}`), upstreamPath),
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        if (apiKey) proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
        proxyReq.setHeader('Accept', 'application/json');
      });
    }
  });

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api/weather': makeProxy('/api/weather', '/v1/weather'),
        '/api/current': makeProxy('/api/current', '/v1/current'),
        '/api/hourly': makeProxy('/api/hourly', '/v1/hourly'),
        '/api/daily': makeProxy('/api/daily', '/v1/daily'),
        '/api/usage': makeProxy('/api/usage', '/v1/usage')
      }
    }
  };
});
