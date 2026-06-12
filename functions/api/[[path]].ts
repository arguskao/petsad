import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { handle } from 'hono/cloudflare-pages';

import {
  AUTH_COOKIE_NAME,
  createSalt,
  createTemporaryPassword,
  createSessionToken,
  hashPassword,
  normalizeEmail,
  normalizeName,
  sessionExpiresAt,
  type PublicMember,
  verifyPassword,
} from '../../src/lib/auth';
import { assertRegistrationEmailConfig, sendRegistrationEmail } from '../../src/lib/email';
import { createMember, createMemberSession, getMemberByEmail, getMemberById, getSessionMember, revokeSession, updateMemberPassword } from '../../src/lib/members-db';
import { createPetApiPayload, findPetById } from '../../src/lib/pets';
import { getFavoritePetIdsFromDatabase, getFavoritesFromDatabase } from '../../src/lib/favorites-db';
import {
  getAdoptionGuideSectionByIdFromDatabase,
  getAdoptionGuideSectionsFromDatabase,
  getFaqsFromDatabase,
  getPageCopyByIdFromDatabase,
  getPageCopiesFromDatabase,
  getSheltersFromDatabase as getContentSheltersFromDatabase,
  getStoriesFromDatabase,
  updateAdoptionGuideSectionInDatabase,
  updatePageCopyInDatabase,
} from '../../src/lib/content-db';
import { isAdoptionRequestStatus } from '../../src/lib/adoption-status';
import { getShelterByIdFromDatabase, updateShelterInDatabase } from '../../src/lib/shelters-db';
import { getPetByIdFromDatabase, getPetsFromDatabase } from '../../src/lib/paws-db';

type ApiEnv = {
  paws?: D1Database;
  ASSETS?: Fetcher;
  paws_pet_images?: R2Bucket;
  MAIL_FROM_ADDRESS?: string;
  MAIL_FROM_NAME?: string;
  MAILCHANNELS_API_KEY?: string;
  MAILCHANNELS_ENDPOINT?: string;
};

type AnalyticsDetail = Record<string, unknown>;

const parseLimit = (value: string | null | undefined, fallback = 10, max = 20) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
};

const parseTagsJson = (value: string | null | undefined) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const slugifyPetId = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

const ensureUniquePetId = async (db: D1Database, baseId: string) => {
  const normalizedBase = slugifyPetId(baseId) || `pet-${crypto.randomUUID().slice(0, 8)}`;
  let candidate = normalizedBase;
  let suffix = 2;

  while (true) {
    const existing = await db
      .prepare(
        `
        SELECT id
        FROM pets
        WHERE id = ?
        LIMIT 1
        `,
      )
      .bind(candidate)
      .first<{ id: string }>();

    if (!existing) return candidate;

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
};

const normalizeOptionalUrl = (value: unknown) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!/^(https?:\/\/|\/)/i.test(trimmed)) return '';
  return trimmed;
};

const parseAnalyticsDetail = (value: string | null | undefined) => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const stringifyAnalyticsDetail = (value: AnalyticsDetail) => JSON.stringify(value);

const petImageContentTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
]);

const buildPetImageKey = (contentType: string) => {
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  const extension = petImageContentTypes.get(normalizedType);

  if (!extension) {
    return '';
  }

  return `pet-image-${crypto.randomUUID().replace(/-/g, '')}.${extension}`;
};

const buildPetImageUrl = (key: string) => `/api/pet-images/${encodeURIComponent(key)}`;

const isSecureRequest = (url: string) => new URL(url).protocol === 'https:';
const isLocalOrigin = (origin: string | null) =>
  origin === 'http://localhost:4321' || origin === 'http://127.0.0.1:4321';

type FavoriteOwner =
  | {
      kind: 'member';
      ownerId: string;
      member: PublicMember;
    }
  | {
      kind: 'anonymous';
      ownerId: string;
      clientId: string;
    };

const getFavoriteOwner = async (c: any, fallbackClientId = '') => {
  const token = getCookie(c, AUTH_COOKIE_NAME) || '';
  const member = await getSessionMember(c.env.paws, token);

  if (member) {
    return {
      kind: 'member',
      ownerId: member.id,
      member,
    } satisfies FavoriteOwner;
  }

  const clientId = fallbackClientId.trim();
  if (!clientId) {
    return null;
  }

  return {
    kind: 'anonymous',
    ownerId: clientId,
    clientId,
  } satisfies FavoriteOwner;
};

const app = new Hono<{ Bindings: ApiEnv }>().basePath('/api');

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');

  if (origin && isLocalOrigin(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
    c.header('Vary', 'Origin');
  }

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
});

app.get('/', (c) =>
  c.json({
    name: 'PawsHome API',
    version: '1.2.0',
    dataSource: 'Cloudflare D1 paws',
    endpoints: [
      'GET /api/auth/me',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/pets',
      'GET /api/pets/:id',
      'GET /api/stories',
      'GET /api/faqs',
      'GET /api/shelters',
      'GET /api/adoption-guide',
      'GET /api/site-copies',
      'GET /api/favorites',
      'POST /api/favorites/merge',
      'POST /api/analytics/events',
      'GET /api/admin/summary',
      'GET /api/admin/adoptions',
      'GET /api/admin/adoptions/:id',
      'GET /api/admin/pets',
      'GET /api/admin/pets/:id',
      'POST /api/admin/pet-images',
      'GET /api/pet-images/:key',
      'PATCH /api/admin/pets/:id',
      'GET /api/admin/stories',
      'GET /api/admin/stories/:id',
      'PATCH /api/admin/stories/:id',
      'GET /api/admin/faqs',
      'GET /api/admin/faqs/:id',
      'PATCH /api/admin/faqs/:id',
      'GET /api/admin/adoption-guide',
      'GET /api/admin/adoption-guide/:id',
      'PATCH /api/admin/adoption-guide/:id',
      'GET /api/admin/site-copies',
      'GET /api/admin/site-copies/:id',
      'PATCH /api/admin/site-copies/:id',
      'GET /api/admin/analytics',
      'GET /api/admin/shelters',
      'PATCH /api/admin/shelters/:id',
      'GET /api/admin/favorites',
      'PATCH /api/admin/adoptions/:id',
      'POST /api/adoptions',
      'POST /api/favorites',
      'DELETE /api/favorites',
    ],
  }),
);

app.get('/auth/me', async (c) => {
  const token = getCookie(c, AUTH_COOKIE_NAME) || '';
  const member = await getSessionMember(c.env.paws, token);

  if (!member) {
    return c.json({ ok: false, message: '尚未登入。' }, 401);
  }

  return c.json({
    ok: true,
    member,
  });
});

