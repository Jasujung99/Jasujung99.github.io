#!/usr/bin/env node
import { readJSON, writeJSON, ensureDir, resolveRoot, exists } from './lib/fs.mjs';
import { fetchNaverBlogPosts, generateBlogMarkdownFiles } from './sources/naverBlog.mjs';

async function main() {
  const manifestPath = resolveRoot('public/kb/manifest.json');
  const kbDir = resolveRoot('public/kb');
  await ensureDir(kbDir);

  // Load existing manifest (backward compatible: array of {url,title} only)
  let manifest = await readJSON(manifestPath, []);
  if (!Array.isArray(manifest)) manifest = [];

  // Phase 1: Blog only. Fetch latest posts (limit configurable via env)
  const limit = Number(process.env.KB_BLOG_LIMIT || 5);
  console.log(`[kb-sync] Fetching blog RSS (limit=${limit}) ...`);
  const posts = await fetchNaverBlogPosts({ limit });
  console.log(`[kb-sync] RSS items: ${posts.length}`);

  // Generate markdown files + download/resize images
  const written = await generateBlogMarkdownFiles(posts);
  console.log(`[kb-sync] Generated docs: ${written.length}`);

  // Merge into manifest (by url uniqueness); update or append
  const indexByUrl = new Map(manifest.map((m) => [m.url, m]));
  for (const w of written) {
    const prev = indexByUrl.get(w.url);
    if (prev) {
      indexByUrl.set(w.url, { ...prev, ...w });
    } else {
      indexByUrl.set(w.url, w);
    }
  }
  let merged = Array.from(indexByUrl.values());
  // Sort desc by date, then by title
  merged.sort((a,b) => {
    const ad = a.date || '0000-00-00';
    const bd = b.date || '0000-00-00';
    if (ad > bd) return -1; if (ad < bd) return 1;
    const at = (a.title||'').localeCompare?.(b.title||'') ?? 0;
    return at;
  });

  // Write manifest
  await writeJSON(manifestPath, merged);
  console.log(`[kb-sync] Manifest updated: ${manifestPath}`);

  console.log(`[kb-sync] Done.`);
}

main().catch((err) => {
  console.error('[kb-sync] Failed:', err);
  process.exit(1);
});
