import crypto from 'node:crypto';

export function sha1hex(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

export function shortHash(bufOrHex, len = 12) {
  if (typeof bufOrHex === 'string' && /^[0-9a-f]+$/i.test(bufOrHex)) {
    return bufOrHex.slice(0, len);
  }
  const hex = sha1hex(bufOrHex);
  return hex.slice(0, len);
}
