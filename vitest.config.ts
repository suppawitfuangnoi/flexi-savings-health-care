import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['utils/**', 'constants/**'],
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
    },
  },
})
