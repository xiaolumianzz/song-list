<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ViewMode } from '@/composables/useViewMode'

defineProps<{ mode: ViewMode }>()
defineEmits<{ (e: 'update:mode', v: ViewMode): void }>()
const { t } = useI18n()
</script>

<template>
  <div class="inline-flex items-center gap-1 rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 p-1 shadow-glass-chip">
    <button
      type="button"
      class="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition"
      :class="mode === 'grid' ? 'bg-sakura text-white shadow-pop' : 'text-ink/70 hover:bg-blush'"
      :aria-label="t('view.grid')"
      @click="$emit('update:mode', 'grid')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
      <span>{{ t('view.grid') }}</span>
    </button>
    <button
      type="button"
      class="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition"
      :class="mode === 'list' ? 'bg-sakura text-white shadow-pop' : 'text-ink/70 hover:bg-blush'"
      :aria-label="t('view.list')"
      @click="$emit('update:mode', 'list')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
      <span>{{ t('view.list') }}</span>
    </button>
  </div>
</template>
