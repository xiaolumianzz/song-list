<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Song } from '@/types/song'

defineProps<{ song: Song }>()
defineEmits<{ (e: 'open', song: Song): void }>()

const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="group relative flex h-full flex-col gap-2 rounded-3xl border border-white/80 bg-gradient-to-br from-white/35 via-white/15 to-white/5 p-4 text-left shadow-glass backdrop-blur-[2px] transition hover:-translate-y-1 hover:from-white/50 hover:to-white/15 hover:shadow-pop"
    @click="$emit('open', song)"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-display text-lg leading-snug text-ink">{{ song.title }}</h3>
      <span class="shrink-0 rounded-full bg-blush/80 px-2 py-0.5 text-[10px] font-bold text-ink">
        {{ t('language.' + song.language) }}
      </span>
    </div>
    <p class="text-sm text-ink/70">{{ song.artist }}</p>
    <div v-if="song.tags.length" class="flex flex-wrap gap-1.5 pt-1">
      <span
        v-for="tag in song.tags"
        :key="tag"
        class="rounded-full bg-cotton px-2 py-0.5 text-[11px] text-ink/80"
      >
        #{{ tag }}
      </span>
    </div>
    <div v-if="song.conditions.length" class="flex flex-wrap gap-1.5 pt-1">
      <span
        v-for="c in song.conditions"
        :key="c"
        class="rounded-full border border-sakura/60 bg-white px-2 py-0.5 text-[11px] text-rose"
      >
        ♪ {{ t('condition.' + c) }}
      </span>
    </div>
    <span
      class="pointer-events-none absolute right-3 top-3 text-sakura opacity-0 transition group-hover:opacity-100"
      aria-hidden="true"
    >♡</span>
  </button>
</template>
