import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';

import pkg from './package.json' with { type: 'json' };
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
        babelHelpers: 'bundled',
        exclude: ['node_modules/**', 'vite.config.*'],
      }),
    ],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        plugins: [
          getBabelOutputPlugin({
            plugins: [],
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
