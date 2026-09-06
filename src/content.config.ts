import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'accent must be a 6-digit hex color like #7C9C63');

// Optional text fields: the CMS may save an empty string, treat it as absent.
const optionalText = z
  .string()
  .optional()
  .transform((value) => (value && value.trim() ? value : undefined));

const plants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/plants' }),
  schema: ({ image }) =>
    z.object({
      lakota_name: z.string().min(1, 'lakota_name is required'),
      english_name: z.string().min(1, 'english_name is required'),
      scientific_name: optionalText,
      phonetic: optionalText,
      audio: optionalText,
      hero: image().optional(),
      accent: hexColor,
      order: z.number().int().default(0),
      draft: z.boolean().default(false),
      uses: z.array(z.string()).default([]),
      cautions: z.array(z.string()).default([]),
      sources: optionalText,
    }),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      plants: z.array(reference('plants')).default([]),
      contributor: optionalText,
      affiliation: optionalText,
      ingredients: z.array(z.string()).default([]),
      image: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      plants: z.array(reference('plants')).default([]),
      contributor: optionalText,
      affiliation: optionalText,
      date: z.coerce.date().optional(),
      image: image().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { plants, recipes, stories };
