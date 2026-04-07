<template>
  <div class="min-h-screen flex flex-col items-center justify-center" style="background:#F5F5F5">
    <div class="bkk-card p-8 max-w-sm w-full mx-4 text-center space-y-4">
      <span class="text-5xl">🚧</span>
      <h1 class="text-xl" style="color:#1A2B4A">
        {{ error?.statusCode === 404 ? 'ไม่พบหน้านี้' : 'เกิดข้อผิดพลาด' }}
      </h1>
      <p class="text-sm" style="color:#666666">
        {{ error?.message || 'กรุณาลองใหม่อีกครั้ง' }}
      </p>
      <NuxtLink
        to="/"
        class="inline-block px-5 py-2.5 rounded-xl bla-gradient text-white text-sm font-semibold"
      >
        กลับหน้าหลัก
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
</script>
