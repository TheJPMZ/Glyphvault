#!/usr/bin/env node
// Rebuilds manifest.json from logos/, preserving existing tags per slug.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOGOS_DIR = path.join(ROOT, "logos");
const MANIFEST_PATH = path.join(ROOT, "manifest.json");
const CDN_BASE = "https://cdn.jsdelivr.net/gh/TheJPMZ/Glyphvault@main/";
const VALID_EXT = new Set([".svg", ".png", ".webp"]);

function loadExisting() {
  if (!fs.existsSync(MANIFEST_PATH)) return { logos: [] };
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return { logos: [] };
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function main() {
  const existing = loadExisting();
  const bySlug = new Map((existing.logos || []).map((l) => [l.slug, l]));

  const files = fs.existsSync(LOGOS_DIR)
    ? fs
        .readdirSync(LOGOS_DIR)
        .filter((f) => VALID_EXT.has(path.extname(f).toLowerCase()))
        .sort()
    : [];

  const logos = files.map((file) => {
    const base = path.basename(file, path.extname(file));
    const slug = slugify(base);
    const prev = bySlug.get(slug);
    return {
      id: prev?.id ?? slug,
      name: prev?.name ?? base,
      slug,
      file: `logos/${file}`,
      tags: prev?.tags ?? [],
    };
  });

  const manifest = {
    cdn_base: CDN_BASE,
    generated_at: new Date().toISOString(),
    logos,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`manifest.json regenerated: ${logos.length} logo(s).`);
}

main();
