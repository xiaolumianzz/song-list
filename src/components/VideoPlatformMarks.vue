<script setup lang="ts">
import { computed } from 'vue'
import type { VideoLink } from '@/types/song'
import { platformLabel, videoPlatforms } from '@/composables/useVideoEmbed'

const props = defineProps<{
  videos?: VideoLink[]
}>()

const platforms = computed(() => videoPlatforms(props.videos))
</script>

<template>
  <!-- 動画が無くても空 span を残してグリッドの列ズレを防ぐ -->
  <span class="flex items-center gap-1">
    <!-- YouTube -->
    <span
      v-if="platforms.includes('youtube')"
      class="video-mark"
      :title="platformLabel('youtube')"
      :aria-label="platformLabel('youtube')"
    >
      <svg viewBox="0 0 24 24" class="mark-icon">
        <path
          fill="currentColor"
          d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"
        />
      </svg>
    </span>

    <!-- BiliBili -->
    <span
      v-if="platforms.includes('bilibili')"
      class="video-mark"
      :title="platformLabel('bilibili')"
      :aria-label="platformLabel('bilibili')"
    >
      <svg viewBox="0 0 24 24" class="mark-icon">
        <path
          fill="currentColor"
          d="M17.8 3.3 16.4 4.7 14.1 2.4h-4.2L7.6 4.7 6.2 3.3 4.8 4.7 6.2 6.1H4a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-2.2l1.4-1.4-1.4-1.4ZM4 8.1h16c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1Z"
        />
        <circle cx="8" cy="13" r="1.5" fill="currentColor" />
        <circle cx="16" cy="13" r="1.5" fill="currentColor" />
      </svg>
    </span>

    <!-- TikTok -->
    <span
      v-if="platforms.includes('tiktok')"
      class="video-mark"
      :title="platformLabel('tiktok')"
      :aria-label="platformLabel('tiktok')"
    >
      <svg viewBox="0 0 24 24" class="mark-icon">
        <path
          fill="currentColor"
          d="M19.3 7.2a5.5 5.5 0 0 1-3.6-1.3 5.6 5.6 0 0 1-1.8-2.7V3h-3v12.4a2.8 2.8 0 1 1-2-2.7V9.5a5.8 5.8 0 0 0-.9-.1 5.9 5.9 0 1 0 5.9 5.9V9.6a8.5 8.5 0 0 0 5.4 1.9V8.3c0-.4 0-.8-.1-1.1Z"
        />
      </svg>
    </span>

    <!-- Douyin（抖音）：TikTok と区別するため右上に小ドット -->
    <span
      v-if="platforms.includes('douyin')"
      class="video-mark"
      :title="platformLabel('douyin')"
      :aria-label="platformLabel('douyin')"
    >
      <svg viewBox="0 0 24 24" class="mark-icon">
        <path
          fill="currentColor"
          d="M19.3 7.2a5.5 5.5 0 0 1-3.6-1.3 5.6 5.6 0 0 1-1.8-2.7V3h-3v12.4a2.8 2.8 0 1 1-2-2.7V9.5a5.8 5.8 0 0 0-.9-.1 5.9 5.9 0 1 0 5.9 5.9V9.6a8.5 8.5 0 0 0 5.4 1.9V8.3c0-.4 0-.8-.1-1.1Z"
        />
        <circle cx="20" cy="5" r="1.4" fill="currentColor" />
      </svg>
    </span>
  </span>
</template>

<style scoped>
/* 丸い枠は無し。アイコン SVG だけを薄灰色で並べる。 */
.video-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(150, 145, 142, 0.55);
  flex-shrink: 0;
}
.mark-icon {
  width: 18px;
  height: 18px;
}
</style>
