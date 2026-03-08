// https://nuxt.com/docs/api/configuration/nuxt-config


export default defineNuxtConfig({
 runtimeConfig: {
   public: {
     apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://localhost:8000/api/v1'
   }
 },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt', '@nuxtjs/i18n'],

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