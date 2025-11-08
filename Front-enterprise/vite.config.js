import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    historyApiFallback: true,
    // Add CORS headers for development
    cors: {
      origin: "*", // Allow all origins during development
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    // Proxy para las imágenes del backend
    proxy: {
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist', // Specify the output directory
    emptyOutDir: true, // Clean the outDir before building
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser', // Use terser for minification
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('zod') || id.includes('react-hook-form')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
        }
      },
    },
  },
  // Base URL for assets - change this if deploying to a subdirectory
  base: './', // Use relative paths for better portability
})
