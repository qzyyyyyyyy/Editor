import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/trouble-editor/',
  plugins: [tsconfigPaths(),react()],

  css: {
    modules: {
      hashPrefix: "prefix",
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  }
})
