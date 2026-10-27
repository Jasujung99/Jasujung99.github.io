// Run after npm ci: node --test samples/worker/cors.test.mjs
// These tests call local Worker handlers only; no live API, AI, or Notion writes.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, describe, it } from 'node:test';
import ts from 'typescript';
import unifiedWorker from './unified-worker.js';
import subscribeWorker from './worker.js';

const answerSource = await readFile(new URL('./answer-worker.ts', import.meta.url), 'utf8');
const { outputText, diagnostics } = ts.transpileModule(answerSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
assert.equal(diagnostics.filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
const { default: answerWorker } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const oldOrigin = 'https://haeumkorean.me';
const newOrigin = 'https://haeum.haeonkorean.com';
const allowlist = `${oldOrigin},${newOrigin}`;
const blockedOrigins = [
  'https://unrelated.example',
  'https://haeumkorean.me.attacker.example',
  'https://haeum.haeonkorean.com.attacker.example',
  'http://haeum.haeonkorean.com',
  'https://haeum.haeonkorean.com:8443',
];

function request(path, origin, method = 'OPTIONS', body) {
  return new Request(`https://worker.example${path}`, {
    method,
    headers: {
      ...(origin === undefined ? {} : { Origin: origin }),
      ...(method === 'OPTIONS' ? {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      } : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const originalFetch = globalThis.fetch;
before(() => {
  globalThis.fetch = async () => { throw new Error('Live network calls are forbidden in Worker regression tests'); };
});
after(() => { globalThis.fetch = originalFetch; });

const workers = [
  { name: 'answer-worker.ts', worker: answerWorker, path: '/api/answer' },
  { name: 'unified-worker.js answer', worker: unifiedWorker, path: '/api/answer' },
  { name: 'unified-worker.js subscribe', worker: unifiedWorker, path: '/api/subscribe' },
  { name: 'worker.js subscribe', worker: subscribeWorker, path: '/api/subscribe' },
];

for (const { name, worker, path } of workers) {
  describe(name, () => {
    for (const origin of [oldOrigin, newOrigin]) {
      it(`allows preflight and actual responses for ${origin}`, async () => {
        let aiCalls = 0;
        const env = {
          ALLOWED_ORIGIN: allowlist,
          AI: { run: async () => { aiCalls++; return { response: 'local AI stub' }; } },
        };
        const preflight = await worker.fetch(request(path, origin), env);
        assert.equal(preflight.status, 204);
        assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
        assert.match(preflight.headers.get('Access-Control-Allow-Methods'), /POST/);
        assert.match(preflight.headers.get('Access-Control-Allow-Headers'), /Content-Type/i);
        assert.equal(aiCalls, 0, 'preflight must not invoke AI');

        const body = path === '/api/answer'
          ? { question: '문의 방법', context: ['네이버 톡톡으로 문의하세요.'] }
          : { email: 'invalid-email' };
        const response = await worker.fetch(request(path, origin, 'POST', body), env);
        assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
        assert.equal(response.status, path === '/api/answer' ? 200 : 400);
        const result = await response.json();
        if (path === '/api/answer') {
          assert.deepEqual(result, { ok: true, text: 'local AI stub' });
          assert.equal(aiCalls, 1);
        } else {
          assert.equal(result.error, 'invalid_email');
        }
      });
    }

    it('trims comma-separated origin entries and supports a single origin', async () => {
      for (const origin of [oldOrigin, newOrigin]) {
        for (const configured of [` , ${oldOrigin} , , ${newOrigin} , `, origin]) {
          const response = await worker.fetch(request(path, origin), { ALLOWED_ORIGIN: configured });
          assert.equal(response.status, 204);
          assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
        }
      }
    });

    it('blocks unrelated origins, hostname suffixes, different schemes and ports', async () => {
      for (const origin of blockedOrigins) {
        const env = {
          ALLOWED_ORIGIN: allowlist,
          AI: { run: async () => { assert.fail('blocked origins must not invoke AI'); } },
        };
        const preflight = await worker.fetch(request(path, origin), env);
        assert.notEqual(preflight.headers.get('Access-Control-Allow-Origin'), origin);
        assert.notEqual(preflight.headers.get('Access-Control-Allow-Origin'), '*');
        const response = await worker.fetch(request(path, origin, 'POST', {}), env);
        assert.equal(response.status, 403);
        assert.equal((await response.json()).error, 'cors_blocked');
      }
    });
  });
}

describe('answer-worker.ts fails closed', () => {
  it('does not allow missing, empty, whitespace-only or wildcard allowlists', async () => {
    for (const configured of [undefined, '', ' , , ', '*']) {
      for (const origin of [oldOrigin, newOrigin]) {
        for (const method of ['OPTIONS', 'POST']) {
          const response = await answerWorker.fetch(
            request('/api/answer', origin, method, method === 'POST' ? {} : undefined),
            { ALLOWED_ORIGIN: configured },
          );
          assert.equal(response.status, 403);
          assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
        }
      }
    }
  });

  it('rejects missing, opaque and malformed request origins', async () => {
    for (const origin of [undefined, 'null', '*', `${newOrigin}/`, `${oldOrigin},${newOrigin}`]) {
      const response = await answerWorker.fetch(request('/api/answer', origin), { ALLOWED_ORIGIN: allowlist });
      assert.equal(response.status, 403);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
    }
  });

  it('varies both permitted and denied responses by Origin', async () => {
    for (const origin of [oldOrigin, newOrigin, blockedOrigins[0]]) {
      const response = await answerWorker.fetch(request('/api/answer', origin), { ALLOWED_ORIGIN: allowlist });
      assert.equal(response.headers.get('Vary'), 'Origin');
    }
  });
});
