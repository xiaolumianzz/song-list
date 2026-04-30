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
    class="song-card-root group relative flex h-full cursor-pointer flex-col gap-2 rounded-3xl border border-white/80 bg-gradient-to-br from-white/35 via-white/15 to-white/5 p-4 text-left shadow-glass transition hover:-translate-y-1 hover:from-white/50 hover:to-white/15 hover:shadow-pop focus:outline-none focus-visible:ring-2 focus-visible:ring-sakura/60"
    @click="open"
    @keydown="onKeydown"
  >
    <!-- 右上：SC バッジ + メンバー限定バッジ（横並びでフローティング） -->
    <div class="absolute -top-2 right-3 flex items-center gap-1">
      <MembersBadge :conditions="song.conditions" size="sm" />
      <ScBadge
        v-if="song.sc && song.sc > 0"
        :amount="song.sc"
        size="sm"
      />
    </div>
    <!-- 左上：新着バッジ（フローティング） -->
    <NewBadge :added-at="song.addedAt" class="absolute -top-2 left-3" size="sm" />

    <div class="flex items-start justify-between gap-2">
      <h3 class="font-display text-lg leading-snug text-ink">{{ song.title }}</h3>
      <div class="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          class="like-btn grid h-7 w-7 place-items-center rounded-full text-base transition"
          :class="liked
            ? 'bg-sakura text-white shadow-soft'
            : 'bg-white/70 text-sakura opacity-60 hover:bg-blush hover:opacity-100 group-hover:opacity-100'"
          :aria-label="liked ? t('like.remove') : t('like.add')"
          :title="liked ? t('like.remove') : t('like.add')"
          :aria-pressed="liked"
          @click="toggleLike"
        >
          <span aria-hidden="true">{{ liked ? '♥' : '♡' }}</span>
        </button>
        <span class="rounded-full bg-blush/80 px-2 py-0.5 text-[10px] font-bold text-ink">
          {{ t('language.' + song.language) }}
        </span>
      </div>
    </div>
    <p class="text-sm text-ink/70">{{ song.artist }}</p>
    <div v-if="song.tags.length" class="flex flex-wrap gap-1.5 pt-1">
      <span
        v-for="tag in song.tags"
        :key="tag"
        class="rounded-full bg-cotton px-2 py-0.5 text-[11px] text-ink/80"
      >
        #{{ tagDisplay(tag, locale, songsStore.tagDict) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* 画面外のカードは描画をスキップしてスクロール時の GPU 負荷を減らす。
   contain-intrinsic-size はカード一個ぶんの目安サイズ（描画スキップ時の高さ予約）。 */
.song-card-root {
  content-visibility: auto;
  contain-intrinsic-size: auto 220px;
}
.like-btn {
  transform-origin: center;
}
.like-btn:active {
  transform: scale(0.85);
}
</style>
