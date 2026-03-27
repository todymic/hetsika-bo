// https://nuxt.com/docs/api/configuration/nuxt-config


import {fileURLToPath} from "node:url";
import {resolve} from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
 runtimeConfig: {
   public: {
     apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://localhost:8000/api/v1',
     googleMapsKey: process.env.GOOGLE_MAPS_API_KEY
   }
 },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt', '@nuxtjs/i18n', '@nuxt/icon'],
  i18n: {
    locales: [
      { code: 'fr', language: 'fr-FR', file: 'fr.json' },
      { code: 'en', language: 'en-US', file: 'en.json' }
    ],
    defaultLocale: 'fr'
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  devServer: {
    https: {
      key: './certs/localhost-key.pem',
      cert: './certs/localhost.pem'
    }
  }
})
