import { pets as fallbackPets, type Pet, type PetStatus } from '../data/pets';

type PetRow = {
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
  cover_image_url: string | null;
  status: PetStatus | null;
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

const toPet = (row: PetRow): Pet => ({
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
  coverImageUrl: row.cover_image_url ?? '',
  status: row.status ?? 'available',
  badge: row.badge_label ? { label: row.badge_label, tone: row.badge_tone ?? 'default' } : undefined,
  description: row.description,
  tags: parseTags(row.tags_json),
  story: row.story,
});

const sortFallbackPets = () => [...fallbackPets];

export const getPetsFromDatabase = async (db?: D1Database) => {
  if (!db) {
    return sortFallbackPets();
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
      ORDER BY sort_order ASC, name ASC
      `,
    )
    .all<PetRow>();

  if (!result.results.length) {
    return sortFallbackPets();
  }

  return result.results.map(toPet);
};

export const getPetByIdFromDatabase = async (db: D1Database | undefined, id: string) => {
  if (!db) {
    return fallbackPets.find((pet) => pet.id === id) ?? null;
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
    .first<PetRow>();

  return result ? toPet(result) : null;
};
