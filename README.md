# `new_module_registry` and `astro dev`

`astro dev` with the `new_module_registry` compatibility flag logs an assertion from `@cloudflare/vite-plugin` while the dev server is starting. The server still comes up, and the page responds.

Without the flag there is no such error.

## Run

```bash
pnpm install
pnpm dev:new
```

In another terminal:

```bash
curl -sS -D- http://127.0.0.1:4391/
```

`pnpm dev` is the same app without the flag.

## What you should see

With `pnpm dev:new`, before "ready":

```text
AssertionError [ERR_ASSERTION]: Unexpected error: no match for module: node:process.
    at Object.unsafeModuleFallbackService (.../@cloudflare/vite-plugin/dist/index.mjs)
[vite] Fallback service failed to fetch module; body = Module fallback failed; specifier = node:process
```

Then the server is ready and `curl` returns `200` with `<p>ok</p>`.

`pnpm dev` reaches ready with no such error. `curl` returns the same page.

## Same failure without Astro

`probe.mjs` copies the plugin's fallback check (only `__CLOUDFLARE_MODULE__` wasm, text, and data specifiers) and reads `process` inside a worker.

```bash
node probe.mjs          # new registry: FALLBACK POST raw=node:process, then STATUS 200
node probe.mjs legacy   # no fallback line, STATUS 200
```

## Versions

- Node 26.12.0, pnpm 12.14.0, Linux (WSL2)
- astro 7.4.1
- @astrojs/cloudflare 15.0.0-beta.2
- @cloudflare/vite-plugin 2.0.0-beta.v.1
- miniflare 5.20261012.1-beta
