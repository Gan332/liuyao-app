import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html')
    },
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    cssCodeSplit: false,
    assetsInlineLimit: 100000,
    reportCompressedSize: false
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
