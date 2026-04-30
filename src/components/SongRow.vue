<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLikesStore } from '@/stores/likes'
import { useSongsStore } from '@/stores/songs'
import { tagDisplay } from '@/composables/useTagDict'
import type { Song } from '@/types/song'
import ScBadge from './ScBadge.vue'
import NewBadge from './NewBadge.vue'
import MembersBadge from './MembersBadge.vue'
import VideoPlatformMarks from './VideoPlatformMarks.vue'

const props = defineProps<{ song: Song }>()
const emit = defineEmits<{ (e: 'open', song: Song): void }>()
const { t, locale } = useI18n()
const likes = useLikesStore()
const songsStore = useSongsStore()
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
    class="row-grid group cursor-pointer rounded-2xl border border-white/80 bg-gradient-to-br from-white/35 via-white/12 to-white/5 px-4 py-2.5 text-left shadow-glass transition hover:-translate-x-0.5 hover:from-white/50 hover:to-white/15 hover:shadow-pop focus:outline-none focus-visible:ring-2 focus-visible:ring-sakura/60"
    @click="open"
    @keydown="onKeydown"
  >
    <!-- 曲名 + 新着バッジ -->
    <span class="flex min-w-0 items-center gap-1.5">
      <NewBadge :added-at="song.addedAt" size="sm" />
      <span class="min-w-0 truncate font-display text-base font-medium text-ink">
        {{ song.title }}
      </span>
    </span>

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

    <!-- SC + メンバー限定バッジ -->
    <span class="flex min-w-0 flex-wrap items-center gap-1 justify-self-start">
      <ScBadge v-if="song.sc && song.sc > 0" :amount="song.sc" size="sm" />
      <MembersBadge :conditions="song.conditions" size="sm" />
      <span
        v-if="!(song.sc && song.sc > 0) && !song.conditions?.includes('members-only')"
        class="text-xs text-ink/30"
      >—</span>
    </span>

    <!-- タグ -->
    <div class="flex min-w-0 flex-wrap items-center gap-1">
      <span
        v-for="tag in song.tags.slice(0, 3)"
        :key="tag"
        class="rounded-full bg-cotton px-2 py-0.5 text-[11px] text-ink/80"
      >
        #{{ tagDisplay(tag, locale, songsStore.tagDict) }}
      </span>
      <span v-if="song.tags.length > 3" class="text-[11px] text-ash">…</span>
    </div>

    <!-- 動画プラットフォームマーク（いいねの左） -->
    <VideoPlatformMarks :videos="song.videos" class="justify-self-end" />

    <!-- いいねボタン（右端） -->
    <button
      type="button"
      class="like-btn grid h-7 w-7 shrink-0 place-items-center justify-self-end rounded-full text-base transition"
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
  </div>
</template>

<style scoped>
/* 見出し行（SongGrid 内）と同じ grid-template-columns を共有する */
.row-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 2fr)        /* 曲名 */
    minmax(0, 1.3fr)      /* アーティスト */
    4.5rem                /* 言語 */
    9rem                  /* SC + メンバー限定バッジ */
    minmax(0, 2fr)        /* タグ */
    4.5rem                /* 動画プラットフォームマーク */
    3.5rem;               /* いいね（右端） */
  column-gap: 0.75rem;
  align-items: center;
  /* 画面外の行は描画をスキップしてスクロール時の負荷軽減 */
  content-visibility: auto;
  contain-intrinsic-size: auto 52px;
}
.like-btn {
  transform-origin: center;
}
.like-btn:active {
  transform: scale(0.85);
}
</style>
