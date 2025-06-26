// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
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
    }
  },
  prometheus: {
    verbose: false,
    prometheusPath: "/metrics",
    prefix: "",
  },
  content: {
    ...(process.env.POSTGRES_URL
      ? {
        database: {
          type: 'postgres',
          url: process.env.POSTGRES_URL,
        },
      }
      : {}),        // https://content.nuxtjs.org/api/configuration
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