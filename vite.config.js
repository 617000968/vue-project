import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    historyApiFallback: true, // 允许在路由跳转时自动回到 index.html
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});