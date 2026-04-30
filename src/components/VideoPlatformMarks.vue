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
    <svg
      v-if="platforms.includes('youtube')"
      viewBox="0 0 24 16"
      class="platform-mark"
      :title="platformLabel('youtube')"
      :aria-label="platformLabel('youtube')"
    >
      <title>{{ platformLabel('youtube') }}</title>
      <rect width="24" height="16" rx="4" fill="#b8b3b0" />
      <path d="M10 4.5 L16 8 L10 11.5 Z" fill="white" />
    </svg>

    <!-- BiliBili -->
    <svg
      v-if="platforms.includes('bilibili')"
      viewBox="0 0 24 18"
      class="platform-mark"
      :title="platformLabel('bilibili')"
      :aria-label="platformLabel('bilibili')"
    >
      <title>{{ platformLabel('bilibili') }}</title>
      <line x1="6" y1="3" x2="9" y2="6.5" stroke="#b8b3b0" stroke-width="2" stroke-linecap="round" />
      <line x1="18" y1="3" x2="15" y2="6.5" stroke="#b8b3b0" stroke-width="2" stroke-linecap="round" />
      <rect x="2" y="6" width="20" height="11" rx="3" fill="#b8b3b0" />
      <ellipse cx="8.5" cy="11.5" rx="1.4" ry="1.8" fill="white" />
      <ellipse cx="15.5" cy="11.5" rx="1.4" ry="1.8" fill="white" />
    </svg>

    <!-- TikTok -->
    <svg
      v-if="platforms.includes('tiktok')"
      viewBox="0 0 16 16"
      class="platform-mark"
      :title="platformLabel('tiktok')"
      :aria-label="platformLabel('tiktok')"
    >
      <title>{{ platformLabel('tiktok') }}</title>
      <rect width="16" height="16" rx="3" fill="#b8b3b0" />
      <path
        d="M10.2 2.6 v6.7 a2.7 2.7 0 1 1 -2.7 -2.7 v-1.4 a4.1 4.1 0 0 0 4.1 4.1"
        fill="white"
      />
    </svg>

    <!-- Douyin（抖音）：TikTok と区別するため抖音は note の頭に小さなドット付き -->
    <svg
      v-if="platforms.includes('douyin')"
      viewBox="0 0 16 16"
      class="platform-mark"
      :title="platformLabel('douyin')"
      :aria-label="platformLabel('douyin')"
    >
      <title>{{ platformLabel('douyin') }}</title>
      <rect width="16" height="16" rx="3" fill="#b8b3b0" />
      <path
        d="M10.2 2.6 v6.7 a2.7 2.7 0 1 1 -2.7 -2.7 v-1.4 a4.1 4.1 0 0 0 4.1 4.1"
        fill="white"
      />
      <circle cx="13.2" cy="3.4" r="0.9" fill="white" />
    </svg>
  </span>
</template>

<style scoped>
.platform-mark {
  height: 1.05rem;
  width: auto;
  flex-shrink: 0;
  border-radius: 0.25rem;
  filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.08));
}
</style>