app.post('/auth/register', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const body = await c.req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const name = typeof body?.name === 'string' ? normalizeName(body.name) : '';

  if (!email || !name) {
    return c.json({ ok: false, message: 'name、email 為必填欄位。' }, 400);
  }

  if (name.length < 2) {
    return c.json({ ok: false, message: '姓名至少需要 2 個字元。' }, 400);
  }

  try {
    assertRegistrationEmailConfig({
      to: email,
      name,
      temporaryPassword: 'placeholder',
      loginUrl: new URL('/auth/login', c.req.url).toString(),
      fromEmail: c.env.MAIL_FROM_ADDRESS,
      fromName: c.env.MAIL_FROM_NAME,
      mailChannelsApiKey: c.env.MAILCHANNELS_API_KEY,
      mailChannelsEndpoint: c.env.MAILCHANNELS_ENDPOINT,
    });
  } catch (error) {
    return c.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : '會員寄信設定尚未完成。',
      },
      503,
    );
  }

  const existing = await getMemberByEmail(db, email);
  if (existing) {
    return c.json({ ok: false, message: '這個 Email 已經註冊過了。' }, 409);
  }

  const memberId = crypto.randomUUID();
  const temporaryPassword = createTemporaryPassword();
  const passwordSalt = createSalt();
  const passwordHash = await hashPassword(temporaryPassword, passwordSalt);
  const member = await createMember(db, {
    id: memberId,
    email,
    name,
    passwordHash,
    passwordSalt,
    mustChangePassword: true,
  });

  if (!member) {
    return c.json({ ok: false, message: '建立會員失敗。' }, 500);
  }

  const loginUrl = new URL('/auth/login', c.req.url).toString();

  try {
    await sendRegistrationEmail({
      to: email,
      name,
      temporaryPassword,
      loginUrl,
      fromEmail: c.env.MAIL_FROM_ADDRESS,
      fromName: c.env.MAIL_FROM_NAME,
      mailChannelsApiKey: c.env.MAILCHANNELS_API_KEY,
      mailChannelsEndpoint: c.env.MAILCHANNELS_ENDPOINT,
    });
  } catch (error) {
    await db
      .prepare(
        `
        DELETE FROM members
        WHERE id = ?
        `,
      )
      .bind(memberId)
      .run();

    return c.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : '寄信失敗，請稍後再試。',
      },
      502,
    );
  }

  return c.json({
    ok: true,
    message: '註冊完成，請到 Email 收取密碼。',
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      mustChangePassword: true,
    },
  }, 201);
});

app.post('/auth/login', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const body = await c.req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return c.json({ ok: false, message: 'email 與 password 為必填欄位。' }, 400);
  }

  const member = await getMemberByEmail(db, email);
  if (!member) {
    return c.json({ ok: false, message: '帳號或密碼錯誤。' }, 401);
  }

  const isValid = await verifyPassword(password, member.password_salt, member.password_hash);
  if (!isValid) {
    return c.json({ ok: false, message: '帳號或密碼錯誤。' }, 401);
  }

  const token = createSessionToken();
  await createMemberSession(db, {
    id: crypto.randomUUID(),
    memberId: member.id,
    token,
    expiresAt: sessionExpiresAt(),
  });

  setCookie(c, AUTH_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureRequest(c.req.url),
    maxAge: 60 * 60 * 24 * 30,
  });

  return c.json({
    ok: true,
    message: '登入成功。',
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      mustChangePassword: Boolean(member.must_change_password),
    },
  });
});

app.patch('/auth/password', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const token = getCookie(c, AUTH_COOKIE_NAME) || '';
  const member = await getSessionMember(db, token);

  if (!member) {
    return c.json({ ok: false, message: '尚未登入。' }, 401);
  }

  const body = await c.req.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const nextPassword = typeof body?.nextPassword === 'string' ? body.nextPassword : '';

  if (!currentPassword || !nextPassword) {
    return c.json({ ok: false, message: 'currentPassword 與 nextPassword 為必填欄位。' }, 400);
  }

  if (nextPassword.length < 8) {
    return c.json({ ok: false, message: '新密碼至少需要 8 個字元。' }, 400);
  }

  const memberRecord = await getMemberById(db, member.id);
  if (!memberRecord) {
    return c.json({ ok: false, message: '找不到會員資料。' }, 404);
  }

  const currentValid = await verifyPassword(currentPassword, memberRecord.password_salt, memberRecord.password_hash);
  if (!currentValid) {
    return c.json({ ok: false, message: '目前密碼不正確。' }, 401);
  }

  const nextSalt = createSalt();
  const nextHash = await hashPassword(nextPassword, nextSalt);
  const updated = await updateMemberPassword(db, {
    memberId: member.id,
    passwordHash: nextHash,
    passwordSalt: nextSalt,
  });

  return c.json({
    ok: true,
    message: '密碼已更新。',
    member: updated
      ? {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
          mustChangePassword: false,
        }
      : member,
  });
});

app.post('/auth/logout', async (c) => {
  const db = c.env.paws;
  const token = getCookie(c, AUTH_COOKIE_NAME) || '';

  if (db && token) {
    await revokeSession(db, token);
  }

  deleteCookie(c, AUTH_COOKIE_NAME, { path: '/' });

  return c.json({
    ok: true,
    message: '已登出。',
  });
});

app.get('/pets', async (c) => {
  const pets = await getPetsFromDatabase(c.env.paws);
  const payload = createPetApiPayload(pets, {
    type: c.req.query('type'),
    age: c.req.query('age'),
    size: c.req.query('size'),
    area: c.req.query('area'),
  });

  return c.json(payload);
});

app.get('/pets/:id', async (c) => {
  const id = c.req.param('id');
  const pet = (await getPetByIdFromDatabase(c.env.paws, id)) ?? findPetById(id);

  if (!pet) {
    return c.json({ error: 'Pet not found' }, 404);
  }

  if (pet.status && pet.status !== 'available') {
    return c.json({ error: 'Pet not available' }, 404);
  }

  return c.json({ pet });
});

app.get('/stories', async (c) => {
  const stories = await getStoriesFromDatabase(c.env.paws);
  return c.json({
    total: stories.length,
    results: stories,
  });
});

app.get('/faqs', async (c) => {
  const faqs = await getFaqsFromDatabase(c.env.paws);
  return c.json({
    total: faqs.length,
    results: faqs,
  });
});

app.get('/shelters', async (c) => {
  const shelters = await getContentSheltersFromDatabase(c.env.paws);
  return c.json({
    total: shelters.length,
    results: shelters,
  });
});

app.get('/adoption-guide', async (c) => {
  const sections = await getAdoptionGuideSectionsFromDatabase(c.env.paws);

  return c.json({
    total: sections.length,
    results: sections,
  });
});

app.get('/site-copies', async (c) => {
  const pageKey = c.req.query('pageKey')?.trim() || '';
  const copies = await getPageCopiesFromDatabase(c.env.paws, pageKey || undefined);

  return c.json({
    total: copies.length,
    results: copies,
  });
});

