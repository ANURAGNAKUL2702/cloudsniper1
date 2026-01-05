import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for CloudSniper project
// https://vitejs.dev/config/
export default defineConfig({
  // React plugin for JSX support
  plugins: [react()],
  optimizeDeps: {
    // Exclude lucide-react from pre-bundling for better development experience
    exclude: ['lucide-react'],
  },
  server: {
    // Proxy API requests to AWS Lambda
    proxy: {
      '/api': {
        target: 'https://tczswboifjsccnvhzq2vng2xm40kmrfb.lambda-url.ap-south-1.on.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
}); // End Vite configuration