/**
 * Pure helpers for plant entries. They take plain objects so they can be
 * unit tested without astro:content.
 */

export interface PlantLike {
  id: string;
  data: { order: number; draft: boolean; english_name: string };
}

export interface PlantLinkedLike {
  id: string;
  data: { draft: boolean; plants: { id: string }[] };
}

/** Non-draft plants in display order (order, then English name). */
export function publishedPlants<T extends PlantLike>(plants: readonly T[]): T[] {
  return plants
    .filter((plant) => !plant.data.draft)
    .sort(
      (a, b) =>
        a.data.order - b.data.order ||
        a.data.english_name.localeCompare(b.data.english_name),
    );
}

/** Site-relative link to a plant page, with the trailing slash the static build uses. */
export function plantHref(id: string): string {
  return `/plants/${id}/`;
}

/** Absolute URL for a plant page; this is what goes into the QR code. */
export function plantUrl(site: string, id: string): string {
  return new URL(plantHref(id), site).toString();
}

/** Netlify Forms keeps only one value per field name, so each plant gets its own checkbox name. */
export function checkboxName(id: string): string {
  return `plant_${id.replace(/[^a-z0-9]+/gi, '_')}`;
}

/** Published recipes or stories that reference the given plant. */
export function itemsForPlant<T extends PlantLinkedLike>(items: readonly T[], plantId: string): T[] {
  return items.filter(
    (item) => !item.data.draft && item.data.plants.some((plant) => plant.id === plantId),
  );
}