app.post('/analytics/events', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const body = await c.req.json().catch(() => null);
  const eventType = typeof body?.eventType === 'string' ? body.eventType.trim() : '';
  const pagePath = typeof body?.pagePath === 'string' ? body.pagePath.trim() : '';
  const status = typeof body?.status === 'string' ? body.status.trim() : '';
  const source = typeof body?.source === 'string' ? body.source.trim() : '';
  const detail = body?.detail && typeof body.detail === 'object' ? (body.detail as AnalyticsDetail) : {};

  if (!eventType || !pagePath) {
    return c.json({ ok: false, message: 'eventType 與 pagePath 為必填欄位。' }, 400);
  }

  await db
    .prepare(
      `
      INSERT INTO analytics_events (
        id,
        event_type,
        page_path,
        status,
        source,
        detail_json
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      crypto.randomUUID(),
      eventType,
      pagePath,
      status || null,
      source || null,
      stringifyAnalyticsDetail(detail),
    )
    .run();

  return c.json({
    ok: true,
    message: '事件已記錄。',
  }, 201);
});

app.get('/favorites', async (c) => {
  const owner = await getFavoriteOwner(c, c.req.query('clientId') ?? '');
  const favorites = await getFavoritesFromDatabase(c.env.paws, owner?.ownerId ?? '');

  return c.json({
    scope: owner?.kind ?? 'anonymous',
    total: favorites.length,
    results: favorites,
  });
});

app.post('/favorites/merge', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const token = getCookie(c, AUTH_COOKIE_NAME) || '';
  const member = await getSessionMember(db, token);

  if (!member) {
    return c.json({ ok: false, message: '尚未登入。' }, 401);
  }

  const body = await c.req.json().catch(() => null);
  const clientId = typeof body?.clientId === 'string' ? body.clientId.trim() : '';

  if (!clientId || clientId === member.id) {
    return c.json({
      ok: true,
      message: '沒有需要合併的匿名收藏。',
      mergedCount: 0,
      total: (await getFavoritesFromDatabase(db, member.id)).length,
    });
  }

  const anonymousPetIds = await getFavoritePetIdsFromDatabase(db, clientId);
  if (!anonymousPetIds.length) {
    return c.json({
      ok: true,
      message: '沒有需要合併的匿名收藏。',
      mergedCount: 0,
      total: (await getFavoritesFromDatabase(db, member.id)).length,
    });
  }

  const memberPetIds = new Set(await getFavoritePetIdsFromDatabase(db, member.id));
  let mergedCount = 0;

  for (const petId of anonymousPetIds) {
    if (memberPetIds.has(petId)) continue;

    await db
      .prepare(
        `
        INSERT INTO favorites (
          id,
          pet_id,
          user_id
        ) VALUES (?, ?, ?)
        `,
      )
      .bind(crypto.randomUUID(), petId, member.id)
      .run();

    memberPetIds.add(petId);
    mergedCount += 1;
  }

  await db
    .prepare(
      `
      DELETE FROM favorites
      WHERE user_id = ?
      `,
    )
    .bind(clientId)
    .run();

  return c.json({
    ok: true,
    message: mergedCount > 0 ? '匿名收藏已合併到會員帳號。' : '沒有可合併的匿名收藏。',
    mergedCount,
    total: memberPetIds.size,
  });
});

app.get('/admin/summary', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const summary = await db
    .prepare(
      `
      SELECT
        (SELECT COUNT(*) FROM pets) AS total_pets,
        (SELECT COUNT(*) FROM stories) AS total_stories,
        (SELECT COUNT(*) FROM faqs) AS total_faqs,
        (SELECT COUNT(*) FROM shelters) AS total_shelters,
        (SELECT COUNT(*) FROM adoption_requests) AS total_adoptions,
        (SELECT COUNT(*) FROM adoption_requests WHERE status = 'pending') AS pending_adoptions,
        (SELECT COUNT(*) FROM favorites) AS total_favorites,
        (SELECT COUNT(DISTINCT user_id) FROM favorites) AS favorite_users
      `,
    )
    .first<{
      total_pets: number;
      total_stories: number;
      total_faqs: number;
      total_shelters: number;
      total_adoptions: number;
      pending_adoptions: number;
      total_favorites: number;
      favorite_users: number;
    }>();

  return c.json({
    ok: true,
    summary: {
      totalPets: summary?.total_pets ?? 0,
      totalStories: summary?.total_stories ?? 0,
      totalFaqs: summary?.total_faqs ?? 0,
      totalShelters: summary?.total_shelters ?? 0,
      totalAdoptions: summary?.total_adoptions ?? 0,
      pendingAdoptions: summary?.pending_adoptions ?? 0,
      totalFavorites: summary?.total_favorites ?? 0,
      favoriteUsers: summary?.favorite_users ?? 0,
    },
  });
});

app.get('/admin/shelters', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const shelters = await getContentSheltersFromDatabase(db);

  return c.json({
    ok: true,
    total: shelters.length,
    results: shelters,
  });
});

app.get('/admin/stories', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const stories = await getStoriesFromDatabase(db);

  return c.json({
    ok: true,
    total: stories.length,
    results: stories,
  });
});

app.get('/admin/stories/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();

  if (!id) {
    return c.json({ ok: false, message: '成功故事 ID 為必填欄位。' }, 400);
  }

  const story = await db
    .prepare(
      `
      SELECT
        id,
        title,
        quote,
        author,
        date,
        avatar,
        emoji,
        sort_order
      FROM stories
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{
      id: string;
      title: string;
      quote: string;
      author: string;
      date: string;
      avatar: string;
      emoji: string;
      sort_order: number;
    }>();

  if (!story) {
    return c.json({ ok: false, message: '找不到指定的成功故事。' }, 404);
  }

  return c.json({
    ok: true,
    story: {
      id: story.id,
      title: story.title,
      quote: story.quote,
      author: story.author,
      date: story.date,
      avatar: story.avatar,
      emoji: story.emoji,
      sortOrder: story.sort_order,
    },
  });
});

app.patch('/admin/stories/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();
  const body = await c.req.json().catch(() => null);

  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const quote = typeof body?.quote === 'string' ? body.quote.trim() : '';
  const author = typeof body?.author === 'string' ? body.author.trim() : '';
  const date = typeof body?.date === 'string' ? body.date.trim() : '';
  const avatar = typeof body?.avatar === 'string' ? body.avatar.trim() : '';
  const emoji = typeof body?.emoji === 'string' ? body.emoji.trim() : '';
  const sortOrder = Number(body?.sortOrder);

  if (!id) {
    return c.json({ ok: false, message: '成功故事 ID 為必填欄位。' }, 400);
  }

  if (!title || !quote || !author || !date || !avatar || !emoji || !Number.isFinite(sortOrder)) {
    return c.json({ ok: false, message: '請確認成功故事欄位皆已填寫。' }, 400);
  }

  const existing = await db
    .prepare(
      `
      SELECT id
      FROM stories
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ ok: false, message: '找不到指定的成功故事。' }, 404);
  }

  await db
    .prepare(
      `
      UPDATE stories
      SET
        title = ?,
        quote = ?,
        author = ?,
        date = ?,
        avatar = ?,
        emoji = ?,
        sort_order = ?
      WHERE id = ?
      `,
    )
    .bind(title, quote, author, date, avatar, emoji, Math.floor(sortOrder), id)
    .run();

  return c.json({
    ok: true,
    message: '成功故事已更新。',
    story: {
      id,
      title,
      quote,
      author,
      date,
      avatar,
      emoji,
      sortOrder: Math.floor(sortOrder),
    },
  });
});

app.get('/admin/faqs', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const faqs = await getFaqsFromDatabase(db);

  return c.json({
    ok: true,
    total: faqs.length,
    results: faqs,
  });
});

app.get('/admin/faqs/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();

  if (!id) {
    return c.json({ ok: false, message: 'FAQ ID 為必填欄位。' }, 400);
  }

  const faq = await db
    .prepare(
      `
      SELECT
        id,
        category,
        question,
        answer,
        sort_order
      FROM faqs
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{
      id: string;
      category: string;
      question: string;
      answer: string;
      sort_order: number;
    }>();

  if (!faq) {
    return c.json({ ok: false, message: '找不到指定的 FAQ。' }, 404);
  }

  return c.json({
    ok: true,
    faq: {
      id: faq.id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sort_order,
    },
  });
});

