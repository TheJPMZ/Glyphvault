# Glyphvault

Public logo store. Single source of truth for project logos, queried by **SEK Hub** and **Nebula** via CDN + manifest.

## Structure

```
logos/              actual logo files (svg/png/webp)
manifest.json        index of every logo: id, name, slug, file, tags
manifest.schema.json JSON Schema for manifest.json
scripts/generate-manifest.js   rebuilds manifest.json from logos/
```

## Setup (once, after clone)

```
sh scripts/setup-hooks.sh
```

Installs pre-commit hook that auto-runs `generate-manifest.js` on every commit.

## Add a logo

1. Drop file in `logos/` (prefer `.svg`, kebab-case filename, e.g. `acme-corp.svg`).
2. `node scripts/generate-manifest.js`
3. Edit the new entry's `tags` in `manifest.json` if needed.
4. Commit + push.

## Query from SEK Hub / Nebula

Fetch the manifest once, cache it, resolve URLs from `cdn_base + file`:

```js
const res = await fetch(
  "https://cdn.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/manifest.json"
);
const { cdn_base, logos } = await res.json();

const acme = logos.find((l) => l.slug === "acme-corp");
const logoUrl = cdn_base + acme.file;
```

Direct single-logo fetch (skip manifest) when you already know the filename:

```
https://cdn.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/logos/acme-corp.svg
```

### Cache-busting

jsdelivr caches by tag/branch for ~12h. To force-refresh after a push:
`https://purge.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/manifest.json`

Pin to a commit SHA instead of `@main` for consumers that need immutability.

## Notes

- This repo's root is the user's home directory — `.gitignore` allowlists only
  `logos/`, `manifest.json`, `manifest.schema.json`, `scripts/`, `README.md`.
  Do not remove that allowlist structure.
- Repo must stay **public** for jsdelivr CDN access without auth.
