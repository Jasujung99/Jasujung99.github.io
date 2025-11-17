import fs from 'node:fs/promises';
import { resolve } from 'node:path';

// One-off cleaner: make a cleaned text from blog-original-materials.txt without images
// Usage: node scripts/oneoff/clean-blog.mjs

const IN = resolve('public/kb/blog-original-materials.txt');
const OUT = resolve('public/kb/blog-clean.txt');

const noiseLines = [
  '프로파일',
  'URL 복사',
  '통계',
  '본문 기타 기능',
  '태그수정',
  'Keep 보내기메모 보내기기타 보내기 펼치기',
  'Keep 보내기',
  '메모 보내기',
  '기타 보내기',
  '펼치기',
  '수정 삭제 설정',
  '외부',
  '네이버 지도',
  'naver.me'
];

function cleanText(s) {
  if (!s) return s;
  // Zero-width and BOM like
  let out = s.replace(/[\u200B-\u200D\uFEFF]/g, '');
  // Remove tag blocks starting with a line exactly '태그'
  out = out.replace(/^태그\s*$[\s\S]*?(?=^\S|\Z)/gm, '');
  // Remove exact noise lines
  const escaped = noiseLines.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length) {
    const re = new RegExp(`^(?:${escaped.join('|')})\\s*$`, 'gm');
    out = out.replace(re, '');
  }
  // Trim trailing spaces per line and collapse excessive blank lines
  out = out.replace(/\s+$/gm, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return out;
}

async function main() {
  const src = await fs.readFile(IN, 'utf8');
  const cleaned = cleanText(src);
  await fs.writeFile(OUT, cleaned, 'utf8');
  console.log('[clean-blog] wrote', OUT);
}

main().catch((e) => { console.error('[clean-blog] failed:', e); process.exit(1); });
