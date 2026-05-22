import { defineNuxtConfig } from 'nuxt/config'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { host: '0.0.0.0', port: 3007 },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://10.2.10.11:3008'
    }
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'la', name: 'ລາວ', file: 'la.json' }
    ],

    langDir: 'locales',
    defaultLocale: 'la',
    strategy: 'prefix_and_default',
    vueI18n: './i18n.config.ts'
  },
  css: [
    '~/assets/css/main.css'
  ],
  plugins: [
    '~/plugins/vuetify.ts'
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})