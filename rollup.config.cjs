const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

// Common plugins for all configurations
const commonPlugins = [
  replace({
    preventAssignment: true,
    values: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __REPO_URL__: JSON.stringify(pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''))
    }
  }),
  resolve({
    browser: true,
    extensions: ['.js', '.jsx']
  }),
  commonjs({
    include: 'node_modules/**',
    exclude: ['src/**']
  }),
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    presets: [
      ['@babel/preset-env', { modules: false }],
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    extensions: ['.js', '.jsx']
  })
];

// Common external dependencies for all configurations
const commonExternal = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime'
];

module.exports = [
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      inlineDynamicImports: true
    },
    plugins: [
      postcss({
        extract: false,
        minimize: true,
        modules: {
          generateScopedName: '[hash:base64:8]'
        }
      }),
      ...commonPlugins
    ],
    external: commonExternal
  },
  // ES module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      exports: 'named',
      sourcemap: true,
      inlineDynamicImports: true
    },
    plugins: [
      postcss({
        extract: false,
        minimize: true,
        modules: {
          generateScopedName: '[hash:base64:8]'
        }
      }),
      ...commonPlugins,
      terser()
    ],
    external: commonExternal
  },
  // UMD build (for browsers)
  {
    input: 'src/index.js',
    output: {
      name: 'AIChatWidget',
      file: 'dist/index.umd.js',
      format: 'umd',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react/jsx-runtime': 'jsxRuntime',
        'react/jsx-dev-runtime': 'jsxRuntime'
      },
      exports: 'named',
      sourcemap: true,
      inlineDynamicImports: true
    },
    plugins: [
      postcss({
        extract: 'chat-widget.css',
        minimize: true,
        modules: {
          generateScopedName: '[hash:base64:8]'
        }
      }),
      ...commonPlugins,
      terser()
    ],
    external: commonExternal
  }
];