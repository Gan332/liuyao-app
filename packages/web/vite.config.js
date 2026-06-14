import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * Strips `crossorigin` and `type="module"` from built HTML so it works
 * when opened via file:// protocol (Chrome blocks module scripts on file://).
 */
function fileProtocolFix() {
  return {
    name: 'file-protocol-fix',
    transformIndexHtml(html) {
      return html
        .replace(/(<script)\s+type="module"\s+crossorigin/g, '$1')
        .replace(/(<link\s+rel="stylesheet")\s+crossorigin/g, '$1')
    }
  }
}

export default defineConfig({
  root: 'src',
  base: './',
  plugins: [fileProtocolFix()],
  build: {
    modulePreload: false,
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
