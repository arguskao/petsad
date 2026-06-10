import { pets } from '../../../data/pets';
import { findPetById } from '../../../lib/pets';

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });

export function getStaticPaths() {
  return pets.map((pet) => ({
    params: { id: pet.id },
    props: { pet },
  }));
}

export function GET({ props }: { props: { pet: ReturnType<typeof findPetById> } }) {
  const pet = props.pet;

  if (!pet) {
    return json({ error: 'Pet not found' }, { status: 404 });
  }

  return json({ pet });
}

