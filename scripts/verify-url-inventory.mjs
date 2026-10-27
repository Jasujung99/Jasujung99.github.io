// Build first, then run: node scripts/verify-url-inventory.mjs
// Optional read-only HTTP checks: --base-url http://127.0.0.1:4173
// --baseline <ref> selects a different pre-migration snapshot.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const oldOrigin = 'https://haeumkorean.me';
const newOrigin = 'https://haeum.haeonkorean.com';
let baseline = 'c2e4d2c82e3a111fd98312088fc06a97605e7e0b';
let baseUrl;
for (let index = 2; index < process.argv.length; index++) {
  const option = process.argv[index];
  assert(['--baseline', '--base-url'].includes(option), `Unknown option: ${option}`);
  const value = process.argv[++index];
  assert(value, `Missing value for ${option}`);
  if (option === '--baseline') baseline = value;
  else baseUrl = new URL(value);
}
if (baseUrl) {
  assert(['http:', 'https:'].includes(baseUrl.protocol), 'HTTP checks require http/https');
  assert(baseUrl.pathname === '/' && !baseUrl.search && !baseUrl.hash, 'Use the origin without a subpath/query/hash');
  assert(!baseUrl.username && !baseUrl.password, 'Do not supply credentials in the URL');
}

function git(...args) {
  return execFileSync('git', args, { cwd: root, maxBuffer: 16 * 1024 * 1024 });
}
function before(file) { return git('show', `${baseline}:${file}`); }
async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    assert(!entry.isSymbolicLink(), `Unexpected symlink: ${relative}`);
    if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name), `${relative}/`));
    else files.push(relative);
  }
  return files.sort();
}
function text(buffer) { return buffer.toString('utf8').replace(/\r\n/g, '\n'); }
function encodedPath(value) { return value.split('/').map(encodeURIComponent).join('/'); }

const baselineFiles = git('ls-tree', '-r', '-z', '--name-only', baseline, '--', 'public')
  .toString('utf8').split('\0').filter(Boolean).map(file => file.slice('public/'.length)).sort();
const publicFiles = await walk(path.join(root, 'public'));
assert.deepEqual(publicFiles, baselineFiles, 'Public filenames/case changed from the pre-migration snapshot');
const publicPaths = new Set(publicFiles.map(file => `/${file}`));
const distFiles = new Set(await walk(path.join(root, 'dist')));
const checkedPaths = new Set(['/', '/index.html']);
const intentionalTextChanges = new Set(['CNAME', 'kb/about.md']);

for (const file of publicFiles) {
  assert(distFiles.has(file), `Missing or case-mismatched dist file: /${file}`);
  const current = await readFile(path.join(root, 'public', file));
  assert.deepEqual(await readFile(path.join(root, 'dist', file)), current, `Stale/changed public copy: /${file}`);
  const original = before(`public/${file}`);
  if (intentionalTextChanges.has(file)) {
    assert.equal(text(current).replaceAll(newOrigin, oldOrigin).replaceAll('haeum.haeonkorean.com', 'haeumkorean.me'), text(original),
      `Unexpected changes beyond the homepage domain: /${file}`);
  } else if (/\.(md|txt|json|svg)$/.test(file)) {
    assert.equal(text(current), text(original), `Unrelated public text changed: /${file}`);
  } else {
    assert.deepEqual(current, original, `Unrelated public asset changed: /${file}`);
  }
  checkedPaths.add(`/${file}`);
}

const manifest = JSON.parse(await readFile(path.join(root, 'public/kb/manifest.json'), 'utf8'));
const originalManifest = JSON.parse(before('public/kb/manifest.json').toString('utf8'));
assert.deepEqual(manifest.map(item => item.url), originalManifest.map(item => item.url), 'Manifest dependency URLs changed');
assert.deepEqual(manifest.map(item => item.external_url), originalManifest.map(item => item.external_url), 'Historical blog source URLs changed');
assert.equal(new Set(manifest.map(item => item.url)).size, manifest.length, 'Duplicate manifest URL');
for (const item of manifest) {
  assert(item.url.startsWith('/') && !item.url.startsWith('//'), `Manifest must use root-relative paths: ${item.url}`);
  assert(publicPaths.has(decodeURIComponent(item.url)), `Missing/case-mismatched manifest dependency: ${item.url}`);
}

let kbImages = 0;
for (const file of publicFiles.filter(file => /\.md$/.test(file))) {
  const contents = await readFile(path.join(root, 'public', file), 'utf8');
  for (const match of contents.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)) {
    assert(publicPaths.has(decodeURIComponent(match[1])), `Broken KB image in ${file}: ${match[1]}`);
    kbImages++;
  }
}

const app = await readFile(path.join(root, 'src/App.tsx'), 'utf8');
const routeCases = source => [...source.matchAll(/case\s+["']([^"']*)["']\s*:/g)].map(match => match[1]);
assert.deepEqual(routeCases(app), routeCases(before('src/App.tsx').toString('utf8')), 'Hash route/compatibility aliases changed');
const home = await readFile(path.join(root, 'src/pages/HaeumHomePage.tsx'), 'utf8');
for (const anchor of ['about', 'programs', 'online-learning', 'contact']) {
  assert(home.includes(`href="#${anchor}"`) && home.includes(`id="${anchor}"`), `Missing home navigation target: #${anchor}`);
}
const sourceFiles = (await walk(path.join(root, 'src'))).filter(file => /\.(tsx?|css)$/.test(file));
let sourceAssetReferences = 0;
for (const file of sourceFiles) {
  const contents = await readFile(path.join(root, 'src', file), 'utf8');
  for (const match of contents.matchAll(/["'](\/[^"'\n]+\.(?:png|jpe?g|svg|json|md|txt))["']/g)) {
    assert(publicPaths.has(decodeURIComponent(match[1])), `Broken root-relative URL in src/${file}: ${match[1]}`);
    sourceAssetReferences++;
  }
}

