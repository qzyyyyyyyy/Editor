import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/trouble-editor/',
  plugins: [tsconfigPaths(), react()],

  css: {
    modules: {
      hashPrefix: 'prefix',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  // 开发环境代理：前端 fetch('/api/...') 转发到后端 Express 服务
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
