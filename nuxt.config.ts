// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  // Auto-import from these directories
  imports: {
    dirs: ['stores', 'composables', 'utils', 'constants'],
  },

  // TypeScript strict mode
  typescript: {
    strict: true,
    typeCheck: false, // run manually with `nuxt typecheck`
  },

  // Tailwind handled by @nuxtjs/tailwindcss
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    exposeConfig: false,
  },

  // Vite config for dev experience
  vite: {
    optimizeDeps: {
      include: ['chart.js', 'vue-chartjs'],
    },
  },

  compatibilityDate: '2024-07-01',
})
