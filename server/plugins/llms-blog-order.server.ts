import type { H3Event } from 'h3'
import { withBase } from 'ufo'
import { queryCollection } from '@nuxt/content/nitro'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('llms:generate', async (event, options) => {
    const blogSection = options.sections?.find(
      (s: { contentCollection?: string }) => s.contentCollection === 'blogs'
    )
    if (!blogSection) return

    // Re-query with date so we can sort newest first (content plugin does not order by date)
    const query = queryCollection(event, 'blogs')
      .select('path', 'title', 'seo', 'description', 'date')
      .where('path', 'NOT LIKE', '%/.navigation')
      .where('published', '=', true)
    const docs = (await query.all()) as Array<{ path: string; title?: string; description?: string; date?: string; seo?: { title?: string; description?: string } }>

    docs.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())

    blogSection.links = docs.map((doc) => ({
      title: doc.title ?? doc.seo?.title ?? '',
      description: doc.description ?? doc.seo?.description ?? '',
      href: withBase(doc.path, options.domain),
    }))
  })
})
