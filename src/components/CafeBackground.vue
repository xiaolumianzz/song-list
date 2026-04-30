<script setup lang="ts">
// ギターカフェ風の背景シーン。
// 優先順位:
//   1. public/background.png があればそれを全面表示
//   2. public/character/manifest.json があれば多層キャラ（Phase 2）
//   3. public/character.png があれば単層キャラ（従来フォールバック）
//   4. どれもなければ SVG のみ
import { ref } from 'vue'
import CharacterLayered from './CharacterLayered.vue'

const BASE = import.meta.env.BASE_URL
const imgUrl = `${BASE}background.png`
const characterUrl = `${BASE}character.png`

const hasImage = ref(false)
const hasCharacter = ref(false)
const hasLayered = ref(false)

function probe(url: string, target: typeof hasImage) {
  const img = new Image()
  img.onload = () => (target.value = true)
  img.onerror = () => (target.value = false)
  img.src = url
}
probe(imgUrl, hasImage)
probe(characterUrl, hasCharacter)

function onLayeredLoaded(ok: boolean) {
  hasLayered.value = ok
}
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden">
    <!-- 全面背景画像 -->
    <img
      v-if="hasImage"
      :src="imgUrl"
      alt=""
      class="absolute inset-0 h-full w-full object-cover"
    />

    <!-- SVG シーン -->
    <svg
      v-else
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      class="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff6f2" />
          <stop offset="0.7" stop-color="#fde1e5" />
          <stop offset="1" stop-color="#fbd0da" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f5d4d6" />
          <stop offset="1" stop-color="#e9bec4" />
        </linearGradient>
        <radialGradient id="lightcone" cx="50%" cy="5%" r="70%">
          <stop offset="0" stop-color="#fff3a8" stop-opacity="0.55" />
          <stop offset="1" stop-color="#fff3a8" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="slime" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e0d2f4" />
          <stop offset="0.45" stop-color="#c5adea" />
          <stop offset="1" stop-color="#a387d4" />
        </linearGradient>
      </defs>

      <!-- 壁 -->
      <rect width="1200" height="560" fill="url(#wall)" />
      <!-- 窓からの光 -->
      <ellipse cx="190" cy="40" rx="260" ry="480" fill="url(#lightcone)" />
      <!-- 床 -->
      <rect y="560" width="1200" height="240" fill="url(#floor)" />
      <rect y="555" width="1200" height="8" fill="#d8b3ba" opacity="0.6" />

      <!-- 窓 -->
      <g transform="translate(90 60)">
        <rect width="230" height="210" rx="16" fill="#fffef8" opacity="0.92" stroke="#e0b8b8" stroke-width="3" />
        <line x1="115" y1="0" x2="115" y2="210" stroke="#e0b8b8" stroke-width="2" />
        <line x1="0" y1="105" x2="230" y2="105" stroke="#e0b8b8" stroke-width="2" />
        <path d="M-14 -6 Q-10 80 10 116 Q-10 200 -12 234 L-2 234 Q2 200 22 116 Q2 80 -4 -6 Z" fill="#ffc8d5" opacity="0.75" />
        <path d="M244 -6 Q240 80 220 116 Q240 200 242 234 L232 234 Q228 200 208 116 Q228 80 234 -6 Z" fill="#ffc8d5" opacity="0.75" />
      </g>

      <!-- 壁の額縁 -->
      <g transform="translate(470 140)">
        <rect width="170" height="100" rx="4" fill="#ffffff" stroke="#c4a7a7" stroke-width="3" />
        <text x="85" y="45" text-anchor="middle" font-family="'Zen Maru Gothic', sans-serif" font-size="22" fill="#f48fa0">♡ music ♡</text>
        <g transform="translate(85 70)" fill="#f48fa0" opacity="0.75">
          <circle cx="-18" cy="6" r="3.5" /><rect x="-16.5" y="-18" width="1.3" height="24" />
          <circle cx="12" cy="0" r="3.5" /><rect x="13.5" y="-24" width="1.3" height="24" />
        </g>
      </g>

      <!-- 吊下ランプ -->
      <g transform="translate(940 0)">
        <line x1="0" y1="0" x2="0" y2="100" stroke="#b8b3b0" stroke-width="1.2" />
        <path d="M-22 100 L22 100 L15 150 Q0 164 -15 150 Z" fill="#ffe08a" opacity="0.95" stroke="#d6b45a" stroke-width="1.5" />
        <circle cx="0" cy="130" r="30" fill="#fff3a8" opacity="0.35" />
      </g>

      <!-- 壁の小さな音符 -->
      <g fill="#f48fa0" opacity="0.55">
        <circle cx="380" cy="200" r="4" /><rect x="382" y="150" width="1.5" height="50" />
        <circle cx="430" cy="180" r="4" /><rect x="432" y="130" width="1.5" height="50" />
        <circle cx="740" cy="190" r="4" /><rect x="742" y="140" width="1.5" height="50" />
      </g>

      <!-- ラベンダースライムソファ -->
      <g transform="translate(600 600)">
        <ellipse cx="0" cy="150" rx="380" ry="18" fill="#8f7aab" opacity="0.22" />
        <g class="slime">
          <path
            d="M-330 60
               C-380 30 -380 -70 -310 -100
               C-270 -150 -140 -150 -70 -110
               C-30 -140 70 -140 110 -110
               C190 -150 310 -130 340 -60
               C390 -20 380 90 330 125
               C280 170 -280 170 -310 150
               C-360 130 -360 90 -330 60 Z"
            fill="url(#slime)"
          />
          <ellipse cx="-200" cy="-30" rx="130" ry="85" fill="#b89cd8" opacity="0.7" />
          <ellipse cx="200" cy="-30" rx="130" ry="85" fill="#b89cd8" opacity="0.7" />
          <ellipse cx="-230" cy="-85" rx="58" ry="16" fill="#ffffff" opacity="0.55" />
          <ellipse cx="160" cy="-90" rx="68" ry="20" fill="#ffffff" opacity="0.5" />
          <ellipse cx="-20" cy="-130" rx="90" ry="14" fill="#ffffff" opacity="0.35" />
          <circle cx="280" cy="40" r="16" fill="#ffffff" opacity="0.45" />
          <circle cx="-290" cy="80" r="10" fill="#ffffff" opacity="0.4" />
        </g>
      </g>

      <!-- 浮かぶ音符（キャラクターの上） -->
      <g transform="translate(780 320)" fill="#f48fa0" class="note-a">
        <circle cx="0" cy="10" r="4.5" />
        <rect x="2" y="-18" width="1.6" height="28" />
      </g>
      <g transform="translate(830 280)" fill="#f48fa0" class="note-b">
        <circle cx="0" cy="10" r="4" />
        <rect x="1.6" y="-14" width="1.4" height="24" />
        <path d="M3 -14 Q12 -10 10 0" stroke="#f48fa0" stroke-width="1.6" fill="none" />
      </g>

      <!-- サイドのコーヒーカップ -->
      <g transform="translate(200 620)">
        <ellipse cx="40" cy="78" rx="55" ry="8" fill="#d9b7a0" opacity="0.5" />
        <path d="M5 20 H75 Q75 82 40 84 Q5 82 5 20 Z" fill="#ffffff" stroke="#c9a47f" stroke-width="2" />
        <path d="M75 32 Q96 32 96 52 Q96 72 75 72" fill="none" stroke="#c9a47f" stroke-width="3" />
        <ellipse cx="40" cy="20" rx="35" ry="7" fill="#6b4e35" />
        <path d="M24 4 Q20 -8 26 -20 M40 2 Q35 -10 42 -22 M56 4 Q52 -8 58 -20" stroke="#e0d2c4" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.85" />
      </g>

      <!-- 床の小さなハート -->
      <g transform="translate(920 720)" opacity="0.7">
        <path d="M0 -4 C-8 -12 -20 -4 -12 6 C-6 12 0 16 0 16 C0 16 6 12 12 6 C20 -4 8 -12 0 -4 Z" fill="#ffbac3" />
      </g>
    </svg>

    <!-- 多層キャラクター（Phase 2）: manifest が読めたらこちらが有効 -->
    <CharacterLayered v-if="!hasImage" @loaded="onLayeredLoaded" />

    <!-- 単層フォールバック：多層が使えず character.png がある場合だけ -->
    <img
      v-if="!hasImage && !hasLayered && hasCharacter"
      :src="characterUrl"
      alt=""
      class="character-overlay"
      decoding="async"
    />

    <!-- ピンク半透明ベール（可読性確保） -->
    <div class="absolute inset-0 bg-gradient-to-b from-milk/60 via-cotton/50 to-blush/35"></div>
  </div>
