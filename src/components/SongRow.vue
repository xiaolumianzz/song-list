<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLikesStore } from '@/stores/likes'
import type { Song } from '@/types/song'
import ScBadge from './ScBadge.vue'

const props = defineProps<{ song: Song }>()
const emit = defineEmits<{ (e: 'open', song: Song): void }>()
const { t } = useI18n()
const likes = useLikesStore()
const liked = computed(() => likes.isLiked(props.song.id))

function open() {
  emit('open', props.song)
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    open()
  }
}
function toggleLike(e: Event) {
  e.stopPropagation()
  likes.toggle(props.song.id)
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    class="row-grid group cursor-pointer rounded-2xl border border-white/80 bg-gradient-to-br from-white/35 via-white/12 to-white/5 px-4 py-2.5 text-left shadow-glass backdrop-blur-[2px] transition hover:-translate-x-0.5 hover:from-white/50 hover:to-white/15 hover:shadow-pop focus:outline-none focus-visible:ring-2 focus-visible:ring-sakura/60"
    @click="open"
    @keydown="onKeydown"
  >
    <!-- 曲名 + いいねボタン -->
    <div class="flex min-w-0 items-center gap-2">
      <button
        type="button"
        class="like-btn grid h-7 w-7 shrink-0 place-items-center rounded-full text-base transition"
        :class="liked
          ? 'bg-sakura text-white shadow-soft'
          : 'bg-white/60 text-sakura opacity-50 hover:bg-blush hover:opacity-100 group-hover:opacity-100'"
        :aria-label="liked ? t('like.remove') : t('like.add')"
        :title="liked ? t('like.remove') : t('like.add')"
        :aria-pressed="liked"
        @click="toggleLike"
      >
        <span aria-hidden="true">{{ liked ? '♥' : '♡' }}</span>
      </button>
      <span class="min-w-0 truncate font-display text-base font-medium text-ink">
        {{ song.title }}
      </span>
    </div>

    <!-- アーティスト -->
    <span class="min-w-0 truncate text-sm text-ink/75">
      {{ song.artist }}
    </span>

    <!-- 言語 -->
    <span
      class="justify-self-start whitespace-nowrap rounded-full bg-blush/80 px-2 py-0.5 text-[10px] font-bold text-ink"
    >
      {{ t('language.' + song.language) }}
    </span>

    <!-- SC -->
    <span class="justify-self-start">
      <ScBadge v-if="song.sc && song.sc > 0" :amount="song.sc" size="sm" />
      <span v-else class="text-xs text-ink/30">—</span>
    </span>

    <!-- タグ + 条件 -->
    <div class="flex min-w-0 flex-wrap items-center gap-1">
      <span
        v-for="tag in song.tags.slice(0, 3)"
        :key="tag"
        class="rounded-full bg-cotton px-2 py-0.5 text-[11px] text-ink/80"
      >
        #{{ tag }}
      </span>
      <span v-if="song.tags.length > 3" class="text-[11px] text-ash">…</span>
      <span
        v-for="c in song.conditions.slice(0, 1)"
        :key="c"
        class="rounded-full border border-sakura/60 bg-white px-2 py-0.5 text-[11px] text-rose"
      >
        ♪ {{ t('condition.' + c) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* 見出し行（SongGrid 内）と同じ grid-template-columns を共有する */
.row-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 2fr)        /* 曲名（先頭にいいねボタン込み） */
    minmax(0, 1.3fr)      /* アーティスト */
    4.5rem                /* 言語 */
    5.5rem                /* SC */
    minmax(0, 2fr);       /* タグ */
  column-gap: 0.75rem;
  align-items: center;
}
.like-btn {
  transform-origin: center;
}
.like-btn:active {
  transform: scale(0.85);
}
</style>
