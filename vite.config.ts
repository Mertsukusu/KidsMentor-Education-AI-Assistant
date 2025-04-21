import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './app'
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/generate-lesson': 'http://localhost:8000'
    }
  }
}); 