// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    sqlitePath: process.env.SQLITE_PATH || './data/notes.sqlite',
  },
  nitro: {
    externals: {
      external: ['better-sqlite3'],
    },
  },
})
