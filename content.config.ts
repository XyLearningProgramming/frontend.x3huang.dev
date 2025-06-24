import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        headline: z.string(),
        excerpt: z.string().optional(),
        date: z.string(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional()
      })
    })
  }
})
