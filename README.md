<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/logos/glyphvault.svg" width="120" />

  # Glyphvault

  **Public logo store, one source of truth, served straight off the CDN.**

  ![Node](https://img.shields.io/badge/Node-CommonJS-339933?logo=node.js&logoColor=white)
  ![jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-E84D3D?logo=jsdelivr&logoColor=white)
  ![Manifest](https://img.shields.io/badge/schema-draft--07-blue)

</div>

---

## Overview

Glyphvault holds every project logo in one public repo so other apps don't vendor their own copies. `manifest.json` indexes each file by id, name, slug, and tags; consumers fetch it once from jsDelivr and resolve URLs by joining `cdn_base + file`. A pre-commit hook regenerates the manifest from `logos/` on every commit, so the index never drifts from the actual files.

`Drop logo → generate-manifest.js → tag it → commit → consumers pull via CDN`

---

## Features

- **CDN-native** — files served through jsDelivr's GitHub proxy, no hosting, no auth.
- **Self-healing manifest** — `generate-manifest.js` rebuilds the index from `logos/` on disk, preserving existing `tags` per slug across regenerations.
- **Pre-commit enforcement** — `setup-hooks.sh` installs a hook that regenerates and restages `manifest.json` before every commit, so the manifest can't go stale.
- **Schema-validated** — `manifest.schema.json` (draft-07) pins the shape of every entry: `id`, `name`, `slug`, `file`, `tags`, all required, no extras.
- **Flat-file fallback** — jsDelivr's file-listing API works without the manifest when a consumer only needs paths, not metadata.

---

## Getting Started

Run once after cloning:

```sh
sh scripts/setup-hooks.sh
```

Installs the pre-commit hook. Without it, `manifest.json` won't auto-update when you add or remove logos.

### Add a logo

1. Drop the file in `logos/` — prefer `.svg`, kebab-case name (e.g. `acme-corp.svg`). Accepted extensions: `.svg`, `.png`, `.webp`.
2. `node scripts/generate-manifest.js`
3. Edit the new entry's `tags` in `manifest.json` if needed.
4. Commit and push (the pre-commit hook re-runs the generator for you).

### Consume from another project

```js
const res = await fetch(
  "https://cdn.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/manifest.json"
);
const { cdn_base, logos } = await res.json();

const acme = logos.find((l) => l.slug === "acme-corp");
const logoUrl = cdn_base + acme.file;
```

Or skip the manifest entirely when the filename is already known:

```
https://cdn.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/logos/acme-corp.svg
```

---

## Project Structure

```
logos/                    logo files, svg/png/webp
manifest.json              generated index: id, name, slug, file, tags
manifest.schema.json       draft-07 JSON Schema for manifest.json
scripts/
  generate-manifest.js      rebuilds manifest.json from logos/, keeps existing tags
  setup-hooks.sh             installs the pre-commit hook
```

This repo's root doubles as the user's home directory — `.gitignore` allowlists only `logos/`, `manifest.json`, `manifest.schema.json`, `scripts/`, `README.md`. Don't remove that allowlist structure.

---

## Notes

- Repo must stay **public** — jsDelivr needs it for unauthenticated CDN access.
- jsDelivr caches by branch/tag for ~12h. Force-refresh after a push: `https://purge.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/manifest.json`. Pin to a commit SHA instead of `@main` for consumers that need immutability.
- No manifest, just filenames? `https://data.jsdelivr.com/v1/package/gh/TheJPMZ/Glyphvault@main/flat` lists every file with path and size — filter for `logos/`.
