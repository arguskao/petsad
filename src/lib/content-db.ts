import { shelters as fallbackShelters, type Shelter } from '../data/shelters';
import { stories as fallbackStories, type Story } from '../data/stories';

type StoryRow = {
  id: string;
  title: string;
  quote: string;
  author: string;
  date: string;
  avatar: string;
  emoji: string;
  sort_order: number;
};

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

const sortByOrder = <T>(items: T[]) => [...items];

const toStory = (row: StoryRow): Story => ({
  id: row.id,
  title: row.title,
  quote: row.quote,
  author: row.author,
  date: row.date,
  avatar: row.avatar,
  emoji: row.emoji,
  sortOrder: row.sort_order,
});

const toShelter = (row: ShelterRow): Shelter => ({
  id: row.id,
  icon: row.icon,
  name: row.name,
  description: row.description,
  location: row.location,
  availablePets: row.available_pets,
  contactName: row.contact_name ?? '',
  contactPhone: row.contact_phone ?? '',
  contactEmail: row.contact_email ?? '',
});

export const getStoriesFromDatabase = async (db?: D1Database) => {
  if (!db) {
    return sortByOrder(fallbackStories);
  }

  const result = await db
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
      ORDER BY sort_order ASC, date DESC
      `,
    )
    .all<StoryRow>();

  if (!result.results.length) {
    return sortByOrder(fallbackStories);
  }

  return result.results.map(toStory);
};

export const getSheltersFromDatabase = async (db?: D1Database) => {
  if (!db) {
    return sortByOrder(fallbackShelters);
  }

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

  if (!result.results.length) {
    return sortByOrder(fallbackShelters);
  }

  return result.results.map(toShelter);
};
