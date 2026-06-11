import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

import { createPetApiPayload, findPetById } from '../../src/lib/pets';
import { getFavoritesFromDatabase } from '../../src/lib/favorites-db';
import { getSheltersFromDatabase, getStoriesFromDatabase } from '../../src/lib/content-db';
import { getPetByIdFromDatabase, getPetsFromDatabase } from '../../src/lib/paws-db';

type ApiEnv = {
  paws?: D1Database;
  ASSETS?: Fetcher;
};

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

const app = new Hono<{ Bindings: ApiEnv }>().basePath('/api');

app.get('/', (c) =>
  c.json({
    name: 'PawsHome API',
    version: '1.1.0',
    dataSource: 'Cloudflare D1 paws',
    endpoints: [
      'GET /api/pets',
      'GET /api/pets/:id',
      'GET /api/stories',
      'GET /api/shelters',
      'GET /api/favorites',
      'GET /api/admin/summary',
      'GET /api/admin/adoptions',
      'GET /api/admin/adoptions/:id',
      'GET /api/admin/pets',
      'GET /api/admin/pets/:id',
      'PATCH /api/admin/pets/:id',
      'GET /api/admin/favorites',
      'PATCH /api/admin/adoptions/:id',
      'POST /api/adoptions',
      'POST /api/favorites',
      'DELETE /api/favorites',
    ],
  }),
);

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

app.get('/shelters', async (c) => {
  const shelters = await getSheltersFromDatabase(c.env.paws);
  return c.json({
    total: shelters.length,
    results: shelters,
  });
});

app.get('/favorites', async (c) => {
  const clientId = c.req.query('clientId')?.trim() ?? '';
  const favorites = await getFavoritesFromDatabase(c.env.paws, clientId);

  return c.json({
    total: favorites.length,
    results: favorites,
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
        (SELECT COUNT(*) FROM adoption_requests) AS total_adoptions,
        (SELECT COUNT(*) FROM adoption_requests WHERE status = 'pending') AS pending_adoptions,
        (SELECT COUNT(*) FROM favorites) AS total_favorites,
        (SELECT COUNT(DISTINCT user_id) FROM favorites) AS favorite_users
      `,
    )
    .first<{
      total_pets: number;
      total_adoptions: number;
      pending_adoptions: number;
      total_favorites: number;
      favorite_users: number;
    }>();

  return c.json({
    ok: true,
    summary: {
      totalPets: summary?.total_pets ?? 0,
      totalAdoptions: summary?.total_adoptions ?? 0,
      pendingAdoptions: summary?.pending_adoptions ?? 0,
      totalFavorites: summary?.total_favorites ?? 0,
      favoriteUsers: summary?.favorite_users ?? 0,
    },
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
      status: pet.status ?? 'available',
      badge: pet.badge,
      description: pet.description,
      story: pet.story,
      tags: pet.tags,
    })),
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
      status: result.status ?? 'available',
      badge: result.badge_label ? { label: result.badge_label, tone: result.badge_tone ?? 'default' } : undefined,
      description: result.description,
      story: result.story,
      tags: parseTagsJson(result.tags_json),
      sortOrder: result.sort_order,
    },
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
  const allowedStatuses = new Set(['pending', 'approved', 'rejected']);

  if (!id) {
    return c.json({ ok: false, message: '申請 ID 為必填欄位。' }, 400);
  }

  if (!allowedStatuses.has(nextStatus)) {
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

  if (!petId || !clientId) {
    return c.json(
      {
        ok: false,
        message: 'petId 與 clientId 為必填欄位。',
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
    .bind(petId, clientId)
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
    .bind(favoriteId, petId, clientId)
    .run();

  return c.json(
    {
      ok: true,
      message: '收藏已加入。',
      favorite: {
        id: favoriteId,
        petId,
        petName: pet.name,
        clientId,
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

  if (!clientId) {
    return c.json(
      {
        ok: false,
        message: 'clientId 為必填欄位。',
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
      .bind(petId, clientId)
      .run();
  } else {
    await db
      .prepare(
        `
        DELETE FROM favorites
        WHERE user_id = ?
        `,
      )
      .bind(clientId)
      .run();
  }

  return c.json({
    ok: true,
    message: petId ? '收藏已移除。' : '收藏已全部清空。',
    favorite: {
      clientId,
      ...(petId ? { petId } : {}),
    },
  });
});

export const onRequest = handle(app);
