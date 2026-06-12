import { shelters as fallbackShelters, type Shelter } from '../data/shelters';
import { stories as fallbackStories, type Story } from '../data/stories';
import { faqs as fallbackFaqs, type Faq } from '../data/faqs';
import {
  adoptionGuideSections as fallbackAdoptionGuideSections,
  pageCopies as fallbackPageCopies,
  type AdoptionGuideSection,
  type PageCopy,
} from '../data/content';

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

type FaqRow = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
};

type AdoptionGuideRow = {
  id: string;
  title: string;
  highlight: string;
  body: string;
  sort_order: number;
};

type PageCopyRow = {
  id: string;
  page_key: string;
  field_key: string;
  label: string;
  value: string;
  sort_order: number;
};

const sortByOrder = <T>(items: T[]) =>
  [...items].sort((left, right) => {
    const leftValue = left as { sortOrder?: number; sort_order?: number };
    const rightValue = right as { sortOrder?: number; sort_order?: number };
    return Number(leftValue.sortOrder ?? leftValue.sort_order ?? 0) - Number(rightValue.sortOrder ?? rightValue.sort_order ?? 0);
  });

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

const toFaq = (row: FaqRow): Faq => ({
  id: row.id,
  category: row.category,
  question: row.question,
  answer: row.answer,
  sortOrder: row.sort_order,
});

const toAdoptionGuide = (row: AdoptionGuideRow): AdoptionGuideSection => ({
  id: row.id,
  title: row.title,
  highlight: row.highlight,
  body: row.body,
  sortOrder: row.sort_order,
});

const toPageCopy = (row: PageCopyRow): PageCopy => ({
  id: row.id,
  pageKey: row.page_key,
  fieldKey: row.field_key,
  label: row.label,
  value: row.value,
  sortOrder: row.sort_order,
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

export const getFaqsFromDatabase = async (db?: D1Database) => {
  if (!db) {
    return sortByOrder(fallbackFaqs);
  }

  const result = await db
    .prepare(
      `
      SELECT
        id,
        category,
        question,
        answer,
        sort_order
      FROM faqs
      ORDER BY sort_order ASC, question ASC
      `,
    )
    .all<FaqRow>();

  if (!result.results.length) {
    return sortByOrder(fallbackFaqs);
  }

  return result.results.map(toFaq);
};

export const getAdoptionGuideSectionsFromDatabase = async (db?: D1Database) => {
  if (!db) {
    return sortByOrder(fallbackAdoptionGuideSections);
  }

  const result = await db
    .prepare(
      `
      SELECT
        id,
        title,
        highlight,
        body,
        sort_order
      FROM adoption_guide_sections
      ORDER BY sort_order ASC, title ASC
      `,
    )
    .all<AdoptionGuideRow>();

  if (!result.results.length) {
    return sortByOrder(fallbackAdoptionGuideSections);
  }

  return result.results.map(toAdoptionGuide);
};

export const getAdoptionGuideSectionByIdFromDatabase = async (db: D1Database | undefined, id: string) => {
  if (!db) {
    return fallbackAdoptionGuideSections.find((section) => section.id === id) ?? null;
  }

  const result = await db
    .prepare(
      `
      SELECT
        id,
        title,
        highlight,
        body,
        sort_order
      FROM adoption_guide_sections
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<AdoptionGuideRow>();

  return result ? toAdoptionGuide(result) : null;
};

export const updateAdoptionGuideSectionInDatabase = async (
  db: D1Database,
  input: {
    id: string;
    title: string;
    highlight: string;
    body: string;
    sortOrder: number;
  },
) => {
  await db
    .prepare(
      `
      UPDATE adoption_guide_sections
      SET
        title = ?,
        highlight = ?,
        body = ?,
        sort_order = ?
      WHERE id = ?
      `,
    )
    .bind(input.title, input.highlight, input.body, Math.floor(input.sortOrder), input.id)
    .run();

  return getAdoptionGuideSectionByIdFromDatabase(db, input.id);
};

export const getPageCopiesFromDatabase = async (db?: D1Database, pageKey?: string) => {
  if (!db) {
    return pageKey
      ? sortByOrder(fallbackPageCopies.filter((copy) => copy.pageKey === pageKey))
      : sortByOrder(fallbackPageCopies);
  }

  const rows = pageKey
    ? await db
        .prepare(
          `
          SELECT
            id,
            page_key,
            field_key,
            label,
            value,
            sort_order
          FROM page_copies
          WHERE page_key = ?
          ORDER BY sort_order ASC, field_key ASC
          `,
        )
        .bind(pageKey)
        .all<PageCopyRow>()
    : await db
        .prepare(
          `
          SELECT
            id,
            page_key,
            field_key,
            label,
            value,
            sort_order
          FROM page_copies
          ORDER BY page_key ASC, sort_order ASC, field_key ASC
          `,
        )
        .all<PageCopyRow>();

  if (!rows.results.length) {
    return pageKey
      ? sortByOrder(fallbackPageCopies.filter((copy) => copy.pageKey === pageKey))
      : sortByOrder(fallbackPageCopies);
  }

  return rows.results.map(toPageCopy);
};

export const getPageCopyByIdFromDatabase = async (db: D1Database | undefined, id: string) => {
  if (!db) {
    return fallbackPageCopies.find((copy) => copy.id === id) ?? null;
  }

  const result = await db
    .prepare(
      `
      SELECT
        id,
        page_key,
        field_key,
        label,
        value,
        sort_order
      FROM page_copies
      WHERE id = ?
      LIMIT 1
      `,
    )
    .bind(id)
    .first<PageCopyRow>();

  return result ? toPageCopy(result) : null;
};

export const updatePageCopyInDatabase = async (
  db: D1Database,
  input: {
    id: string;
    pageKey: string;
    fieldKey: string;
    label: string;
    value: string;
    sortOrder: number;
  },
) => {
  await db
    .prepare(
      `
      UPDATE page_copies
      SET
        page_key = ?,
        field_key = ?,
        label = ?,
        value = ?,
        sort_order = ?
      WHERE id = ?
      `,
    )
    .bind(input.pageKey, input.fieldKey, input.label, input.value, Math.floor(input.sortOrder), input.id)
    .run();

  return getPageCopyByIdFromDatabase(db, input.id);
};