app.patch('/admin/faqs/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();
  const body = await c.req.json().catch(() => null);

  const category = typeof body?.category === 'string' ? body.category.trim() : '';
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const answer = typeof body?.answer === 'string' ? body.answer.trim() : '';
  const sortOrder = Number(body?.sortOrder);

  if (!id) {
    return c.json({ ok: false, message: 'FAQ ID 為必填欄位。' }, 400);
  }

  if (!category || !question || !answer || !Number.isFinite(sortOrder)) {
    return c.json({ ok: false, message: '請確認 FAQ 欄位皆已填寫。' }, 400);
  }

  const existing = await db
    .prepare(
      `
      SELECT id
      FROM faqs
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ ok: false, message: '找不到指定的 FAQ。' }, 404);
  }

  await db
    .prepare(
      `
      UPDATE faqs
      SET
        category = ?,
        question = ?,
        answer = ?,
        sort_order = ?
      WHERE id = ?
      `,
    )
    .bind(category, question, answer, Math.floor(sortOrder), id)
    .run();

  return c.json({
    ok: true,
    message: 'FAQ 已更新。',
    faq: {
      id,
      category,
      question,
      answer,
      sortOrder: Math.floor(sortOrder),
    },
  });
});

app.get('/admin/adoption-guide', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const sections = await getAdoptionGuideSectionsFromDatabase(db);

  return c.json({
    ok: true,
    total: sections.length,
    results: sections,
  });
});

app.get('/admin/adoption-guide/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();

  if (!id) {
    return c.json({ ok: false, message: '領養須知 ID 為必填欄位。' }, 400);
  }

  const section = await getAdoptionGuideSectionByIdFromDatabase(db, id);

  if (!section) {
    return c.json({ ok: false, message: '找不到指定的領養須知。' }, 404);
  }

  return c.json({
    ok: true,
    section: {
      id: section.id,
      title: section.title,
      highlight: section.highlight,
      body: section.body,
      sortOrder: section.sortOrder ?? 0,
    },
  });
});

app.patch('/admin/adoption-guide/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();
  const body = await c.req.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const highlight = typeof body?.highlight === 'string' ? body.highlight.trim() : '';
  const text = typeof body?.body === 'string' ? body.body.trim() : '';
  const sortOrder = Number(body?.sortOrder);

  if (!id) {
    return c.json({ ok: false, message: '領養須知 ID 為必填欄位。' }, 400);
  }

  if (!title || !highlight || !text || !Number.isFinite(sortOrder)) {
    return c.json({ ok: false, message: '請確認領養須知欄位皆已填寫。' }, 400);
  }

  const existing = await getAdoptionGuideSectionByIdFromDatabase(db, id);
  if (!existing) {
    return c.json({ ok: false, message: '找不到指定的領養須知。' }, 404);
  }

  const updated = await updateAdoptionGuideSectionInDatabase(db, {
    id,
    title,
    highlight,
    body: text,
    sortOrder,
  });

  return c.json({
    ok: true,
    message: '領養須知已更新。',
    section: updated,
  });
});

app.get('/admin/site-copies', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const pageKey = c.req.query('pageKey')?.trim() || '';
  const copies = await getPageCopiesFromDatabase(db, pageKey || undefined);

  return c.json({
    ok: true,
    total: copies.length,
    results: copies,
  });
});

app.get('/admin/site-copies/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();

  if (!id) {
    return c.json({ ok: false, message: '頁面文案 ID 為必填欄位。' }, 400);
  }

  const copy = await getPageCopyByIdFromDatabase(db, id);

  if (!copy) {
    return c.json({ ok: false, message: '找不到指定的頁面文案。' }, 404);
  }

  return c.json({
    ok: true,
    copy: {
      id: copy.id,
      pageKey: copy.pageKey,
      fieldKey: copy.fieldKey,
      label: copy.label,
      value: copy.value,
      sortOrder: copy.sortOrder ?? 0,
    },
  });
});

app.patch('/admin/site-copies/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();
  const body = await c.req.json().catch(() => null);
  const pageKey = typeof body?.pageKey === 'string' ? body.pageKey.trim() : '';
  const fieldKey = typeof body?.fieldKey === 'string' ? body.fieldKey.trim() : '';
  const label = typeof body?.label === 'string' ? body.label.trim() : '';
  const value = typeof body?.value === 'string' ? body.value.trim() : '';
  const sortOrder = Number(body?.sortOrder);

  if (!id) {
    return c.json({ ok: false, message: '頁面文案 ID 為必填欄位。' }, 400);
  }

  if (!pageKey || !fieldKey || !label || !value || !Number.isFinite(sortOrder)) {
    return c.json({ ok: false, message: '請確認頁面文案欄位皆已填寫。' }, 400);
  }

  const existing = await getPageCopyByIdFromDatabase(db, id);
  if (!existing) {
    return c.json({ ok: false, message: '找不到指定的頁面文案。' }, 404);
  }

  const updated = await updatePageCopyInDatabase(db, {
    id,
    pageKey,
    fieldKey,
    label,
    value,
    sortOrder,
  });

  return c.json({
    ok: true,
    message: '頁面文案已更新。',
    copy: updated,
  });
});

app.get('/admin/analytics', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const summary = await db
    .prepare(
      `
      SELECT
        COUNT(*) AS total_events,
        SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
        SUM(CASE WHEN event_type = 'error' THEN 1 ELSE 0 END) AS error_events,
        SUM(CASE WHEN event_type = 'form_submit' AND source = 'adoption' AND status = 'started' THEN 1 ELSE 0 END) AS adoption_form_starts,
        SUM(CASE WHEN event_type = 'form_submit' AND source = 'adoption' AND status = 'success' THEN 1 ELSE 0 END) AS adoption_form_successes,
        SUM(CASE WHEN event_type = 'form_submit' AND source = 'adoption' AND status = 'error' THEN 1 ELSE 0 END) AS adoption_form_failures
      FROM analytics_events
      `,
    )
    .first<{
      total_events: number;
      page_views: number;
      error_events: number;
      adoption_form_starts: number;
      adoption_form_successes: number;
      adoption_form_failures: number;
    }>();

  const topPages = await db
    .prepare(
      `
      SELECT
        page_path,
        COUNT(*) AS views
      FROM analytics_events
      WHERE event_type = 'page_view'
      GROUP BY page_path
      ORDER BY views DESC, page_path ASC
      LIMIT 8
      `,
    )
    .all<{
      page_path: string;
      views: number;
    }>();

  const recentErrors = await db
    .prepare(
      `
      SELECT
        id,
        page_path,
        status,
        source,
        detail_json,
        created_at
      FROM analytics_events
      WHERE event_type = 'error'
      ORDER BY created_at DESC
      LIMIT 8
      `,
    )
    .all<{
      id: string;
      page_path: string;
      status: string | null;
      source: string | null;
      detail_json: string | null;
      created_at: string;
    }>();

  const recentFormEvents = await db
    .prepare(
      `
      SELECT
        id,
        page_path,
        status,
        source,
        detail_json,
        created_at
      FROM analytics_events
      WHERE event_type = 'form_submit'
      ORDER BY created_at DESC
      LIMIT 8
      `,
    )
    .all<{
      id: string;
      page_path: string;
      status: string | null;
      source: string | null;
      detail_json: string | null;
      created_at: string;
    }>();

  const started = Number(summary?.adoption_form_starts ?? 0);
  const successes = Number(summary?.adoption_form_successes ?? 0);
  const successRate = started > 0 ? Math.round((successes / started) * 1000) / 10 : 0;

  return c.json({
    ok: true,
    summary: {
      totalEvents: Number(summary?.total_events ?? 0),
      pageViews: Number(summary?.page_views ?? 0),
      errorEvents: Number(summary?.error_events ?? 0),
      adoptionFormStarts: started,
      adoptionFormSuccesses: successes,
      adoptionFormFailures: Number(summary?.adoption_form_failures ?? 0),
      adoptionFormSuccessRate: successRate,
    },
    topPages: topPages.results.map((row) => ({
      pagePath: row.page_path,
      views: Number(row.views ?? 0),
    })),
    recentErrors: recentErrors.results.map((row) => {
      const detail = parseAnalyticsDetail(row.detail_json);
      return {
        id: row.id,
        pagePath: row.page_path,
        status: row.status || '',
        source: row.source || '',
        message: typeof detail.message === 'string' ? detail.message : '',
        stack: typeof detail.stack === 'string' ? detail.stack : '',
        createdAt: row.created_at,
      };
    }),
    recentFormEvents: recentFormEvents.results.map((row) => {
      const detail = parseAnalyticsDetail(row.detail_json);
      return {
        id: row.id,
        pagePath: row.page_path,
        status: row.status || '',
        source: row.source || '',
        message: typeof detail.message === 'string' ? detail.message : '',
        createdAt: row.created_at,
      };
    }),
  });
});

app.get('/admin/adoptions', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const limit = parseLimit(c.req.query('limit'), 10, 20);
  const result = await db
    .prepare(
      `
      SELECT
        adoption_requests.id,
        adoption_requests.pet_id,
        adoption_requests.full_name,
        adoption_requests.email,
        adoption_requests.phone,
        adoption_requests.note,
        adoption_requests.status,
        adoption_requests.created_at,
        adoption_requests.updated_at,
        pets.name AS pet_name,
        pets.emoji AS pet_emoji,
        pets.location AS pet_location
      FROM adoption_requests
      LEFT JOIN pets ON pets.id = adoption_requests.pet_id
      ORDER BY adoption_requests.created_at DESC
      LIMIT ?
      `,
    )
    .bind(limit)
    .all<{
      id: string;
      pet_id: string;
      full_name: string;
      email: string;
      phone: string;
      note: string | null;
      status: string;
      created_at: string;
      updated_at: string;
      pet_name: string | null;
      pet_emoji: string | null;
      pet_location: string | null;
    }>();

  return c.json({
    ok: true,
    total: result.results.length,
    results: result.results.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      petName: row.pet_name ?? '未知毛孩',
      petEmoji: row.pet_emoji ?? '🐾',
      petLocation: row.pet_location ?? '未知地區',
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      note: row.note,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

app.get('/admin/adoptions/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();

  if (!id) {
    return c.json({ ok: false, message: '申請 ID 為必填欄位。' }, 400);
  }

  const result = await db
    .prepare(
      `
      SELECT
        adoption_requests.id,
        adoption_requests.pet_id,
        adoption_requests.full_name,
        adoption_requests.email,
        adoption_requests.phone,
        adoption_requests.note,
        adoption_requests.status,
        adoption_requests.created_at,
        adoption_requests.updated_at,
        pets.name AS pet_name,
        pets.species AS pet_species,
        pets.gender AS pet_gender,
        pets.age AS pet_age,
        pets.age_group AS pet_age_group,
        pets.size AS pet_size,
        pets.size_group AS pet_size_group,
        pets.location AS pet_location,
        pets.location_key AS pet_location_key,
        pets.emoji AS pet_emoji,
        pets.badge_label AS pet_badge_label,
        pets.badge_tone AS pet_badge_tone,
        pets.description AS pet_description,
        pets.story AS pet_story,
        pets.tags_json AS pet_tags_json
      FROM adoption_requests
      LEFT JOIN pets ON pets.id = adoption_requests.pet_id
      WHERE adoption_requests.id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{
      id: string;
      pet_id: string;
      full_name: string;
      email: string;
      phone: string;
      note: string | null;
      status: string;
      created_at: string;
      updated_at: string;
      pet_name: string | null;
      pet_species: string | null;
      pet_gender: string | null;
      pet_age: string | null;
      pet_age_group: string | null;
      pet_size: string | null;
      pet_size_group: string | null;
      pet_location: string | null;
      pet_location_key: string | null;
      pet_emoji: string | null;
      pet_badge_label: string | null;
      pet_badge_tone: string | null;
      pet_description: string | null;
      pet_story: string | null;
      pet_tags_json: string | null;
    }>();

  if (!result) {
    return c.json({ ok: false, message: '找不到指定的申請。' }, 404);
  }

  return c.json({
    ok: true,
    adoption: {
      id: result.id,
      petId: result.pet_id,
      pet: {
        id: result.pet_id,
        name: result.pet_name ?? '未知毛孩',
        species: result.pet_species ?? 'other',
        gender: result.pet_gender ?? 'male',
        age: result.pet_age ?? '',
        ageGroup: result.pet_age_group ?? 'adult',
        size: result.pet_size ?? '',
        sizeGroup: result.pet_size_group ?? 'medium',
        location: result.pet_location ?? '未知地區',
        locationKey: result.pet_location_key ?? 'taipei',
        emoji: result.pet_emoji ?? '🐾',
        badge: result.pet_badge_label
          ? { label: result.pet_badge_label, tone: result.pet_badge_tone ?? 'default' }
          : undefined,
        description: result.pet_description ?? '',
        story: result.pet_story ?? '',
        tags: parseTagsJson(result.pet_tags_json),
      },
      fullName: result.full_name,
      email: result.email,
      phone: result.phone,
      note: result.note,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    },
  });
});

