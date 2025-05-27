const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const { terser } = require('rollup-plugin-terser');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const dts = require('rollup-plugin-dts').default;  // Note the .default here
const { defineConfig } = require('rollup');
const pkg = require('./package.json');

// List of dependencies to externalize (don't bundle)
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'react/jsx-runtime',
  'next/router',
  'next/navigation',
  'crypto'
];

// Common plugins used in all builds
const commonPlugins = [
  // Extract peer dependencies
  peerDepsExternal(),
  
  // Resolve node modules
  resolve({
    browser: true,
    preferBuiltins: true
  }),
  
  // Convert CommonJS modules to ES6
  commonjs({
    include: 'node_modules/**'
  }),
  
  // Compile TypeScript
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: true,
    inlineSources: true,
    declaration: false
  })
];

module.exports = defineConfig([
  // Main builds (CJS, ESM, UMD)
  {
    input: 'src/index.ts',
    output: [
      // CommonJS build (for Node.js)
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        interop: 'auto'
      },
      // ES Module build (for bundlers)
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        exports: 'named'
      },
      // UMD build (for browsers)
      {
        name: 'VVAuth',
        file: 'dist/vv-auth.umd.js',
        format: 'umd',
        sourcemap: true,
        exports: 'named',
        plugins: [terser()],
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@supabase/supabase-js': 'Supabase',
          'ethers': 'ethers'
        }
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // Middleware build (separate entry point)
  {
    input: 'src/middleware/index.ts',
    output: [
      {
        file: 'dist/middleware.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/middleware.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // Compliance build (separate entry point)
  {
    input: 'src/compliance/index.ts',
    output: [
      {
        file: 'dist/compliance.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/compliance.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // Wallet providers build (separate entry point)
  {
    input: 'src/providers/wallet/index.ts',
    output: [
      {
        file: 'dist/wallet.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/wallet.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external,
    plugins: commonPlugins
  },
  
  // TypeScript declaration files
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  },
  {
    input: 'src/middleware/index.ts',
    output: [{ file: 'dist/middleware.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  },
  {
    input: 'src/compliance/index.ts',
    output: [{ file: 'dist/compliance.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  },
  {
    input: 'src/providers/wallet/index.ts',
    output: [{ file: 'dist/wallet.d.ts', format: 'es' }],
    plugins: [dts()],
    external
  }
]);