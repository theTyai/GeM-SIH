import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const outdir = 'dist-extension';

// Ensure outdir exists
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

// Copy static files
fs.copyFileSync('extension/public/manifest.json', path.join(outdir, 'manifest.json'));
fs.copyFileSync('extension/public/index.html', path.join(outdir, 'index.html'));

// Build popup
esbuild.build({
  entryPoints: ['extension/src/popup/index.tsx'],
  bundle: true,
  outfile: path.join(outdir, 'popup.js'),
  format: 'iife',
  minify: true,
  target: ['chrome89'],
}).catch(() => process.exit(1));

// Build content script
esbuild.build({
  entryPoints: ['extension/src/content/index.ts'],
  bundle: true,
  outfile: path.join(outdir, 'content.js'),
  format: 'iife',
  minify: true,
}).catch(() => process.exit(1));

// Build background
esbuild.build({
  entryPoints: ['extension/src/background/index.ts'],
  bundle: true,
  outfile: path.join(outdir, 'background.js'),
  format: 'iife',
  minify: true,
}).catch(() => process.exit(1));

console.log('Extension built successfully to dist-extension/');
