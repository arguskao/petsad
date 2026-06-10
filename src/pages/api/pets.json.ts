import { pets } from '../../data/pets';
import { createPetApiPayload, normalizeFilterValue } from '../../lib/pets';

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });

export function GET({ url }: { url: URL }) {
  const payload = createPetApiPayload(pets, {
    type: normalizeFilterValue('type', url.searchParams.get('type')),
    age: normalizeFilterValue('age', url.searchParams.get('age')),
    size: normalizeFilterValue('size', url.searchParams.get('size')),
    area: normalizeFilterValue('area', url.searchParams.get('area')),
  });

  return json(payload);
}