app.get('/admin/pets', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const result = await getPetsFromDatabase(db);

  return c.json({
    ok: true,
    total: result.length,
    results: result.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      gender: pet.gender,
      age: pet.age,
      ageGroup: pet.ageGroup,
      size: pet.size,
      sizeGroup: pet.sizeGroup,
      location: pet.location,
      locationKey: pet.locationKey,
      emoji: pet.emoji,
      coverImageUrl: pet.coverImageUrl || '',
      status: pet.status ?? 'available',
      badge: pet.badge,
      description: pet.description,
      story: pet.story,
      tags: pet.tags,
    })),
  });
});

app.post('/admin/pets', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const body = await c.req.json().catch(() => null);

  const allowedSpecies = new Set(['dog', 'cat', 'other']);
  const allowedGender = new Set(['male', 'female']);
  const allowedAgeGroup = new Set(['young', 'adult', 'senior']);
  const allowedSizeGroup = new Set(['small', 'medium', 'large']);
  const allowedLocationKey = new Set(['taipei', 'newtaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung']);
  const allowedBadgeTone = new Set(['urgent', 'new', 'default']);
  const allowedStatus = new Set(['available', 'hidden', 'adopted']);

  const idInput = typeof body?.id === 'string' ? body.id.trim() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const species = typeof body?.species === 'string' ? body.species.trim() : '';
  const gender = typeof body?.gender === 'string' ? body.gender.trim() : '';
  const age = typeof body?.age === 'string' ? body.age.trim() : '';
  const ageGroup = typeof body?.ageGroup === 'string' ? body.ageGroup.trim() : '';
  const size = typeof body?.size === 'string' ? body.size.trim() : '';
  const sizeGroup = typeof body?.sizeGroup === 'string' ? body.sizeGroup.trim() : '';
  const location = typeof body?.location === 'string' ? body.location.trim() : '';
  const locationKey = typeof body?.locationKey === 'string' ? body.locationKey.trim() : '';
  const emoji = typeof body?.emoji === 'string' ? body.emoji.trim() : '';
  const coverImageUrl = normalizeOptionalUrl(body?.coverImageUrl);
  const status = typeof body?.status === 'string' ? body.status.trim() : '';
  const badgeLabel = typeof body?.badgeLabel === 'string' ? body.badgeLabel.trim() : '';
  const badgeTone = typeof body?.badgeTone === 'string' ? body.badgeTone.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const story = typeof body?.story === 'string' ? body.story.trim() : '';
  const tagsInput = Array.isArray(body?.tags) ? (body.tags as unknown[]) : [];
  const tags = tagsInput.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  const sortOrder = Number(body?.sortOrder);

  if (
    !name ||
    !allowedSpecies.has(species) ||
    !allowedGender.has(gender) ||
    !age ||
    !allowedAgeGroup.has(ageGroup) ||
    !size ||
    !allowedSizeGroup.has(sizeGroup) ||
    !location ||
    !allowedLocationKey.has(locationKey) ||
    !emoji ||
    !allowedStatus.has(status) ||
    !description ||
    !story ||
    !Number.isFinite(sortOrder)
  ) {
    return c.json(
      {
        ok: false,
        message: '請確認毛孩基本資料皆已填寫，且分類欄位符合規格。',
      },
      400,
    );
  }

  if (badgeTone && !allowedBadgeTone.has(badgeTone)) {
    return c.json(
      {
        ok: false,
        message: 'badgeTone 只接受 urgent、new、default。',
      },
      400,
    );
  }

  const id = await ensureUniquePetId(db, idInput || name);
  const existing = await db
    .prepare(
      `
      SELECT id
      FROM pets
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{ id: string }>();

  if (existing) {
    return c.json({ ok: false, message: '毛孩 ID 已存在。' }, 409);
  }

  await db
    .prepare(
      `
      INSERT INTO pets (
        id,
        name,
        species,
        gender,
        age,
        age_group,
        size,
        size_group,
        location,
        location_key,
        emoji,
        cover_image_url,
        status,
        badge_label,
        badge_tone,
        description,
        story,
        tags_json,
        sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      id,
      name,
      species,
      gender,
      age,
      ageGroup,
      size,
      sizeGroup,
      location,
      locationKey,
      emoji,
      coverImageUrl || null,
      status,
      badgeLabel || null,
      badgeLabel ? (badgeTone || 'default') : null,
      description,
      story,
      JSON.stringify(tags),
      Math.floor(sortOrder),
    )
    .run();

  const pet = await getPetByIdFromDatabase(db, id);

  return c.json({
    ok: true,
    message: '毛孩已建立並上架。',
    pet: pet ?? {
      id,
      name,
      species,
      gender,
      age,
      ageGroup,
      size,
      sizeGroup,
      location,
      locationKey,
      emoji,
      coverImageUrl,
      status,
      badge: badgeLabel ? { label: badgeLabel, tone: badgeTone || 'default' } : undefined,
      description,
      story,
      tags,
      sortOrder: Math.floor(sortOrder),
    },
  });
});

