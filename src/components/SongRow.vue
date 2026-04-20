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
    class="group flex w-full items-center gap-3 rounded-2xl border border-white/80 bg-gradient-to-br from-white/35 via-white/12 to-white/5 px-4 py-2.5 text-left shadow-glass backdrop-blur-[2px] transition hover:-translate-x-0.5 hover:from-white/50 hover:to-white/15 hover:shadow-pop"
    @click="$emit('open', song)"
  >
    <span class="shrink-0 rounded-full bg-blush/80 px-2 py-0.5 text-[10px] font-bold text-ink">
      {{ t('language.' + song.language) }}
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-baseline gap-x-2">
        <span class="truncate font-display text-base font-medium text-ink">{{ song.title }}</span>
        <span class="truncate text-sm text-ink/70">/ {{ song.artist }}</span>
      </div>
    </div>

    <div class="hidden items-center gap-1 sm:flex">
      <span
        v-for="tag in song.tags.slice(0, 3)"
        :key="tag"
        class="rounded-full bg-cotton px-2 py-0.5 text-[11px] text-ink/80"
      >
        #{{ tag }}
      </span>
      <span v-if="song.tags.length > 3" class="text-[11px] text-ash">…</span>
    </div>

    <div v-if="song.conditions.length" class="hidden items-center gap-1 md:flex">
      <span
        v-for="c in song.conditions.slice(0, 2)"
        :key="c"
        class="rounded-full border border-sakura/60 bg-white px-2 py-0.5 text-[11px] text-rose"
      >
        ♪ {{ t('condition.' + c) }}
      </span>
    </div>

    <span class="shrink-0 text-sakura opacity-0 transition group-hover:opacity-100" aria-hidden="true">♡</span>
  </button>
</template>
