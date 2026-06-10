import { pets, type Pet, type PetAgeGroup, type PetLocationKey, type PetSizeGroup, type PetSpecies } from '../data/pets';

export interface PetFilters {
  type?: string;
  age?: string;
  size?: string;
  area?: string;
}

const allowed = {
  type: ['all', 'dog', 'cat', 'other'],
  age: ['any', 'young', 'adult', 'senior'],
  size: ['any', 'small', 'medium', 'large'],
  area: ['all', 'taipei', 'newtaipei', 'taoyuan', 'taichung', 'tainan', 'kaohsiung'],
} as const;

export const normalizeFilterValue = (key: keyof PetFilters, value: string | null | undefined) => {
  const fallback = key === 'age' || key === 'size' ? 'any' : 'all';
  const normalized = (value || fallback).toString();
  return allowed[key].includes(normalized as never) ? normalized : fallback;
};

export const filterPets = (items: Pet[], filters: PetFilters) => {
  const type = normalizeFilterValue('type', filters.type);
  const age = normalizeFilterValue('age', filters.age);
  const size = normalizeFilterValue('size', filters.size);
  const area = normalizeFilterValue('area', filters.area);

  return items.filter((pet) => {
    const matchType = type === 'all' || pet.species === type;
    const matchAge = age === 'any' || pet.ageGroup === age;
    const matchSize = size === 'any' || pet.sizeGroup === size;
    const matchArea = area === 'all' || pet.locationKey === area;

    return matchType && matchAge && matchSize && matchArea;
  });
};

export const findPetById = (id: string) => pets.find((pet) => pet.id === id);

export const createPetApiPayload = (items: Pet[], filters: PetFilters = {}) => {
  const results = filterPets(items, filters);

  return {
    total: items.length,
    count: results.length,
    filters: {
      type: normalizeFilterValue('type', filters.type),
      age: normalizeFilterValue('age', filters.age),
      size: normalizeFilterValue('size', filters.size),
      area: normalizeFilterValue('area', filters.area),
    },
    results,
  };
};
