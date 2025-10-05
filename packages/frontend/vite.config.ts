import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  
  resolve: {
    dedupe: ['react', 'react-dom']
  },

  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@mysten/dapp-kit',
      '@mysten/sui'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'esnext',
    minify: 'esbuild',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'sui-vendor': ['@mysten/dapp-kit', '@mysten/sui'] // ✅ Tambahkan ini
        }
      }
    }
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3001', // ✅ Gunakan env variable
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // ✅ Ensure path tidak berubah
      }
    }
  }
})