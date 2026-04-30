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
        class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 text-ink shadow-soft hover:bg-blush"
        :aria-label="t('detail.prevVideo')"
        @click="prev"
      >
        ◀
      </button>

      <div :class="['relative overflow-hidden rounded-2xl bg-ink/10 shadow-soft', aspectClass, containerWidthClass]">
        <iframe
          v-if="showIframe"
          :key="current!.url + ':' + idx"
          :src="parsed.embedUrl"
          class="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          @error="iframeFailed = true"
        />
        <!-- 埋め込み非対応 / iframe 失敗：外部リンクにフォールバック -->
        <div
          v-else
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blush/40 to-cotton/40 p-4 text-center text-sm text-ink/80"
        >
          <span class="font-display text-lg">{{ platformLabel(parsed.platform) || '🔗' }}</span>
          <p>{{ t('detail.embedUnavailable') }}</p>
          <a
            :href="parsed.originalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-full bg-sakura px-3 py-1 text-xs text-white hover:bg-rose"
          >
            {{ t('detail.openOriginal') }} ↗
          </a>
        </div>
      </div>

      <button
        v-if="validVideos.length > 1"
        type="button"
        class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 text-ink shadow-soft hover:bg-blush"
        :aria-label="t('detail.nextVideo')"
        @click="next"
      >
        ▶
      </button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/70">
      <div class="flex items-center gap-2">
        <template v-if="validVideos.length > 1">
          <span class="flex gap-1">
            <span
              v-for="(_, i) in validVideos"
              :key="i"
              class="h-1.5 w-1.5 rounded-full"
              :class="i === idx ? 'bg-rose' : 'bg-ink/30'"
            />
          </span>
          <span>{{ idx + 1 }} / {{ validVideos.length }}</span>
        </template>
        <span v-if="current!.label" class="font-handwritten text-ink/85">
          {{ current!.label }}
        </span>
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
