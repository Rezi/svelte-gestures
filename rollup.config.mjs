import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';

import pkg from './package.json' assert { type: 'json' };
import resolve from '@rollup/plugin-node-resolve';

const extensions = ['.js', '.ts'];

export default [
  {
    input: 'src/index.ts',
    plugins: [
      resolve({
        extensions,
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
      }),
    ],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        plugins: [
          getBabelOutputPlugin({
            plugins: ['@babel/plugin-proposal-optional-chaining'],
          }),
        ],
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
  },
];
