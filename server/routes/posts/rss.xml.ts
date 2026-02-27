import { Feed } from 'feed'
import { queryCollection } from '@nuxt/content/nitro'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://x3huang.dev'
  const authorName = 'Xinyu Huang'
  const authorEmail = 'contact@x3huang.dev'

  const feed = new Feed({
    title: "Xinyu's Digital Space",
    description: 'Digital space of Xinyu Huang, featuring tools, blog posts, and future projects',
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    image: `${siteUrl}/favicon/favicon-32x32.png`,
    favicon: `${siteUrl}/favicon/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${authorName}`,
    author: {
      name: authorName,
      email: authorEmail,
      link: siteUrl,
    },
  })

  try {
    const posts = await queryCollection(event, 'posts')
      .select('title', 'description', 'date', 'path')
      .where('published', '=', true)
      .order('date', 'DESC')
      .all()

    for (const post of posts) {
      const slug = post.path?.replace('/posts/', '') || ''
      const url = `${siteUrl}/posts/${slug}`

      feed.addItem({
        title: post.title || '',
        id: url,
        link: url,
        description: post.description || '',
        content: post.description || '',
        date: new Date(post.date),
      })
    }
  } catch (e) {
    console.warn('Failed to query blog posts for RSS feed:', e)
  }

  setResponseHeader(event, 'content-type', 'text/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'max-age=600, s-maxage=3600')

  return feed.rss2()
})
