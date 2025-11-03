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
      const file = item.url.split('/').pop() || item.url;
      const fallbackTitle = (item.title || file).replace(/\.(md|txt)$/i, '');
      const stripped = stripMarkdown(raw);
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
