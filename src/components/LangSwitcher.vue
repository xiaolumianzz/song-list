<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale, type UiLocale } from '@/i18n'
const { locale } = useI18n()

const options: { value: UiLocale; label: string }[] = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
]

function onChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value as UiLocale
  setLocale(v)
}
</script>

<template>
  <label class="inline-flex items-center gap-2 text-sm text-ink/80">
    <span aria-hidden="true">🌸</span>
    <span class="font-display font-medium">Language</span>
    <select
      :value="locale"
      @change="onChange"
      class="rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 px-3 py-1 shadow-glass-chip backdrop-blur-[2px] focus:outline-none focus:ring-2 focus:ring-sakura"
    >
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
  </label>
</template>
