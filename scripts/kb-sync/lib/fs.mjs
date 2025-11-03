import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

export async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

export async function readJSON(p, fallback = null) {
  try {
    const raw = await fs.readFile(p, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function writeJSON(p, data) {
  const dir = path.dirname(p);
  await ensureDir(dir);
  const text = JSON.stringify(data, null, 2);
  await fs.writeFile(p, text + '\n', 'utf-8');
}

export async function writeFile(p, data) {
  const dir = path.dirname(p);
  await ensureDir(dir);
  await fs.writeFile(p, data);
}

export async function readFile(p) {
  return fs.readFile(p, 'utf-8');
}

export function resolveRoot(...args) {
  return path.resolve(process.cwd(), ...args);
}
