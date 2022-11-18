import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const extensions = ['.js', '.ts'];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    plugins: [
      resolve({
        extensions,
      }),
      babel({ extensions, exclude: 'node_modules/**', plugins: ['@babel/plugin-proposal-optional-chaining'] }),
    ],
  },
];