app.post('/admin/pet-images', async (c) => {
  const bucket = c.env.paws_pet_images;

  if (!bucket) {
    return c.json({ ok: false, message: 'R2 binding paws_pet_images is not available.' }, 503);
  }

  const formData = await c.req.formData().catch(() => null);
  const fileValue = formData?.get('file') ?? formData?.get('image');

  if (!(fileValue instanceof File)) {
    return c.json({ ok: false, message: '請先選擇要上傳的圖片。' }, 400);
  }

  if (!fileValue.size) {
    return c.json({ ok: false, message: '上傳的圖片不能是空檔案。' }, 400);
  }

  const normalizedContentType = fileValue.type.toLowerCase().split(';')[0].trim();
  const key = buildPetImageKey(normalizedContentType);

  if (!key) {
    return c.json({ ok: false, message: '只支援 JPG、PNG、WebP、GIF、AVIF 圖片。' }, 400);
  }

  const cacheControl = 'public, max-age=31536000, immutable';

  await bucket.put(key, await fileValue.arrayBuffer(), {
    httpMetadata: {
      contentType: normalizedContentType,
      cacheControl,
    },
    customMetadata: {
      originalName: fileValue.name || 'pet-image',
    },
  });

  return c.json({
    ok: true,
    message: '圖片已上傳。',
    key,
    url: buildPetImageUrl(key),
  });
});

