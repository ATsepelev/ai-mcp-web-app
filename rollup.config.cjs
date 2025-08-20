const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const postcss = require('rollup-plugin-postcss');

// Общие плагины для всех конфигураций
const commonPlugins = [
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

// Общие внешние зависимости для всех конфигураций
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
      sourcemap: true
    },
    plugins: [
      postcss({
        extract: false,
        minimize: true,
        modules: false
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
      sourcemap: true
    },
    plugins: [
      postcss({
        extract: false,
        minimize: true,
        modules: false
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
      sourcemap: true
    },
    plugins: [
      postcss({
        extract: 'chat-widget.css',
        minimize: true
      }),
      ...commonPlugins,
      terser()
    ],
    external: commonExternal
  }
];