import { type Pet } from '../data/pets';

type FavoritePetRow = {
  favorite_id: string;
  favorite_created_at: string;
  id: string;
  name: string;
  species: Pet['species'];
  gender: Pet['gender'];
  age: string;
  age_group: Pet['ageGroup'];
  size: string;
  size_group: Pet['sizeGroup'];
  location: string;
  location_key: Pet['locationKey'];
  emoji: string;
  badge_label: string | null;
  badge_tone: 'urgent' | 'new' | 'default' | null;
  description: string;
  story: string;
  tags_json: string;
  sort_order: number;
};

const parseTags = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const toPet = (row: FavoritePetRow) => ({
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
  tags: parseTags(row.tags_json),
  story: row.story,
});

export const getFavoritesFromDatabase = async (db: D1Database | undefined, ownerId: string) => {
  if (!db || !ownerId) {
    return [];
  }

  const result = await db
    .prepare(
      `
      SELECT
        favorites.id AS favorite_id,
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
      WHERE favorites.user_id = ?
      ORDER BY favorites.created_at DESC, pets.sort_order ASC, pets.name ASC
      `,
    )
    .bind(ownerId)
    .all<FavoritePetRow>();

  return result.results.map((row) => ({
    favoriteId: row.favorite_id,
    favoriteCreatedAt: row.favorite_created_at,
    pet: toPet(row),
  }));
};

export const getFavoritePetIdsFromDatabase = async (db: D1Database | undefined, ownerId: string) => {
  if (!db || !ownerId) {
    return [];
  }

  const result = await db
    .prepare(
      `
      SELECT pet_id
      FROM favorites
      WHERE user_id = ?
      ORDER BY created_at ASC
      `,
    )
    .bind(ownerId)
    .all<{ pet_id: string }>();

  return result.results.map((row) => row.pet_id);
};
