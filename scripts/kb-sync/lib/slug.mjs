import { unicodeNormalize } from './text.mjs';

const DEFAULT_MAX = 60;

export function slugify(input, maxLen = DEFAULT_MAX) {
  const n = unicodeNormalize(String(input))
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-가-힣_]+/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
  const sliced = n.slice(0, maxLen);
  return sliced || 'post';
}