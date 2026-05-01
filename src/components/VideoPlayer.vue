<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { VideoLink } from '@/types/song'
import { parseVideoEmbed, platformLabel } from '@/composables/useVideoEmbed'

const props = defineProps<{
  videos: VideoLink[]
}>()

const { t } = useI18n()
const idx = ref(0)
const iframeFailed = ref(false)

watch(
  () => props.videos,
  (next) => {
    if (idx.value >= next.length) idx.value = 0
    iframeFailed.value = false
  },
)

watch(idx, () => {
  iframeFailed.value = false
})

const validVideos = computed(() => props.videos.filter((v) => v.url && v.url.trim()))
const current = computed(() => validVideos.value[idx.value])
const parsed = computed(() => (current.value ? parseVideoEmbed(current.value.url) : null))
const showIframe = computed(() => !!parsed.value?.embedUrl && !iframeFailed.value)
const aspectClass = computed(() =>
  parsed.value?.aspect === '9:16' ? 'aspect-[9/16] max-h-[60vh]' : 'aspect-video',
)
const containerWidthClass = computed(() =>
  parsed.value?.aspect === '9:16' ? 'mx-auto w-auto' : 'w-full',
)

const prevIdx = computed(() => {
  const len = validVideos.value.length
  return len ? (idx.value - 1 + len) % len : 0
})
const nextIdx = computed(() => {
  const len = validVideos.value.length
  return len ? (idx.value + 1) % len : 0
})
const prevPlatformLabel = computed(() => {
  const v = validVideos.value[prevIdx.value]
  return v ? platformLabel(parseVideoEmbed(v.url).platform) : ''
})
const nextPlatformLabel = computed(() => {
  const v = validVideos.value[nextIdx.value]
  return v ? platformLabel(parseVideoEmbed(v.url).platform) : ''
})
const currentPlatformLabel = computed(() =>
  parsed.value ? platformLabel(parsed.value.platform) : '',
)

function prev() {
  idx.value = (idx.value - 1 + validVideos.value.length) % validVideos.value.length
}
function next() {
  idx.value = (idx.value + 1) % validVideos.value.length
}
</script>

<template>
  <div v-if="validVideos.length && parsed" class="space-y-2">
    <div class="flex items-center gap-2">
      <button
        v-if="validVideos.length > 1"
        type="button"
        class="flex flex-col items-center gap-0.5 shrink-0"
        :aria-label="t('detail.prevVideo')"
        @click="prev"
      >
        <span class="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink shadow-soft transition hover:bg-blush">◀</span>
        <span class="text-[10px] leading-none text-ink/55">{{ prevPlatformLabel }}</span>
      </button>

      <div :class="['relative overflow-hidden rounded-2xl bg-ink/10 shadow-soft', aspectClass, containerWidthClass]">
        <Transition name="vid-fade" mode="out-in">
          <div :key="current!.url + ':' + idx" class="absolute inset-0">
            <iframe
              v-if="showIframe"
              :src="parsed.embedUrl"
              class="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              @error="iframeFailed = true"
            />
            <!-- 埋め込み不可（Douyin / 短縮URL / その他）：エリア全体を外部リンクボタンに -->
            <a
              v-else
              :href="parsed.originalUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-blush/45 to-cotton/45 p-4 text-center text-ink transition hover:from-blush/65 hover:to-cotton/65"
            >
              <span class="grid h-14 w-14 place-items-center rounded-full bg-white/85 text-2xl shadow-pop transition group-hover:scale-105">▶</span>
              <span class="font-display text-base">
                {{ t('detail.watchOn', { platform: currentPlatformLabel || t('detail.openOriginal') }) }}
              </span>
              <span class="text-xs text-ink/55">↗</span>
            </a>
          </div>
        </Transition>
      </div>

      <button
        v-if="validVideos.length > 1"
        type="button"
        class="flex flex-col items-center gap-0.5 shrink-0"
        :aria-label="t('detail.nextVideo')"
        @click="next"
      >
        <span class="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink shadow-soft transition hover:bg-blush">▶</span>
        <span class="text-[10px] leading-none text-ink/55">{{ nextPlatformLabel }}</span>
      </button>
    </div>

    <!-- 現在再生中のプラットフォーム + ラベル -->
    <Transition name="vid-fade" mode="out-in">
      <div
        :key="idx + ':platform'"
        class="flex flex-wrap items-center justify-center gap-2 text-center"
      >
        <span class="font-display text-sm text-ink">{{ currentPlatformLabel }}</span>
        <span v-if="current!.label" class="font-handwritten text-sm text-ink/70">
          — {{ current!.label }}
        </span>
      </div>
    </Transition>

    <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/70">
      <div class="flex items-center gap-2">
        <template v-if="validVideos.length > 1">
          <span class="flex gap-1">
            <span
              v-for="(_, i) in validVideos"
              :key="i"
              class="h-1.5 w-1.5 rounded-full transition-colors"
              :class="i === idx ? 'bg-rose' : 'bg-ink/30'"
            />
          </span>
          <span>{{ idx + 1 }} / {{ validVideos.length }}</span>
        </template>
      </div>
      <a
        :href="parsed.originalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-rose underline-offset-2 hover:underline"
      >
        🔗 {{ t('detail.openOriginal') }}
      </a>
    </div>
  </div>
</template>

<style scoped>
/* 動画切替時のフェードトランジション */
.vid-fade-enter-active,
.vid-fade-leave-active {
  transition: opacity 220ms ease, transform 260ms cubic-bezier(0.34, 1.2, 0.64, 1);
}
.vid-fade-enter-from {
  opacity: 0;
  transform: scale(0.97);
}
.vid-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
