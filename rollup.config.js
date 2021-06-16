import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
  // ES Modules
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'es',
    },
    plugins: [typescript(), babel({ extensions: ['.ts'] })],
  },

  // UMD
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'umd',
      name: 'svelteGestures',
      indent: false,
    },
    plugins: [
      typescript(),
      babel({ extensions: ['.ts'], exclude: 'node_modules/**' }),
      terser(),
    ],
  },
];
