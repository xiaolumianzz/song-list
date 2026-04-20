<script setup lang="ts">
import { useI18n } from 'vue-i18n'
defineProps<{ total: number; visible: number }>()
const { t } = useI18n()
</script>

<template>
  <div class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 px-4 py-1.5 shadow-glass-chip backdrop-blur-[2px]">
    <span class="text-sakura" aria-hidden="true">♪</span>
    <span v-if="visible === total" class="font-display text-sm text-ink">
      {{ t('count.total', { n: total }) }}
    </span>
    <span v-else class="font-display text-sm text-ink">
      {{ t('count.filtered', { shown: visible, n: total }) }}
    </span>
  </div>
</template>