app.get('/pet-images/:key', async (c) => {
  const bucket = c.env.paws_pet_images;

  if (!bucket) {
    return c.json({ ok: false, message: 'R2 binding paws_pet_images is not available.' }, 503);
  }

  const key = c.req.param('key').trim();

  if (!key) {
    return c.json({ ok: false, message: '圖片 key 為必填欄位。' }, 400);
  }

  const object = await bucket.get(key);

  if (!object) {
    return c.json({ ok: false, message: '找不到指定的圖片。' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', object.httpEtag);

  return new Response(object.body, {
    headers,
  });
});

app.get('/admin/pets/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();

  if (!id) {
    return c.json({ ok: false, message: '毛孩 ID 為必填欄位。' }, 400);
  }

  const result = await db
    .prepare(
      `
      SELECT
        id,
        name,
        species,
        gender,
        age,
        age_group,
        size,
        size_group,
        location,
        location_key,
        emoji,
        cover_image_url,
        status,
        badge_label,
        badge_tone,
        description,
        story,
        tags_json,
        sort_order
      FROM pets
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{
      id: string;
      name: string;
      species: 'dog' | 'cat' | 'other';
      gender: 'male' | 'female';
      age: string;
      age_group: 'young' | 'adult' | 'senior';
      size: string;
      size_group: 'small' | 'medium' | 'large';
      location: string;
      location_key: 'taipei' | 'newtaipei' | 'taoyuan' | 'taichung' | 'tainan' | 'kaohsiung';
      emoji: string;
      cover_image_url: string | null;
      status: 'available' | 'hidden' | 'adopted' | null;
      badge_label: string | null;
      badge_tone: 'urgent' | 'new' | 'default' | null;
      description: string;
      story: string;
      tags_json: string;
      sort_order: number;
    }>();

  if (!result) {
    return c.json({ ok: false, message: '找不到指定的毛孩。' }, 404);
  }

  return c.json({
    ok: true,
    pet: {
      id: result.id,
      name: result.name,
      species: result.species,
      gender: result.gender,
      age: result.age,
      ageGroup: result.age_group,
      size: result.size,
      sizeGroup: result.size_group,
      location: result.location,
      locationKey: result.location_key,
      emoji: result.emoji,
      coverImageUrl: result.cover_image_url ?? '',
      status: result.status ?? 'available',
      badge: result.badge_label ? { label: result.badge_label, tone: result.badge_tone ?? 'default' } : undefined,
      description: result.description,
      story: result.story,
      tags: parseTagsJson(result.tags_json),
      sortOrder: result.sort_order,
    },
  });
});

app.patch('/admin/shelters/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();
  const body = await c.req.json().catch(() => null);

  if (!id) {
    return c.json({ ok: false, message: '收容所 ID 為必填欄位。' }, 400);
  }

  const existing = await getShelterByIdFromDatabase(db, id);
  if (!existing) {
    return c.json({ ok: false, message: '找不到指定的收容所。' }, 404);
  }

  const updated = await updateShelterInDatabase(db, {
    id,
    icon: body?.icon,
    name: body?.name,
    description: body?.description,
    location: body?.location,
    availablePets: body?.availablePets,
    contactName: body?.contactName,
    contactPhone: body?.contactPhone,
    contactEmail: body?.contactEmail,
    sortOrder: body?.sortOrder,
  });

  if (!updated) {
    return c.json({ ok: false, message: '更新收容所資料失敗。' }, 500);
  }

  return c.json({
    ok: true,
    message: '收容所資料已更新。',
    shelter: updated,
  });
});

app.patch('/admin/pets/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();
  const body = await c.req.json().catch(() => null);

  const allowedSpecies = new Set(['dog', 'cat', 'other']);
  const allowedGender = new Set(['male', 'female']);
  const allowedAgeGroup = new Set(['young', 'adult', 'senior']);
  const allowedSizeGroup = new Set(['small', 'medium', 'large']);
  const allowedLocationKey = new Set(['taipei', 'newtaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung']);
  const allowedBadgeTone = new Set(['urgent', 'new', 'default']);
  const allowedStatus = new Set(['available', 'hidden', 'adopted']);

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const species = typeof body?.species === 'string' ? body.species.trim() : '';
  const gender = typeof body?.gender === 'string' ? body.gender.trim() : '';
  const age = typeof body?.age === 'string' ? body.age.trim() : '';
  const ageGroup = typeof body?.ageGroup === 'string' ? body.ageGroup.trim() : '';
  const size = typeof body?.size === 'string' ? body.size.trim() : '';
  const sizeGroup = typeof body?.sizeGroup === 'string' ? body.sizeGroup.trim() : '';
  const location = typeof body?.location === 'string' ? body.location.trim() : '';
  const locationKey = typeof body?.locationKey === 'string' ? body.locationKey.trim() : '';
  const emoji = typeof body?.emoji === 'string' ? body.emoji.trim() : '';
  const coverImageUrl = normalizeOptionalUrl(body?.coverImageUrl);
  const status = typeof body?.status === 'string' ? body.status.trim() : '';
  const badgeLabel = typeof body?.badgeLabel === 'string' ? body.badgeLabel.trim() : '';
  const badgeTone = typeof body?.badgeTone === 'string' ? body.badgeTone.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const story = typeof body?.story === 'string' ? body.story.trim() : '';
  const tagsInput = Array.isArray(body?.tags) ? (body.tags as unknown[]) : [];
  const tags = tagsInput.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  const sortOrder = Number(body?.sortOrder);

  if (!id) {
    return c.json({ ok: false, message: '毛孩 ID 為必填欄位。' }, 400);
  }

  if (
    !name ||
    !allowedSpecies.has(species) ||
    !allowedGender.has(gender) ||
    !age ||
    !allowedAgeGroup.has(ageGroup) ||
    !size ||
    !allowedSizeGroup.has(sizeGroup) ||
    !location ||
    !allowedLocationKey.has(locationKey) ||
    !emoji ||
    !allowedStatus.has(status) ||
    !description ||
    !story ||
    !Number.isFinite(sortOrder)
  ) {
    return c.json(
      {
        ok: false,
        message: '請確認毛孩基本資料皆已填寫，且分類欄位符合規格。',
      },
      400,
    );
  }

  if (badgeTone && !allowedBadgeTone.has(badgeTone)) {
    return c.json(
      {
        ok: false,
        message: 'badgeTone 只接受 urgent、new、default。',
      },
      400,
    );
  }

  const existing = await db
    .prepare(
      `
      SELECT id
      FROM pets
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ ok: false, message: '找不到指定的毛孩。' }, 404);
  }

  await db
    .prepare(
      `
      UPDATE pets
      SET
        name = ?,
        species = ?,
        gender = ?,
        age = ?,
        age_group = ?,
        size = ?,
        size_group = ?,
        location = ?,
        location_key = ?,
        emoji = ?,
        cover_image_url = ?,
        status = ?,
        badge_label = ?,
        badge_tone = ?,
        description = ?,
        story = ?,
        tags_json = ?,
        sort_order = ?
      WHERE id = ?
      `,
    )
    .bind(
      name,
      species,
      gender,
      age,
      ageGroup,
      size,
      sizeGroup,
      location,
      locationKey,
      emoji,
      coverImageUrl || null,
      status,
      badgeLabel || null,
      badgeLabel ? (badgeTone || 'default') : null,
      description,
      story,
      JSON.stringify(tags),
      Math.floor(sortOrder),
      id,
    )
    .run();

  return c.json({
    ok: true,
    message: '毛孩資料已更新。',
    pet: {
      id,
      name,
      species,
      gender,
      age,
      ageGroup,
      size,
      sizeGroup,
      location,
      locationKey,
      emoji,
      coverImageUrl,
      status,
      badge: badgeLabel ? { label: badgeLabel, tone: badgeTone || 'default' } : undefined,
      description,
      story,
      tags,
      sortOrder: Math.floor(sortOrder),
    },
  });
});

