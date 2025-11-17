// Client-side document search over Markdown/TXT loaded at runtime (no bundling)
// - Loads manifest from /kb/manifest.json (under public/)
// - Fetches each listed text file (md/txt)
// - Builds a lightweight TF-IDF index by section (heading-based) and sentences for highlights
// - Exposes buildIndex() and search()

export type KBSection = {
  id: string;               // e.g., "file#slug"
  file: string;             // filename or url tail
  title: string;            // section heading (or file name)
  text: string;             // normalized section text
  sentences: string[];      // sentence split
  tf: Map<string, number>;  // token TF
};

export type KBIndex = { sections: KBSection[]; idf: Map<string, number> };

export type ManifestItem = {
  url: string;    // e.g., "/kb/about.md"
  title?: string; // optional display title
  type?: string;  // optional, e.g., "md" | "txt"
};

const KO_EN_TOKEN = /[가-힣]+|[A-Za-z0-9]+/g;
const STOP = new Set<string>([
  // Korean particles/common
  "은","는","이","가","을","를","에","의","과","와","도","로","으로","그리고","또는","하지만","또","또한","에서","에게",
  // English stopwords (basic)
  "the","a","an","and","or","to","in","of","for","on","at","is","are","was","were","be","as","by","with",
]);

function normalize(s: string): string {
  return s.normalize('NFC');
}

function tokenize(s: string): string[] {
  const n = normalize(s);
  const tokens = n.match(KO_EN_TOKEN) ?? [];
  return tokens
    .map(t => /[A-Za-z]/.test(t) ? t.toLowerCase() : t)
    .filter(t => !STOP.has(t));
}

function stripMarkdown(md: string): string {
  return md
    // code blocks kept but separated (we may downweight later by not giving heading bonus)
    .replace(/```[\s\S]*?```/g, (m) => `\n${m}\n`)
    // links: [text](url) -> text
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    // images: ![alt](src) -> alt
    .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
    // strip emphasis/backticks/extra symbols, keep heading markers as spaces
    .replace(/[*_~`]/g, '')
    .replace(/[>#-]/g, ' ')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Pre-clean raw text before markdown stripping
// - Removes common noise lines from imported blog dumps (e.g., Naver UI strings)
// - Drops "태그" blocks and miscellaneous toolbar labels
// - Normalizes excessive blank lines and zero-width chars
function precleanRawText(s: string): string {
  if (!s) return s;
  // Remove zero-width and BOM-like artifacts
  let out = s.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Remove blocks starting with a line exactly "태그" until next non-empty starting line
  // Example:
  // 태그\n#키워드\n#키워드2\n ... (until next non-empty line that does not start with whitespace)
  out = out.replace(/^태그\s*$[\s\S]*?(?=^\S|\Z)/gm, '');

  // Remove single-line UI noise (exact line matches)
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
  const escaped = noiseLines.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length) {
    const re = new RegExp(`^(?:${escaped.join('|')})\\s*$`, 'gm');
    out = out.replace(re, '');
  }

  // Collapse long runs of blank lines and trim trailing spaces per line
  out = out.replace(/\s+$/gm, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return out;
}

function splitSections(stripped: string, fallbackTitle: string): { title: string; body: string; full: string }[] {
  const raw = stripped.split(/\n(?=#+\s)/).filter(Boolean);
  const parts = raw.length > 0 ? raw : [stripped];
  const out: { title: string; body: string; full: string }[] = [];
  for (const part of parts) {
    const m = part.match(/^(#+)\s*(.+)$/);
    const title = m ? m[2].trim() : fallbackTitle;
    const body = m ? part.replace(/^(#+)\s*.+$/, '').trim() : part;
    const full = `${title}\n${body}`.trim();
    out.push({ title, body, full });
  }
  return out;
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export async function buildIndex(manifestUrl = '/kb/manifest.json'): Promise<KBIndex> {
  // Load manifest
  const res = await fetch(manifestUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
  const manifest = (await res.json()) as ManifestItem[];

  const sections: KBSection[] = [];

  for (const item of manifest) {
    try {
      const fileRes = await fetch(item.url, { cache: 'no-store' });
      if (!fileRes.ok) continue;
      const raw = await fileRes.text();
      const cleaned = precleanRawText(raw);
      const file = item.url.split('/').pop() || item.url;
      const fallbackTitle = (item.title || file).replace(/\.(md|txt)$/i, '');
      const stripped = stripMarkdown(cleaned);
      const parts = splitSections(stripped, fallbackTitle);
      for (const p of parts) {
        const text = p.full;
        const sentences = sentenceSplit(text);
        const tf = new Map<string, number>();
        for (const tok of tokenize(text)) tf.set(tok, (tf.get(tok) || 0) + 1);
        sections.push({ id: `${file}#${p.title}`, file, title: p.title, text, sentences, tf });
      }
    } catch {
      // ignore file errors
    }
  }

  // Build IDF
  const df = new Map<string, number>();
  for (const s of sections) {
    const seen = new Set<string>();
    for (const tok of s.tf.keys()) { if (!seen.has(tok)) { seen.add(tok); df.set(tok, (df.get(tok) || 0) + 1); } }
  }
  const N = sections.length || 1;
  const idf = new Map<string, number>();
  for (const [tok, d] of df) idf.set(tok, Math.log((N + 1) / (d + 1)) + 1);

  return { sections, idf };
}

export type SearchHit = {
  section: KBSection;
  score: number;
  highlights: string[]; // top sentences
};

export function search(query: string, index: KBIndex, k = 5): SearchHit[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const qtf = new Map<string, number>();
  for (const t of qTokens) qtf.set(t, (qtf.get(t) || 0) + 1);

  const hits: SearchHit[] = [];
  for (const s of index.sections) {
    let score = 0;
    for (const [t, qv] of qtf) {
      const tf = s.tf.get(t) || 0;
      if (!tf) continue;
      const idfv = index.idf.get(t) || 1;
      score += tf * idfv * Math.sqrt(qv);
    }
    // title/file bonuses for soft match
    for (const t of qTokens) {
      if (s.title.includes(t)) score *= 1.2;
      if (s.file.includes(t)) score *= 1.1;
    }
    if (score > 0) {
      const sentScores = s.sentences.map((sent) => {
        const toks = tokenize(sent);
        const set = new Set(toks);
        const hit = qTokens.reduce((acc, t) => acc + (set.has(t) ? 1 : 0), 0);
        return { sent, hit };
      });
      sentScores.sort((a, b) => b.hit - a.hit || b.sent.length - a.sent.length);
      const highlights = sentScores.filter(v => v.hit > 0).slice(0, 4).map(v => v.sent);
      hits.push({ section: s, score, highlights });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, k);
}
