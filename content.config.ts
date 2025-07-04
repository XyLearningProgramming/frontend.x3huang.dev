import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blogs: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        title: z.string().optional(),
        headline: z.string().optional(),
        description: z.string().optional(),
        date: z.string(),
        published: z.boolean().default(true),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
        author: z.string().optional(),
        readTime: z.number().optional()
      })
    }),
    pages: defineCollection({
      type: 'page',
      source: 'pages/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        published: z.boolean().default(true),
        tags: z.array(z.string()).optional(),
      })
    })
  }
})
