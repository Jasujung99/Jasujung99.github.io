import Parser from 'rss-parser';
import { fetchWithRetry } from '../lib/fetch.mjs';
import { htmlToMarkdown, buildFrontMatter } from '../lib/md.mjs';
import { ensureDir, writeFile, exists } from '../lib/fs.mjs';
import { unicodeNormalize, toISODate } from '../lib/text.mjs';
import { slugify } from '../lib/slug.mjs';
import { shortHash } from '../lib/hash.mjs';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const BLOG_RSS = process.env.KB_BLOG_RSS || 'https://rss.blog.naver.com/haeumkorean.xml';
const KB_ROOT = 'public/kb';
const ASSETS_ROOT = 'public/assets/kb';

/** Download image and resize to max width 960px, return relative public path like /assets/kb/<hash>.jpg */
async function downloadAndResizeImage(url) {
  const res = await fetchWithRetry(url, { cache: 'no-store' });
  const arrayBuf = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  const hash = shortHash(buf);
  const outDir = ASSETS_ROOT;
  await ensureDir(outDir);
  const outPath = path.join(outDir, `${hash}.jpg`);
  if (!(await exists(outPath))) {
    try {
      const img = sharp(buf, { failOn: false });
      const meta = await img.metadata().catch(() => ({}));
      let pipeline = img.jpeg({ quality: 80 });
      if (meta && meta.width && meta.width > 960) {
        pipeline = img.resize({ width: 960 }).jpeg({ quality: 80 });
      }
      const outBuf = await pipeline.toBuffer();
      await fs.writeFile(outPath, outBuf);
    } catch (e) {
      // if sharp fails, just write original
      await fs.writeFile(outPath, buf);
    }
  }
  return `/assets/kb/${hash}.jpg`;
}

function extractImagesAndMainHtml(html, baseUrl) {
  const $ = cheerio.load(html);
  // Attempt Naver blog main content selectors
  const candidates = [
    '#postViewArea', // classic
    'div.se-main-container', // smart editor
    'div#contentArea',
    'div.se_component_wrap',
    'article',
    'body'
  ];
  let $main = null;
  for (const sel of candidates) {
    const el = $(sel);
    if (el && el.length) { $main = el.first(); break; }
  }
  if (!$main) $main = $('body');

  // Normalize image src to absolute
  $main.find('img').each((_, img) => {
    const src = $(img).attr('src');
    if (!src) return;
    // Many Naver images are protocol-relative or have params; keep as-is for fetch
    $(img).attr('src', new URL(src, baseUrl).href);
  });

  return { html: $main.html() || '', imageSrcs: $main.find('img').map((_, el) => $(el).attr('src')).get().filter(Boolean) };
}

export async function fetchNaverBlogPosts({ limit = 5 } = {}) {
  const parser = new Parser();
  const feed = await parser.parseURL(BLOG_RSS);
  const items = (feed.items || []).slice(0, limit);
  const out = [];

  for (const it of items) {
    const title = unicodeNormalize(it.title || '블로그 글');
    const link = it.link || it.guid || '';
    const dateISO = toISODate(it.isoDate || it.pubDate || new Date());

    // Prefer RSS content; otherwise fetch page HTML
    let html = it['content:encoded'] || it.content || '';
    if (!html && link) {
      try {
        const res = await fetchWithRetry(link, { cache: 'no-store' });
        const pageHtml = await res.text();
        const { html: mainHtml } = extractImagesAndMainHtml(pageHtml, link);
        html = mainHtml;
      } catch {}
    }

    // Extract images by parsing HTML regardless (to rewrite to local assets)
    let imageSrcs = [];
    if (html) {
      const { imageSrcs: imgs } = extractImagesAndMainHtml(html, link || BLOG_RSS);
      imageSrcs = imgs;
    }

    out.push({ title, link, dateISO, html, imageSrcs });
  }

  return out;
}

export async function generateBlogMarkdownFiles(posts) {
  const written = [];
  for (const p of posts) {
    const slug = slugify(p.title);
    const dir = path.join(KB_ROOT, 'blog');
    await ensureDir(dir);
    const fname = `${p.dateISO || '0000-00-00'}-${slug || 'post'}.md`;
    const fullPath = path.join(dir, fname);

    // Download images and rewrite src
    let html = p.html || '';
    for (const src of p.imageSrcs || []) {
      try {
        const localPath = await downloadAndResizeImage(src);
        const safeSrc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        html = html.replace(new RegExp(safeSrc, 'g'), localPath);
      } catch {}
    }

    const mdBody = htmlToMarkdown(html);
    const fm = buildFrontMatter({ title: p.title, date: p.dateISO, source: 'blog', external_url: p.link });
    const content = fm + mdBody + '\n';
    await writeFile(fullPath, content);

    written.push({ url: `/kb/blog/${fname}`, title: p.title, date: p.dateISO, source: 'blog', external_url: p.link });
  }
  return written;
}
