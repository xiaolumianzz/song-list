<script setup lang="ts">
import type { Song } from '@/types/song'
import type { ViewMode } from '@/composables/useViewMode'
import SongCard from './SongCard.vue'
import SongRow from './SongRow.vue'

defineProps<{ songs: Song[]; mode: ViewMode }>()
defineEmits<{ (e: 'open', song: Song): void }>()
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
    <SongRow
      v-for="s in songs"
      :key="s.id"
      :song="s"
      class="animate-popin"
      @open="$emit('open', $event)"
    />
  </div>
</template>
