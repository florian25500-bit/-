export const ADMIN_EMAIL = 'florian25500@gmail.com';
export const DEFAULT_ADMIN_PASSCODE = 'Ff0872559580';

const ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a deterministic, immutable public User ID (DS-XXXXXXXX) from a user's UID.
 * Uses dual 32-bit FNV-1a lanes so the same UID always maps to the exact same immutable ID
 * without relying on environment-specific async crypto APIs.
 */
export function generateImmutableUserId(uid: string): string {
  const normalized = (uid || '').trim() || 'anonymous';
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193) >>> 0;

    h2 ^= (ch + (i << 3)) >>> 0;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }

  let suffix = '';
  let state = h1 >>> 0;
  for (let i = 0; i < 4; i++) {
    suffix += ID_ALPHABET[state % ID_ALPHABET.length];
    state = ((state >>> 5) ^ ((h2 >>> (i * 3)) & 0xff)) >>> 0;
  }
  state = (h2 ^ (h1 >>> 7)) >>> 0;
  for (let i = 0; i < 4; i++) {
    suffix += ID_ALPHABET[state % ID_ALPHABET.length];
    state = ((state >>> 5) ^ ((h1 >>> (i * 4)) & 0xff)) >>> 0;
  }

  return `DS-${suffix}`;
}

export function normalizePublicUserId(raw: string): string {
  return (raw || '').trim().toUpperCase();
}

export function isValidPublicUserId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^DS-[A-Z0-9]{8}$/.test(id.trim());
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
