<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { SortKey } from '@/composables/useFilter'
import { SORT_KEYS } from '@/composables/useFilter'

const props = defineProps<{
  sortKey: SortKey
  sortReverse: boolean
}>()

const emit = defineEmits<{
  (e: 'update:sortKey', v: SortKey): void
  (e: 'update:sortReverse', v: boolean): void
}>()

const { t } = useI18n()

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:sortKey', target.value as SortKey)
}

function toggleReverse() {
  emit('update:sortReverse', !props.sortReverse)
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span class="text-xs text-ink/60">{{ t('sort.label') }}</span>
    <select
      :value="sortKey"
      class="rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 px-3 py-1 text-xs text-ink shadow-glass-chip hover:from-white/65 hover:to-white/25 focus:border-sakura focus:outline-none focus:ring-2 focus:ring-sakura/40"
      @change="onChange"
    >
      <option v-for="k in SORT_KEYS" :key="k" :value="k">
        {{ t('sort.' + k) }}
      </option>
    </select>
    <button
      type="button"
      class="grid h-7 w-7 place-items-center rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 text-sm shadow-glass-chip hover:from-white/65 hover:to-white/25"
      :class="sortReverse ? 'text-rose' : 'text-ink/70'"
      :aria-label="sortReverse ? t('sort.desc') : t('sort.asc')"
      :title="sortReverse ? t('sort.desc') : t('sort.asc')"
      :aria-pressed="sortReverse"
      @click="toggleReverse"
    >
      <span aria-hidden="true">{{ sortReverse ? '↓' : '↑' }}</span>
    </button>
  </div>
</template>
