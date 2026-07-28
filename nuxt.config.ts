import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    sqlitePath: process.env.NUXT_SQLITE_PATH || process.env.SQLITE_PATH || './data/notes.sqlite',
  },
  nitro: {
    externals: {
      external: ['better-sqlite3'],
    },
  },
})