const builtHtml = await readFile(path.join(root, 'dist/index.html'), 'utf8');
const generatedEntries = [];
for (const match of builtHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const url = new URL(match[1], `${newOrigin}/`);
  if (url.origin !== newOrigin) continue;
  const decoded = decodeURIComponent(url.pathname).slice(1);
  assert(distFiles.has(decoded), `Broken built HTML dependency: ${url.pathname}`);
  checkedPaths.add(url.pathname);
  if (!publicPaths.has(url.pathname)) generatedEntries.push(url.pathname);
}
assert(generatedEntries.some(file => /\/assets\/[^/]+\.js$/.test(file)), 'Missing generated JS entry');
assert(generatedEntries.some(file => /\/assets\/[^/]+\.css$/.test(file)), 'Missing generated CSS entry');
assert(!builtHtml.includes('/src/main.tsx'), 'Development entry leaked into production HTML');
for (const file of generatedEntries.filter(file => file.endsWith('.js'))) {
  const javascript = await readFile(path.join(root, 'dist', file), 'utf8');
  const map = /sourceMappingURL=([^\s]+)/.exec(javascript)?.[1];
  if (map) assert(distFiles.has(path.posix.join(path.posix.dirname(file.slice(1)), map)), `Missing generated source map for ${file}`);
}

const http = [];
let docsearchRuntime = null;
if (baseUrl) {
  // Fragments stay in the browser; HTTP cannot validate hash route/anchor rendering.
  for (const pathname of checkedPaths) {
    if (pathname === '/CNAME' || pathname === '/assets/.gitkeep') continue;
    const url = new URL(encodedPath(decodeURIComponent(pathname)), baseUrl);
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    const body = Buffer.from(await response.arrayBuffer());
    assert.equal(response.status, 200, `HTTP ${response.status}: ${url}`);
    if (publicPaths.has(decodeURIComponent(pathname))) {
      assert.deepEqual(body, await readFile(path.join(root, 'public', decodeURIComponent(pathname))), `HTTP returned incorrect asset/fallback HTML: ${url}`);
    } else if (pathname === '/') {
      assert.equal(text(body), builtHtml.replace(/\r\n/g, '\n'), `HTTP root differs from this build: ${url}`);
    } else {
      assert.deepEqual(body, await readFile(path.join(root, 'dist', decodeURIComponent(pathname))), `HTTP generated asset differs from this build: ${url}`);
    }
    http.push({ path: url.pathname, status: response.status });
  }

  // Execute the application's actual KB loader/search rather than a duplicate loader.
  // Its root-relative browser fetches may read only this host's manifest/documents.
  const { default: ts } = await import('typescript');
  const source = await readFile(path.join(root, 'src/lib/docsearch.ts'), 'utf8');
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
  });
  assert.equal(diagnostics.filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const { buildIndex, search } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  const allowedKbPaths = new Set(['/kb/manifest.json', ...manifest.map(item => item.url)]);
  const originalFetch = globalThis.fetch;
  const requests = [];
  try {
    globalThis.fetch = async (input, options) => {
      assert.equal(typeof input, 'string', 'KB loader must use root-relative URL strings');
      assert(allowedKbPaths.has(input), `Unexpected KB fetch: ${input}`);
      const url = new URL(encodedPath(decodeURIComponent(input)), baseUrl);
      const response = await originalFetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(15000) });
      requests.push({ path: input, status: response.status });
      return response;
    };
    const index = await buildIndex();
    assert.equal(requests.length, manifest.length + 1, 'Actual KB loader did not request every manifest document');
    assert(requests.every(item => item.status === 200), 'Actual KB loader received a non-200 document');
    assert(index.sections.length > 0 && index.idf.size > 0, 'Actual KB index is empty');
    assert.deepEqual(new Set(index.sections.map(section => section.file)),
      new Set(manifest.map(item => item.url.split('/').pop())), 'Some manifest documents produced no indexed content');
    const hits = search('TOPIK', index);
    assert(hits.length > 0 && hits.every(hit => hit.score > 0 && hit.section.text), 'Actual search returned no usable TOPIK result');
    docsearchRuntime = {
      requests: requests.length, documents: manifest.length,
      sections: index.sections.length, terms: index.idf.size,
      query: 'TOPIK', hits: hits.length,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

console.log(JSON.stringify({
  result: 'PASS', baseline, publicFiles: publicFiles.length, manifestDocuments: manifest.length,
  kbLocalImages: kbImages, sourceAssetReferences, hashRoutes: routeCases(app),
  generatedEntries, httpBase: baseUrl?.origin ?? null, httpChecks: http, docsearchRuntime,
  limitation: 'Static/HTTP checks do not prove DNS, HTTPS, browser hash navigation or live API behavior. Existing #lead/router conflict requires browser review.',
}, null, 2));
