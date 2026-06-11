export const AUTH_COOKIE_NAME = 'paws-session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

const toBase64Url = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};

const digest = async (value: string) => {
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return toBase64Url(buffer);
};

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');

export const createSalt = () => crypto.randomUUID().replaceAll('-', '');

export const hashPassword = async (password: string, salt: string) => digest(`${salt}:${password}`);

export const verifyPassword = async (password: string, salt: string, passwordHash: string) => {
  const candidate = await hashPassword(password, salt);
  return candidate === passwordHash;
};

export const createSessionToken = () => crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');

export const hashSessionToken = async (token: string) => digest(token);

export const sessionExpiresAt = (ttlSeconds = SESSION_TTL_SECONDS) => new Date(Date.now() + ttlSeconds * 1000).toISOString();

export const createTemporaryPassword = () => crypto.randomUUID().replaceAll('-', '').slice(0, 12);

export type PublicMember = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mustChangePassword: boolean;
};

export const toPublicMember = (member: {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  must_change_password?: number | boolean | null;
}): PublicMember => ({
  id: member.id,
  email: member.email,
  name: member.name,
  createdAt: member.created_at,
  updatedAt: member.updated_at,
  mustChangePassword: Boolean(member.must_change_password),
});
