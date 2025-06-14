// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@artmizu/nuxt-prometheus',
  ],
  fonts: {
    families: [
      {
        name: 'Roboto',
        weights: [400, 700],
        // styles, subsets, etc., if needed
      }
    ],
    providers: {
      google: false,
      googleicons: false,
    }
  },
  prometheus: {
    verbose: false,
    prometheusPath: "/metrics",
    prefix: "",
  },
  ...(process.env.POSTGRES_URL
    ? {
      database: {
        type: 'postgres',
        url: process.env.POSTGRES_URL,
      },
    }
    : {}),
})