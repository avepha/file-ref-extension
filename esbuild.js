const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    sourcemap: true,
    target: 'node20',
    logLevel: 'info',
  })
  .catch(() => process.exit(1));
