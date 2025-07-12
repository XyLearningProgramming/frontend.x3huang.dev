export interface SiteConfig {
  name: string
  title: string
  description: string
  url: string
  author: {
    name: string
    email: string
    bio: string
  }
  social: {
    github?: string
    linkedin?: string
    email?: string
  }
  seo: {
    twitterCard: string
    ogType: string
    keywords: string[]
  }
}

export interface BlogConfig {
  title: string
  description: string
  pageDescription: string
}

export const siteConfig: SiteConfig = {
  name: "Xinyu's Digital Space",
  title: "Xinyu's Digital Space",
  description: 'Digital space of Xinyu Huang, featuring tools, blog posts, and future projects',
  url: process.env.NUXT_PUBLIC_SITE_URL || 'https://x3huang.dev',
  author: {
    name: 'Xinyu Huang',
    email: 'contact@x3huang.dev',
    bio: 'Software Developer & Tech Enthusiast'
  },
  social: {
    github: 'https://github.com/XyLearningProgramming',
    linkedin: 'https://linkedin.com/in/xinyu-huang-dev',
    email: 'contact@x3huang.dev'
  },
  seo: {
    twitterCard: 'summary_large_image',
    ogType: 'website',
    keywords: ['Xinyu Huang', 'x3huang', 'software development', 'web development', 'technology', 'blog', 'tools', 'self-hosting']
  }
}

// Helper functions to get dynamic URLs and email addresses
export const getBaseUrl = () => {
  return siteConfig.url
}

export const getContactEmail = () => {
  return siteConfig.author.email
}

export const getHelloEmail = () => {
  const domain = siteConfig.url.replace('https://', '').replace('http://', '')
  return `contact@${domain}`
}

export const blogConfig: BlogConfig = {
  title: "Xinyu's Blog",
  description: 'Blog site of Xinyu Huang, sharing tech insights, self-hosting experience, web development',
  pageDescription: 'Technical articles, insights, and thoughts on my software development journey.'
}

export const getBlogPageTitle = (suffix?: string) => {
  return suffix ? `${suffix} - ${blogConfig.title}` : blogConfig.title
}

export const getBlogPageDescription = () => {
  return `Latest blog posts by ${siteConfig.author.name}. Technical articles, insights, and thoughts on web development, technology, and more.`
}

export const getPageTitle = (page?: string) => {
  return page ? `${page} - ${siteConfig.title}` : siteConfig.title
}

export const getPageMeta = (options: {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}) => {
  return {
    title: options.title || siteConfig.title,
    meta: [
      { name: 'description', content: options.description || siteConfig.description },
      { name: 'keywords', content: siteConfig.seo.keywords.join(', ') },
      { name: 'author', content: siteConfig.author.name },
      { property: 'og:title', content: options.title || siteConfig.title },
      { property: 'og:description', content: options.description || siteConfig.description },
      { property: 'og:type', content: options.type || siteConfig.seo.ogType },
      { property: 'og:url', content: options.url || siteConfig.url },
      { property: 'og:site_name', content: siteConfig.name },
      { property: 'og:image', content: options.image || `${siteConfig.url}/images/profile.png` },
      { name: 'twitter:card', content: siteConfig.seo.twitterCard },
      { name: 'twitter:title', content: options.title || siteConfig.title },
      { name: 'twitter:description', content: options.description || siteConfig.description },
      { name: 'twitter:image', content: options.image || `${siteConfig.url}/images/profile.png` }
    ]
  }
}