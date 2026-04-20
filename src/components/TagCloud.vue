<script setup lang="ts">
import { computed } from 'vue'
import type { Song } from '@/types/song'

const props = defineProps<{
  songs: Song[]
  selected: string[]
}>()
const emit = defineEmits<{ (e: 'toggle', tag: string): void }>()

interface Bubble {
  tag: string
  count: number
  size: number
}

const bubbles = computed<Bubble[]>(() => {
  const map = new Map<string, number>()
  for (const s of props.songs) for (const t of s.tags) map.set(t, (map.get(t) ?? 0) + 1)
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(([, c]) => c))
  return entries.map(([tag, count]) => ({
    tag,
    count,
    size: 0.85 + (count / max) * 0.85,
  }))
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <button
      v-for="b in bubbles"
      :key="b.tag"
      class="animate-sway rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 px-4 py-1.5 font-display font-medium shadow-glass-chip backdrop-blur-[2px] transition hover:bg-sakura hover:text-white"
      :class="selected.includes(b.tag) ? 'bg-sakura text-white' : 'text-ink'"
      :style="{ fontSize: b.size + 'rem', animationDelay: (b.count * 0.3) + 's' }"
      @click="emit('toggle', b.tag)"
    >
      #{{ b.tag }}
      <span class="ml-1 text-[10px] text-rose/70">×{{ b.count }}</span>
    </button>
  </div>
</template>
