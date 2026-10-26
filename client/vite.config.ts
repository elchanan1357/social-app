// import path from 'path'
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import tailwindcss from '@tailwindcss/vite'
// import { tanstackRouter } from '@tanstack/router-plugin/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     tanstackRouter({
//       target: 'react',
//       autoCodeSplitting: true,
//     }),
//     react(),
//     tailwindcss(),
//   ],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // מכריח את Vite להשתמש בגרסה יחידה של React עבור כל התלויות
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // מונע בעיות Pre-bundling של Radix UI
    include: ['react', 'react-dom'],
  },
})