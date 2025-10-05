import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  
  resolve: {
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@mysten/dapp-kit'
    ],
    // ✅ KUNCI: Exclude @mysten/sui dari optimizeDeps
    exclude: ['@mysten/sui'],
    esbuildOptions: {
      target: 'esnext',
      supported: {
        // ✅ Support untuk top-level await
        'top-level-await': true
      }
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
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ✅ Custom chunking logic
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('@mysten')) {
              return 'mysten-vendor'; // ✅ Pisahkan Mysten packages
            }
            return 'vendor';
          }
        }
      }
    }
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})