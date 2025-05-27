import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        middleware: resolve(__dirname, 'src/middleware/index.ts'),
        compliance: resolve(__dirname, 'src/compliance/index.ts'),
        wallet: resolve(__dirname, 'src/providers/wallet/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'next',
        '@supabase/supabase-js',
        'ethers',
        'next-auth',
        'web3',
        'viem',
        'wagmi',
      ],
      output: {
        preserveModules: true,
        exports: 'named',
      },
    },
  },
  plugins: [dts()],
});