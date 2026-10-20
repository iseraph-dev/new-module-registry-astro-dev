import { Miniflare } from 'miniflare';

const mode = process.argv[2] === 'legacy' ? 'legacy' : 'new';

const mf = new Miniflare({
  unsafeModuleFallbackService: async (request) => {
    const body = request.method === 'POST' ? await request.text() : request.url;
    const raw =
      request.method === 'POST'
        ? JSON.parse(body).rawSpecifier
        : new URL(request.url).searchParams.get('rawSpecifier');
    console.error(`FALLBACK ${request.method} raw=${raw}`);
    if (!String(raw).includes('__CLOUDFLARE_MODULE__')) {
      throw new Error(`Unexpected error: no match for module: ${raw}`);
    }
    return new Response('not found', { status: 404 });
  },
  workers: [
    {
      config: {
        name: 'probe',
        compatibilityDate: '2026-10-19',
        compatibilityFlags: [
          mode === 'new' ? 'new_module_registry' : 'legacy_module_registry',
        ],
        manifest: {
          mainModule: 'index.js',
          modulesRoot: '/',
          modules: {
            'index.js': {
              type: 'esm',
              contents: `
                export default {
                  fetch() {
                    return Response.json({ process: typeof process });
                  },
                };
              `,
            },
          },
        },
      },
      dev: { useModuleFallbackService: true },
    },
  ],
});

try {
  const response = await mf.dispatchFetch('http://localhost/');
  console.log('STATUS', response.status);
  console.log(await response.text());
} finally {
  await mf.dispose();
}
