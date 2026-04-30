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
  <span v-if="platforms.length" class="flex items-center gap-1">
    <!-- YouTube -->
    <svg
      v-if="platforms.includes('youtube')"
      viewBox="0 0 24 16"
      class="platform-mark"
      :title="platformLabel('youtube')"
      :aria-label="platformLabel('youtube')"
    >
      <title>{{ platformLabel('youtube') }}</title>
      <rect width="24" height="16" rx="4" fill="#FF0033" />
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
      <line x1="6" y1="3" x2="9" y2="6.5" stroke="#00A1D6" stroke-width="2" stroke-linecap="round" />
      <line x1="18" y1="3" x2="15" y2="6.5" stroke="#00A1D6" stroke-width="2" stroke-linecap="round" />
      <rect x="2" y="6" width="20" height="11" rx="3" fill="#00A1D6" />
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
      <rect width="16" height="16" rx="3" fill="#010101" />
      <!-- TikTok の重ね合わせ風：シアンずれ + ピンクずれ + 白本体 -->
      <path
        d="M10.2 2.6 v6.7 a2.7 2.7 0 1 1 -2.7 -2.7"
        fill="none"
        stroke="#25F4EE"
        stroke-width="1.6"
        stroke-linecap="round"
        transform="translate(-0.5,0.5)"
      />
      <path
        d="M10.2 2.6 v6.7 a2.7 2.7 0 1 1 -2.7 -2.7"
        fill="none"
        stroke="#FE2C55"
        stroke-width="1.6"
        stroke-linecap="round"
        transform="translate(0.5,-0.5)"
      />
      <path
        d="M10.2 2.6 v6.7 a2.7 2.7 0 1 1 -2.7 -2.7 v-1.4 a4.1 4.1 0 0 0 4.1 4.1"
        fill="white"
      />
    </svg>

    <!-- Douyin（抖音） -->
    <svg
      v-if="platforms.includes('douyin')"
      viewBox="0 0 16 16"
      class="platform-mark"
      :title="platformLabel('douyin')"
      :aria-label="platformLabel('douyin')"
    >
      <title>{{ platformLabel('douyin') }}</title>
      <rect width="16" height="16" rx="3" fill="#010101" />
      <path
        d="M10.2 2.6 v6.7 a2.7 2.7 0 1 1 -2.7 -2.7 v-1.4 a4.1 4.1 0 0 0 4.1 4.1"
        fill="#FE2C55"
      />
    </svg>
  </span>
</template>

<style scoped>
.platform-mark {
  height: 1.05rem;
  width: auto;
  flex-shrink: 0;
  border-radius: 0.25rem;
  filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.12));
}
</style>
