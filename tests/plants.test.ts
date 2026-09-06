import { describe, expect, test } from 'vitest';
import {
  checkboxName,
  plantHref,
  plantUrl,
  publishedPlants,
  itemsForPlant,
} from '../src/lib/plants';

const plant = (id: string, order: number, draft = false, english_name = id) => ({
  id,
  data: { order, draft, english_name },
});

describe('publishedPlants', () => {
  test('drops drafts and sorts by order', () => {
    const result = publishedPlants([
      plant('sage', 3),
      plant('hidden', 0, true),
      plant('yarrow', 1),
      plant('echinacea', 2),
    ]);
    expect(result.map((p) => p.id)).toEqual(['yarrow', 'echinacea', 'sage']);
  });

  test('breaks order ties by English name', () => {
    const result = publishedPlants([
      plant('b', 1, false, 'Milkweed'),
      plant('a', 1, false, 'Echinacea'),
    ]);
    expect(result.map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('plantHref and plantUrl', () => {
  test('href has a trailing slash so it matches the static build', () => {
    expect(plantHref('wild-bergamot')).toBe('/plants/wild-bergamot/');
  });

  test('url joins the site origin without doubling slashes', () => {
    expect(plantUrl('https://lakota-plants.netlify.app/', 'yarrow')).toBe(
      'https://lakota-plants.netlify.app/plants/yarrow/',
    );
    expect(plantUrl('https://lakota-plants.netlify.app', 'yarrow')).toBe(
      'https://lakota-plants.netlify.app/plants/yarrow/',
    );
  });
});

describe('checkboxName', () => {
  test('gives each plant its own Netlify field name with no hyphens', () => {
    expect(checkboxName('wild-bergamot')).toBe('plant_wild_bergamot');
  });
});

describe('itemsForPlant', () => {
  test('returns published recipes that reference the plant', () => {
    const recipes = [
      { id: 'salad', data: { draft: false, plants: [{ collection: 'plants', id: 'milkweed' }] } },
      { id: 'tea', data: { draft: false, plants: [{ collection: 'plants', id: 'sage' }] } },
      { id: 'secret', data: { draft: true, plants: [{ collection: 'plants', id: 'milkweed' }] } },
    ];
    expect(itemsForPlant(recipes, 'milkweed').map((r) => r.id)).toEqual(['salad']);
  });
});
