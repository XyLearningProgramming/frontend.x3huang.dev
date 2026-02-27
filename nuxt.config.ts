// https://nuxt.com/docs/api/configuration/nuxt-config
import { siteConfig, getBaseUrl } from './site.config'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      chattyApiUrl: '/api/v1/chatty/chat',
    },
  },
  app: {
    head: {
      title: siteConfig.title,
      meta: [
        {
          name: 'description',
          content: siteConfig.description,
        }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon/favicon.ico'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon/favicon-32x32.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon/favicon-16x16.png'
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/favicon/apple-touch-icon.png'
        },
        {
          rel: 'manifest',
          href: '/favicon/site.webmanifest'
        }
      ]
    }
  },
  modules: [
    '@artmizu/nuxt-prometheus',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    'nuxt-llms',
    'motion-v/nuxt',
    '@nuxtjs/google-fonts',
  ],
  css: ['/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  googleFonts: {
    families: {
      'Space Grotesk': [600, 700],
      'Inter': [400, 500, 600],
      'JetBrains Mono': [400],
    },
    display: 'swap',
  },
  ssr: true,
  experimental: {
    payloadExtraction: false
  },
  router: {
    options: {
      strict: false
    }
  },
  routeRules: {
    '/metrics': {
      prerender: false,
      headers: {
        'cache-control': 'no-cache',
      },
    },
  },
  sourcemap: false,
  nitro: {
    preset: "node-server",
    devProxy: {
      '/api/v1/chatty': {
        target: 'http://localhost:8080/api/v1/chatty',
        changeOrigin: true,
      },
    },
    routeRules: {
      '/.well-known/**': { headers: { 'Access-Control-Allow-Origin': '*' } }
    },
    externals: {
      traceInclude: [
        '@artmizu/nuxt-prometheus',
      ]
    }
  },
  prometheus: {
    verbose: false,
    prometheusPath: "/metrics",
    prefix: "",
  },
  image: {
    format: ['webp', 'avif', 'jpeg', 'jpg', 'png'],
    quality: 85,
    dir: 'public',
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    provider: 'ipx'
  },
  content: {
    database: {
      type: 'postgres',
      url: process.env.POSTGRES_URL || "postgres_url_default",
    },
    build: {
      markdown: {
        highlight: {
          theme: 'catppuccin-mocha',
          langs: ['csharp', 'c', 'javascript', 'java', 'yaml'],
        },
      },
    },
    markdown: {
      rehypePlugins: [
        [
          'rehype-external-links',
          {
            target: '_blank',
            rel: 'noopener noreferer'
          }
        ]
      ]
    },
    renderer: {
      alias: {
        code: 'ProseCodeInline',
        pre: 'ProsePre'
      }
    }
  },
  // Ref: https://content.nuxt.com/docs/advanced/llms
  llms: {
    domain: getBaseUrl(),
    title: siteConfig.title,
    description: siteConfig.description,
    sections: [
      {
        title: `Blog Posts - ${siteConfig.author.name}`,
        description: `Latest blog posts by ${siteConfig.author.name}.`,
        contentCollection: "blogs",
        contentFilters: [
          { field: 'published', operator: '=', value: true }
        ]
      }
    ]
  },
})
