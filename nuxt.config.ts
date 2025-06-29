// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: "Xinyu's Blog",
      meta: [
        {
          name: 'description',
          content: 'Blog site of Xinyu Huang, x3huang, sharing tech insights, self-hosting experience, web development',
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
    '@nuxtjs/tailwindcss',
  ],
  css: ['/assets/css/main.css'],
  ssr: true,
  experimental: {
    payloadExtraction: false
  },
  router: {
    options: {
      strict: false
    }
  },
  sourcemap: false,
  // fonts: {
  //   families: [
  //     {
  //       name: 'Roboto',
  //       weights: [400, 700],
  //       // styles, subsets, etc., if needed
  //     }
  //   ],
  //   providers: {
  //     google: false,
  //     googleicons: false,
  //   }
  // },
  nitro: {
    preset: "node-server",
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
  content: {
    database: {
      type: 'postgres',
      url: process.env.POSTGRES_URL || "",
    }, // https://content.nuxtjs.org/api/configuration
    // @ts-ignore - highlight config is valid but not in types
    highlight: {
      theme: 'github-dark',
      preload: ['java', 'javascript']
    },
    markdown: {
      // https://github.com/rehypejs/rehype-external-links
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
    // Component mapping to fix inline code issue
    renderer: {
      alias: {
        code: 'ProseCodeInline',  // Map inline code to ProseCodeInline
        pre: 'ProsePre'          // Map pre blocks to ProsePre
      }
    }
  },
})