import { hashSessionToken, toPublicMember, type PublicMember } from './auth';

type MemberRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  password_salt: string;
  must_change_password: number;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  member_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
};

export const getMemberByEmail = async (db: D1Database | undefined, email: string) => {
  if (!db || !email) return null;

  const result = await db
    .prepare(
      `
      SELECT
        id,
        email,
        name,
        password_hash,
        password_salt,
        must_change_password,
        created_at,
        updated_at
      FROM members
      WHERE email = ?
      LIMIT 1
      `,
    )
    .bind(email)
    .first<MemberRow>();

  return result ?? null;
};

export const getMemberById = async (db: D1Database | undefined, memberId: string) => {
  if (!db || !memberId) return null;

  const result = await db
    .prepare(
      `
      SELECT
        id,
        email,
        name,
        password_hash,
        password_salt,
        must_change_password,
        created_at,
        updated_at
      FROM members
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(memberId)
    .first<MemberRow>();

  return result ?? null;
};

export const createMember = async (db: D1Database | undefined, input: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  mustChangePassword?: boolean;
}) => {
  if (!db) return null;

  await db
    .prepare(
      `
      INSERT INTO members (
        id,
        email,
        name,
        password_hash,
        password_salt,
        must_change_password
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(input.id, input.email, input.name, input.passwordHash, input.passwordSalt, input.mustChangePassword === false ? 0 : 1)
    .run();

  return getMemberById(db, input.id);
};

export const createMemberSession = async (db: D1Database | undefined, input: {
  id: string;
  memberId: string;
  token: string;
  expiresAt: string;
}) => {
  if (!db) return null;

  const tokenHash = await hashSessionToken(input.token);

  await db
    .prepare(
      `
      INSERT INTO member_sessions (
        id,
        member_id,
        token_hash,
        expires_at
      ) VALUES (?, ?, ?, ?)
      `,
    )
    .bind(input.id, input.memberId, tokenHash, input.expiresAt)
    .run();

  return {
    id: input.id,
    memberId: input.memberId,
    tokenHash,
    expiresAt: input.expiresAt,
  };
};

export const getSessionMember = async (db: D1Database | undefined, token: string) => {
  if (!db || !token) return null;

  const tokenHash = await hashSessionToken(token);
  const session = await db
    .prepare(
      `
      SELECT
        member_sessions.id,
        member_sessions.member_id,
        member_sessions.token_hash,
        member_sessions.expires_at,
        member_sessions.revoked_at,
        members.must_change_password,
        members.email,
        members.name,
        members.created_at,
        members.updated_at
      FROM member_sessions
      INNER JOIN members ON members.id = member_sessions.member_id
      WHERE member_sessions.token_hash = ?
      LIMIT 1
      `,
    )
    .bind(tokenHash)
    .first<SessionRow & {
      must_change_password: number;
      email: string;
      name: string;
      created_at: string;
      updated_at: string;
    }>();

  if (!session || session.revoked_at) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) return null;

  await db
    .prepare(
      `
      UPDATE member_sessions
      SET last_seen_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
    .bind(session.id)
    .run();

  return toPublicMember({
    id: session.member_id,
    email: session.email,
    name: session.name,
    created_at: session.created_at,
    updated_at: session.updated_at,
    must_change_password: session.must_change_password,
  });
};

export const updateMemberPassword = async (db: D1Database | undefined, input: {
  memberId: string;
  passwordHash: string;
  passwordSalt: string;
}) => {
  if (!db) return null;

  await db
    .prepare(
      `
      UPDATE members
      SET
        password_hash = ?,
        password_salt = ?,
        must_change_password = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
    .bind(input.passwordHash, input.passwordSalt, input.memberId)
    .run();

  return getMemberById(db, input.memberId);
};

export const revokeSession = async (db: D1Database | undefined, token: string) => {
  if (!db || !token) return;

  const tokenHash = await hashSessionToken(token);
  await db
    .prepare(
      `
      UPDATE member_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = ?
      `,
    )
    .bind(tokenHash)
    .run();
};

export const serializeMember = (member: PublicMember) => member;
