import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = env.PORT ? parseInt(env.PORT) : 4173

  return {
    plugins: [
      react(),
      // Gzip compression for all assets
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // Only compress files larger than 1KB
        deleteOriginFile: false
      }),
      // Brotli compression (better compression than gzip)
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false
      })
    ],
    preview: {
      port: port,
      host: '0.0.0.0',
      allowedHosts: [
        'graceful-optimism-production.up.railway.app',
        '.up.railway.app',
        'localhost'
      ]
    },
    server: {
      port: 5173,
      host: '0.0.0.0'
    },
    build: {
      // Optimize for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
          passes: 2 // Run terser twice for better minification
        },
        mangle: {
          safari10: true // Ensure Safari 10 compatibility
        }
      },
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: (id) => {
            // React core libraries
            if (id.includes('node_modules/react') ||
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/react-router')) {
              return 'react-vendor';
            }

            // Chakra UI - split into smaller chunks
            if (id.includes('@chakra-ui') ||
                id.includes('@emotion') ||
                id.includes('framer-motion')) {
              return 'chakra-ui';
            }

            // Charts - only loaded when Analytics page opens
            if (id.includes('recharts')) {
              return 'charts';
            }

            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-fns';
            }

            // Form libraries
            if (id.includes('react-hook-form') ||
                id.includes('@hookform') ||
                id.includes('zod')) {
              return 'forms';
            }

            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }

            // React Icons - separate chunk
            if (id.includes('react-icons')) {
              return 'react-icons';
            }

            // Vendor chunks for other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // Optimize chunk file names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      // Split chunks more aggressively
      chunkSizeWarningLimit: 500,
      // Disable source maps in production for smaller bundles
      sourcemap: false,
      // Target modern browsers for smaller output
      target: 'es2020',
      // CSS code splitting
      cssCodeSplit: true
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@chakra-ui/react',
        '@tanstack/react-query',
        'date-fns'
      ]
    },
    // Enable better tree shaking
    esbuild: {
      legalComments: 'none',
      drop: mode === 'production' ? ['console', 'debugger'] : []
    }
  }
})
