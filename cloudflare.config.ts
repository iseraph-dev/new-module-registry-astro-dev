import { defineConfig } from 'cf/config';

const compatibilityFlags = ['global_fetch_strictly_public'];
if (process.env.NMR === '1') compatibilityFlags.push('new_module_registry');

export default defineConfig({
  worker: {
    name: 'nmr-astro-repro',
    compatibilityDate: '2026-10-19',
    compatibilityFlags,
  },
});
