<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Song } from '@/types/song'
import type { ViewMode } from '@/composables/useViewMode'
import SongCard from './SongCard.vue'
import SongRow from './SongRow.vue'

defineProps<{ songs: Song[]; mode: ViewMode }>()
defineEmits<{ (e: 'open', song: Song): void }>()

const { t } = useI18n()
</script>

<template>
  <div
    v-if="mode === 'grid'"
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    <SongCard
      v-for="s in songs"
      :key="s.id"
      :song="s"
      @open="$emit('open', $event)"
    />
  </div>

  <div v-else class="flex flex-col gap-2">
    <!-- 見出し行：SongRow の grid-template-columns と同じ構造
         ・border-transparent で行と同じ 1px ぶんを確保（左右のズレ防止）
         ・ピル列は pl-2 で行のピル内テキストと開始位置を揃える -->
    <div class="row-header border border-transparent px-4 pb-1 text-[11px] font-display font-medium uppercase tracking-wide text-ink/50">
      <span class="truncate">{{ t('list.title') }}</span>
      <span class="truncate">{{ t('list.artist') }}</span>
      <span class="pl-2">{{ t('list.language') }}</span>
      <span class="pl-2">{{ t('list.sc') }}</span>
      <span class="truncate pl-2">{{ t('list.tags') }}</span>
      <span class="justify-self-end">{{ t('list.like') }}</span>
    </div>

    <SongRow
      v-for="s in songs"
      :key="s.id"
      :song="s"
      @open="$emit('open', $event)"
    />
  </div>
</template>

<style scoped>
.row-header {
  display: grid;
  grid-template-columns:
    minmax(0, 2fr)
    minmax(0, 1.3fr)
    4.5rem
    5.5rem
    minmax(0, 2fr)
    3.5rem;
  column-gap: 0.75rem;
  align-items: center;
}
</style>