</template>

<style scoped>
/* スライムソファのふにゃふにゃ */
.slime {
  transform-origin: 0 160px;
  animation: slime-squish 4.2s ease-in-out infinite;
}
@keyframes slime-squish {
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.02, 0.96); }
}

/* 音符の浮遊 */
.note-a {
  animation: note-float 3.6s ease-in-out infinite;
}
.note-b {
  animation: note-float-b 4.2s ease-in-out infinite;
  animation-delay: 0.8s;
}
@keyframes note-float {
  0%   { transform: translate(780px, 320px); opacity: 0.9; }
  100% { transform: translate(790px, 240px); opacity: 0; }
}
@keyframes note-float-b {
  0%   { transform: translate(830px, 280px); opacity: 0.9; }
  100% { transform: translate(820px, 210px); opacity: 0; }
}

/* キャラクター画像を中央ソファ位置に配置。揺れアニメ付き。 */
.character-overlay {
  position: absolute;
  left: 50%;
  bottom: 4%;
  transform: translateX(-50%);
  height: 92vh;
  max-height: 920px;
  pointer-events: none;
  transform-origin: bottom center;
  animation: character-sway 5.5s ease-in-out infinite;
  filter: drop-shadow(0 14px 28px rgba(163, 135, 212, 0.4));
}
@keyframes character-sway {
  0%, 100% { transform: translateX(-50%) rotate(-1.5deg); }
  50%      { transform: translateX(-50%) rotate(1.5deg); }
}
</style>