app.get('/admin/favorites', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const limit = parseLimit(c.req.query('limit'), 10, 20);
  const result = await db
    .prepare(
      `
      SELECT
        favorites.id AS favorite_id,
        favorites.user_id AS client_id,
        favorites.created_at AS favorite_created_at,
        pets.id,
        pets.name,
        pets.species,
        pets.gender,
        pets.age,
        pets.age_group,
        pets.size,
        pets.size_group,
        pets.location,
        pets.location_key,
        pets.emoji,
        pets.badge_label,
        pets.badge_tone,
        pets.description,
        pets.story,
        pets.tags_json,
        pets.sort_order
      FROM favorites
      INNER JOIN pets ON pets.id = favorites.pet_id
      ORDER BY favorites.created_at DESC
      LIMIT ?
      `,
    )
    .bind(limit)
    .all<{
      favorite_id: string;
      client_id: string;
      favorite_created_at: string;
      id: string;
      name: string;
      species: 'dog' | 'cat' | 'other';
      gender: 'male' | 'female';
      age: string;
      age_group: 'young' | 'adult' | 'senior';
      size: string;
      size_group: 'small' | 'medium' | 'large';
      location: string;
      location_key: 'taipei' | 'newtaipei' | 'taoyuan' | 'taichung' | 'tainan' | 'kaohsiung';
      emoji: string;
      badge_label: string | null;
      badge_tone: 'urgent' | 'new' | 'default' | null;
      description: string;
      story: string;
      tags_json: string;
      sort_order: number;
    }>();

  return c.json({
    ok: true,
    total: result.results.length,
    results: result.results.map((row) => ({
      favoriteId: row.favorite_id,
      clientId: row.client_id,
      favoriteCreatedAt: row.favorite_created_at,
      pet: {
        id: row.id,
        name: row.name,
        species: row.species,
        gender: row.gender,
        age: row.age,
        ageGroup: row.age_group,
        size: row.size,
        sizeGroup: row.size_group,
        location: row.location,
        locationKey: row.location_key,
        emoji: row.emoji,
        badge: row.badge_label ? { label: row.badge_label, tone: row.badge_tone ?? 'default' } : undefined,
        description: row.description,
        story: row.story,
        tags: parseTagsJson(row.tags_json),
      },
    })),
  });
});

app.patch('/admin/adoptions/:id', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const id = c.req.param('id').trim();
  const body = await c.req.json().catch(() => null);
  const nextStatus = typeof body?.status === 'string' ? body.status.trim() : '';

  if (!id) {
    return c.json({ ok: false, message: '申請 ID 為必填欄位。' }, 400);
  }

  if (!isAdoptionRequestStatus(nextStatus)) {
    return c.json(
      {
        ok: false,
        message: 'status 只接受 pending、approved、rejected。',
      },
      400,
    );
  }

  const existing = await db
    .prepare(
      `
      SELECT id
      FROM adoption_requests
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ ok: false, message: '找不到指定的申請。' }, 404);
  }

  await db
    .prepare(
      `
      UPDATE adoption_requests
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
    )
    .bind(nextStatus, id)
    .run();

  return c.json({
    ok: true,
    message: `申請已更新為 ${nextStatus}。`,
    adoption: {
      id,
      status: nextStatus,
    },
  });
});

app.post('/adoptions', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const body = await c.req.json().catch(() => null);
  const petId = typeof body?.petId === 'string' ? body.petId.trim() : '';
  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const note = typeof body?.note === 'string' ? body.note.trim() : '';

  if (!petId || !fullName || !email || !phone) {
    return c.json(
      {
        ok: false,
        message: 'petId、fullName、email、phone 為必填欄位。',
      },
      400,
    );
  }

  const pet = await getPetByIdFromDatabase(db, petId);

  if (!pet) {
    return c.json(
      {
        ok: false,
        message: '找不到指定的毛孩。',
      },
      404,
    );
  }

  const id = crypto.randomUUID();

  await db
    .prepare(
      `
      INSERT INTO adoption_requests (
        id,
        pet_id,
        full_name,
        email,
        phone,
        note,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
    )
    .bind(id, petId, fullName, email, phone, note || null)
    .run();

  return c.json(
    {
      ok: true,
      message: '領養申請已送出，請留意後續聯絡。',
      request: {
        id,
        petId,
        petName: pet.name,
        fullName,
        email,
        phone,
        note: note || null,
        status: 'pending',
      },
    },
    201,
  );
});

app.post('/favorites', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const body = await c.req.json().catch(() => null);
  const petId = typeof body?.petId === 'string' ? body.petId.trim() : '';
  const clientId = typeof body?.clientId === 'string' ? body.clientId.trim() : '';

  if (!petId) {
    return c.json(
      {
        ok: false,
        message: 'petId 為必填欄位。',
      },
      400,
    );
  }

  const owner = await getFavoriteOwner(c, clientId);

  if (!owner) {
    return c.json(
      {
        ok: false,
        message: '會員登入後可直接收藏，匿名模式則需要 clientId。',
      },
      400,
    );
  }

  const pet = await getPetByIdFromDatabase(db, petId);

  if (!pet) {
    return c.json(
      {
        ok: false,
        message: '找不到指定的毛孩。',
      },
      404,
    );
  }

  const favoriteId = crypto.randomUUID();

  await db
    .prepare(
      `
      DELETE FROM favorites
      WHERE pet_id = ? AND user_id = ?
      `,
    )
    .bind(petId, owner.ownerId)
    .run();

  await db
    .prepare(
      `
      INSERT INTO favorites (
        id,
        pet_id,
        user_id
      ) VALUES (?, ?, ?)
      `,
    )
    .bind(favoriteId, petId, owner.ownerId)
    .run();

  return c.json(
    {
      ok: true,
      message: '收藏已加入。',
      favorite: {
        id: favoriteId,
        petId,
        petName: pet.name,
        ownerId: owner.ownerId,
        ownerType: owner.kind,
      },
    },
    201,
  );
});

app.delete('/favorites', async (c) => {
  const db = c.env.paws;

  if (!db) {
    return c.json({ ok: false, message: 'D1 binding paws is not available.' }, 503);
  }

  const body = await c.req.json().catch(() => null);
  const petId = typeof body?.petId === 'string' ? body.petId.trim() : '';
  const clientId = typeof body?.clientId === 'string' ? body.clientId.trim() : '';

  const owner = await getFavoriteOwner(c, clientId);

  if (!owner) {
    return c.json(
      {
        ok: false,
        message: '會員登入後可直接清空收藏，匿名模式則需要 clientId。',
      },
      400,
    );
  }

  if (petId) {
    await db
      .prepare(
        `
        DELETE FROM favorites
        WHERE pet_id = ? AND user_id = ?
        `,
      )
      .bind(petId, owner.ownerId)
      .run();
  } else {
    await db
      .prepare(
        `
        DELETE FROM favorites
        WHERE user_id = ?
        `,
      )
      .bind(owner.ownerId)
      .run();
  }

  return c.json({
    ok: true,
    message: petId ? '收藏已移除。' : '收藏已全部清空。',
    favorite: {
      ownerId: owner.ownerId,
      ownerType: owner.kind,
      ...(petId ? { petId } : {}),
    },
  });
});

export const onRequest = handle(app);
