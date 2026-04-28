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
      class="animate-popin"
      @open="$emit('open', $event)"
    />
  </div>

  <div v-else class="flex flex-col gap-2">
    <!-- 見出し行：SongRow の grid-template-columns と同じ構造 -->
    <div class="row-header px-4 text-[11px] font-display font-medium uppercase tracking-wide text-ink/50">
      <span>{{ t('list.title') }}</span>
      <span>{{ t('list.artist') }}</span>
      <span>{{ t('list.language') }}</span>
      <span>SC</span>
      <span>{{ t('list.tags') }}</span>
      <span class="justify-self-end" aria-hidden="true">♡</span>
    </div>

    <SongRow
      v-for="s in songs"
      :key="s.id"
      :song="s"
      class="animate-popin"
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
    2rem;
  column-gap: 0.75rem;
  align-items: center;
}
</style>
