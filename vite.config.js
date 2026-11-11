import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

export default defineConfig({
  base: './',
  server: { allowedHosts: ['.e2b.app'] },
  plugins: [{
    name: 'offline-worker',
    generateBundle(_, bundle) {
      const assets = ['./', './index.html', './manifest.webmanifest', './icon.svg', ...Object.keys(bundle).filter(name => /\.(js|css)$/.test(name)).map(name => './' + name)];
      const worker = readFileSync(new URL('./src/offline-worker.js', import.meta.url), 'utf8')
        .replace('__CACHE__', `lightlink-${Date.now()}`)
        .replace('__ASSETS__', JSON.stringify(assets));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: worker });
    },
  }],
});
