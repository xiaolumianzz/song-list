<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const { data: profile } = storeToRefs(profileStore)
</script>

<template>
  <section
    class="rounded-3xl border border-white/70 bg-gradient-to-br from-white/35 via-white/12 to-white/5 p-5 shadow-glass backdrop-blur-[2px]"
  >
    <!-- アイコン -->
    <div class="flex justify-center">
      <img
        v-if="profile.iconUrl"
        :src="profile.iconUrl"
        class="h-24 w-24 rounded-full border-2 border-white/80 object-cover shadow-glass-chip"
        alt=""
      />
      <div
        v-else
        class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/80 bg-white/40 text-3xl shadow-glass-chip"
      >
        🎀
      </div>
    </div>

    <!-- 表示名 / 一言 -->
    <h2 v-if="profile.displayName" class="mt-3 text-center font-display text-lg font-medium text-ink">
      {{ profile.displayName }}
    </h2>
    <p v-if="profile.tagline" class="mt-1 text-center font-handwritten text-sm text-ink/70">
      {{ profile.tagline }}
    </p>

    <!-- SNS ボタン -->
    <div class="mt-4 flex flex-wrap justify-center gap-2">
      <a
        v-if="profile.links.bilibili"
        :href="profile.links.bilibili"
        target="_blank"
        rel="noopener"
        class="sns-btn group"
        aria-label="BiliBili"
      >
        <!-- BiliBili: TV + antennae -->
        <svg viewBox="0 0 24 24" class="h-5 w-5">
          <path
            fill="currentColor"
            d="M17.8 3.3 16.4 4.7 14.1 2.4h-4.2L7.6 4.7 6.2 3.3 4.8 4.7 6.2 6.1H4a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-2.2l1.4-1.4-1.4-1.4ZM4 8.1h16c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1Z"
          />
          <circle cx="8" cy="13" r="1.5" fill="currentColor" />
          <circle cx="16" cy="13" r="1.5" fill="currentColor" />
        </svg>
      </a>

      <a
        v-if="profile.links.tiktok"
        :href="profile.links.tiktok"
        target="_blank"
        rel="noopener"
        class="sns-btn group"
        aria-label="TikTok"
      >
        <!-- TikTok: music note + d -->
        <svg viewBox="0 0 24 24" class="h-5 w-5">
          <path
            fill="currentColor"
            d="M19.3 7.2a5.5 5.5 0 0 1-3.6-1.3 5.6 5.6 0 0 1-1.8-2.7V3h-3v12.4a2.8 2.8 0 1 1-2-2.7V9.5a5.8 5.8 0 0 0-.9-.1 5.9 5.9 0 1 0 5.9 5.9V9.6a8.5 8.5 0 0 0 5.4 1.9V8.3c0-.4 0-.8-.1-1.1Z"
          />
        </svg>
      </a>

      <a
        v-if="profile.links.youtube"
        :href="profile.links.youtube"
        target="_blank"
        rel="noopener"
        class="sns-btn group"
        aria-label="YouTube"
      >
        <!-- YouTube: play in rounded rect -->
        <svg viewBox="0 0 24 24" class="h-5 w-5">
          <path
            fill="currentColor"
            d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"
          />
        </svg>
      </a>

      <a
        v-if="profile.links.twitter"
        :href="profile.links.twitter"
        target="_blank"
        rel="noopener"
        class="sns-btn group"
        aria-label="Twitter / X"
      >
        <!-- X (new Twitter logo) -->
        <svg viewBox="0 0 24 24" class="h-5 w-5">
          <path
            fill="currentColor"
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.16 17.52h1.833L7.084 4.126H5.117Z"
          />
        </svg>
      </a>
    </div>
  </section>
</template>

<style scoped>
.sns-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.2));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2),
    0 2px 6px rgba(244, 143, 160, 0.15);
  backdrop-filter: blur(2px);
  color: #f48fa0; /* default pink */
  transition:
    transform 0.18s ease,
    color 0.2s ease,
    background 0.2s ease;
}
.sns-btn:hover {
  transform: translateY(-2px);
  color: #ffffff;
}
/* ブランドごとに hover 色（属性セレクタで上書き） */
.sns-btn[aria-label='BiliBili']:hover { background: #00a1d6; }
.sns-btn[aria-label='TikTok']:hover { background: #000000; }
.sns-btn[aria-label='YouTube']:hover { background: #ff0033; }
.sns-btn[aria-label='Twitter / X']:hover { background: #0f1419; }
</style>
