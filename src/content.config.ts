import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const AUTORES = [
  'transforme',
  'André Kind',
  'Emerson Santiago',
  'Wesley Cavalheiro',
  'Rafael Bandeira',
] as const;

export const CATEGORIAS = [
  'Tecnologia',
  'Pessoas',
  'Transformação',
  'Conheça a plataforma',
] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z
      .object({
        titulo: z.string().max(90),
        resumo: z.string().min(60).max(200),
        data: z.date(),
        autor: z.enum(AUTORES),
        categoria: z.enum(CATEGORIAS),
        capa: image().optional(),
        capaAlt: z.string().optional(),
        rascunho: z.boolean().default(false),
      })
      .refine((d) => !d.capa || !!d.capaAlt, {
        message: 'Post com capa precisa de capaAlt para acessibilidade',
        path: ['capaAlt'],
      }),
});

export const collections = { blog };
