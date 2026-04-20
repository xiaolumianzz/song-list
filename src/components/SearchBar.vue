<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="relative">
    <input
      v-model="model"
      type="search"
      :placeholder="t('home.searchPlaceholder')"
      class="w-full rounded-full border border-white/80 bg-gradient-to-b from-white/40 to-white/10 px-12 py-3 font-display text-lg text-ink shadow-glass backdrop-blur-[2px] placeholder:text-ash/70 focus:from-white/60 focus:border-sakura focus:outline-none focus:ring-4 focus:ring-sakura/30"
    />
    <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl" aria-hidden="true">🔍</span>
    <button
      v-if="model"
      class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-blush/80 px-2 py-0.5 text-xs text-ink hover:bg-sakura"
      @click="model = ''"
    >
      ✕
    </button>
  </div>
</template>
