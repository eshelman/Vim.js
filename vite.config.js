import { defineConfig } from 'vite';
import { resolve } from 'path';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig(({ mode }) => {
  const isMinified = mode === 'minified';

  return {
    plugins: [commonjs()],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'vim',
        formats: ['umd'],
        fileName: () => isMinified ? 'vim.min.js' : 'vim.js',
      },
      outDir: 'build',
      emptyOutDir: false,
      sourcemap: !isMinified,
      minify: isMinified ? 'esbuild' : false,
    },
    test: {
      include: ['test/**/*.test.js'],
    },
  };
});
