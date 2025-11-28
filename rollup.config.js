import { lezer } from '@lezer/generator/rollup';

export default {
  input: './src/formula.grammar',
  output: [
    {
      format: 'es',
      file: './dist/parser.js',
    },
    {
      format: 'cjs',
      file: './dist/parser.cjs',
    },
  ],
  external: ['@lezer/lr', '@lezer/highlight'],
  plugins: [lezer()],
};
