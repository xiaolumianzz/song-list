<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCharacterAnim } from '@/composables/useCharacterAnim'

type GroupKey = 'body' | 'hair' | 'armR'
type AnimKey = 'blink' | 'mouth'

interface Part {
  id: string
  file: string
  z: number
  group: GroupKey
  anim?: AnimKey
  offset?: { x?: number; y?: number }
}

interface Manifest {
  anchor?: { bottomOffsetVh?: number; heightVh?: number; maxHeightPx?: number }
  parts: Part[]
}

const emit = defineEmits<{ (e: 'loaded', ok: boolean): void }>()

const BASE = import.meta.env.BASE_URL
const manifest = ref<Manifest | null>(null)
const { eyesScaleY, mouthScaleY } = useCharacterAnim()

const anchorStyle = computed(() => {
  const a = manifest.value?.anchor ?? {}
  return {
    bottom: `${a.bottomOffsetVh ?? 18}vh`,
    height: `${a.heightVh ?? 62}vh`,
    maxHeight: `${a.maxHeightPx ?? 620}px`,
  }
})

const groups = computed(() => {
  const empty = { body: [] as Part[], hair: [] as Part[], armR: [] as Part[] }
  if (!manifest.value) return empty
  const sorted = [...manifest.value.parts].sort((a, b) => a.z - b.z)
  const out = { ...empty }
  for (const p of sorted) out[p.group].push(p)
  return out
})

function partSrc(p: Part) {
  return `${BASE}character/parts/${p.file}`
}

function partStyle(p: Part) {
  const ox = p.offset?.x ?? 0
  const oy = p.offset?.y ?? 0
  const transform = ox || oy ? `translate(${ox}px, ${oy}px)` : undefined
  return {
    zIndex: p.z,
    transform,
  }
}

onMounted(async () => {
  try {
    const res = await fetch(`${BASE}character/manifest.json`, { cache: 'no-cache' })
    if (!res.ok) {
      emit('loaded', false)
      return
    }
    manifest.value = (await res.json()) as Manifest
    emit('loaded', true)
  } catch {
    emit('loaded', false)
  }
})
</script>

<template>
  <div v-if="manifest" class="char-root" :style="anchorStyle" aria-hidden="true">
    <div class="char-body">
      <!-- body グループ（瞬き・口パク含む） -->
      <div class="char-canvas">
        <template v-for="p in groups.body" :key="p.id">
          <img
            v-if="p.anim === 'blink'"
            :src="partSrc(p)"
            :style="{ ...partStyle(p), transform: `scaleY(${eyesScaleY})` }"
            class="char-part char-eyes"
            alt=""
          />
          <img
            v-else-if="p.anim === 'mouth'"
            :src="partSrc(p)"
            :style="{ ...partStyle(p), transform: `scaleY(${mouthScaleY})` }"
            class="char-part char-mouth"
            alt=""
          />
          <img
            v-else
            :src="partSrc(p)"
            :style="partStyle(p)"
            class="char-part"
            alt=""
          />
        </template>
      </div>

      <!-- hair グループ -->
      <div v-if="groups.hair.length" class="char-canvas char-group-hair">
        <img
          v-for="p in groups.hair"
          :key="p.id"
          :src="partSrc(p)"
          :style="partStyle(p)"
          class="char-part"
          alt=""
        />
      </div>

      <!-- 右腕 -->
      <div v-if="groups.armR.length" class="char-canvas char-group-armR">
        <img
          v-for="p in groups.armR"
          :key="p.id"
          :src="partSrc(p)"
          :style="partStyle(p)"
          class="char-part"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.char-root {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: min(90vw, 480px);
  pointer-events: none;
  filter: drop-shadow(0 12px 24px rgba(163, 135, 212, 0.35));
}

/* 共通キャンバス：各パーツは絶対配置でオーバーレイ */
.char-canvas {
  position: absolute;
  inset: 0;
}
.char-part {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: center;
}
.char-eyes {
  transform-origin: 50% 50%;
}
.char-mouth {
  transform-origin: 50% 30%;
}

/* body-sway：体全体をゆっくり揺らす */
.char-body {
  position: absolute;
  inset: 0;
  transform-origin: 50% 100%;
  animation: body-sway 5s ease-in-out infinite;
}
@keyframes body-sway {
  0%, 100% { transform: rotate(-1.5deg); }
  50% { transform: rotate(1.5deg); }
}

/* hair-lag：髪とリボンが体より少し遅れて大きめに揺れる */
.char-group-hair {
  transform-origin: 50% 18%;
  animation: hair-lag 5s ease-in-out infinite;
  animation-delay: 0.3s;
}
@keyframes hair-lag {
  0%, 100% { transform: rotate(-2.5deg); }
  50% { transform: rotate(2.5deg); }
}

/* strum：右腕のストローク */
.char-group-armR {
  transform-origin: 55% 45%;
  animation: strum 0.78s ease-in-out infinite;
}
@keyframes strum {
  0%, 100% { transform: translate(0, 0) rotate(-4deg); }
  50% { transform: translate(-2px, 1px) rotate(6deg); }
}

/* 揺れ苦手な人向け */
@media (prefers-reduced-motion: reduce) {
  .char-body,
  .char-group-hair,
  .char-group-armR {
    animation: none;
  }
}
</style>
