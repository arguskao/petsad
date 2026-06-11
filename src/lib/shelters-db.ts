import { type Shelter } from '../data/shelters';

type ShelterRow = {
  id: string;
  icon: string;
  name: string;
  description: string;
  location: string;
  available_pets: number;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  sort_order: number;
};

export type ShelterRecord = Shelter & {
  sortOrder: number;
};

const toShelter = (row: ShelterRow): ShelterRecord => ({
  id: row.id,
  icon: row.icon,
  name: row.name,
  description: row.description,
  location: row.location,
  availablePets: row.available_pets,
  contactName: row.contact_name ?? '',
  contactPhone: row.contact_phone ?? '',
  contactEmail: row.contact_email ?? '',
  sortOrder: row.sort_order,
});

const sanitizeText = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

const sanitizeNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

export const getSheltersFromDatabase = async (db: D1Database | undefined) => {
  if (!db) return [];

  const result = await db
    .prepare(
      `
      SELECT
        id,
        icon,
        name,
        description,
        location,
        available_pets,
        contact_name,
        contact_phone,
        contact_email,
        sort_order
      FROM shelters
      ORDER BY sort_order ASC, name ASC
      `,
    )
    .all<ShelterRow>();

  return result.results.map(toShelter);
};

export const getShelterByIdFromDatabase = async (db: D1Database | undefined, id: string) => {
  if (!db || !id) return null;

  const result = await db
    .prepare(
      `
      SELECT
        id,
        icon,
        name,
        description,
        location,
        available_pets,
        contact_name,
        contact_phone,
        contact_email,
        sort_order
      FROM shelters
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<ShelterRow>();

  return result ? toShelter(result) : null;
};

export const updateShelterInDatabase = async (
  db: D1Database | undefined,
  input: {
    id: string;
    icon: unknown;
    name: unknown;
    description: unknown;
    location: unknown;
    availablePets: unknown;
    contactName: unknown;
    contactPhone: unknown;
    contactEmail: unknown;
    sortOrder: unknown;
  },
) => {
  if (!db) return null;

  await db
    .prepare(
      `
      UPDATE shelters
      SET
        icon = ?,
        name = ?,
        description = ?,
        location = ?,
        available_pets = ?,
        contact_name = ?,
        contact_phone = ?,
        contact_email = ?,
        sort_order = ?
      WHERE id = ?
      `,
    )
    .bind(
      sanitizeText(input.icon, '🏥'),
      sanitizeText(input.name),
      sanitizeText(input.description),
      sanitizeText(input.location),
      sanitizeNumber(input.availablePets, 0),
      sanitizeText(input.contactName),
      sanitizeText(input.contactPhone),
      sanitizeText(input.contactEmail),
      sanitizeNumber(input.sortOrder, 0),
      input.id,
    )
    .run();

  return getShelterByIdFromDatabase(db, input.id);
};
