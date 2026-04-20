<script setup lang="ts">
import { computed } from 'vue'

interface Decor {
  kind: 'sparkle' | 'heart' | 'bubble' | 'note'
  left: string
  size: number
  delay: number
  duration: number
  drift: number
}

const BASE = import.meta.env.BASE_URL

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

const floaties = computed<Decor[]>(() => {
  const kinds: Decor['kind'][] = ['sparkle', 'heart', 'bubble', 'note']
  const items: Decor[] = []
  for (let i = 0; i < 14; i++) {
    items.push({
      kind: kinds[Math.floor(Math.random() * kinds.length)],
      left: `${rand(2, 96)}%`,
      size: Math.round(rand(14, 30)),
      delay: rand(0, 14),
      duration: rand(12, 22),
      drift: Math.round(rand(-40, 40)),
    })
  }
  return items
})

const twinkles = computed(() => {
  const out: { top: string; left: string; size: number; delay: number }[] = []
  for (let i = 0; i < 22; i++) {
    out.push({
      top: `${rand(4, 90)}%`,
      left: `${rand(3, 97)}%`,
      size: Math.round(rand(8, 16)),
      delay: rand(0, 2.5),
    })
  }
  return out
})

function src(kind: Decor['kind']) {
  return `${BASE}decorations/${kind}.svg`
}
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
    <!-- ピカピカするキラキラ -->
    <img
      v-for="(t, i) in twinkles"
      :key="'t' + i"
      :src="src('sparkle')"
      alt=""
      class="absolute animate-twinkle"
      :style="{
        top: t.top,
        left: t.left,
        width: t.size + 'px',
        height: t.size + 'px',
        animationDelay: t.delay + 's',
      }"
    />
    <!-- 下から昇る浮遊装飾 -->
    <img
      v-for="(f, i) in floaties"
      :key="'f' + i"
      :src="src(f.kind)"
      alt=""
      class="absolute bottom-[-40px] animate-rise"
      :style="{
        left: f.left,
        width: f.size + 'px',
        height: f.size + 'px',
        animationDelay: f.delay + 's',
        '--rise-duration': f.duration + 's',
        '--drift': f.drift + 'px',
      }"
    />
  </div>
</template>
