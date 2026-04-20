<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  amount: number
  /** 'card' | 'row' | 'modal' | 'inline' などサイズ調整用 */
  size?: 'sm' | 'md' | 'lg'
}>()

type Tier = 'mint' | 'amethyst' | 'rose' | 'peach' | 'raspberry' | 'opal'

const tier = computed<Tier>(() => {
  const a = props.amount
  if (a >= 500) return 'opal'
  if (a >= 300) return 'raspberry'
  if (a >= 150) return 'peach'
  if (a >= 100) return 'rose'
  if (a >= 50) return 'amethyst'
  return 'mint'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'text-sm px-3 py-1'
    case 'sm':
      return 'text-[10px] px-2 py-0.5'
    default:
      return 'text-[11px] px-2.5 py-0.5'
  }
})
</script>

<template>
  <span
    :class="['sc-badge', `sc-tier-${tier}`, sizeClass]"
    :title="`Super Chat ${amount}`"
  >
    <span class="sc-spark" aria-hidden="true">✦</span>
    <span class="sc-amount">{{ amount }}SC</span>
  </span>
</template>

<style scoped>
.sc-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(163, 135, 212, 0.22);
  backdrop-filter: blur(2px);
}

.sc-spark {
  font-size: 0.85em;
  opacity: 0.9;
}

/* ── ティア別配色（宝石系パステル・高級感） ── */

.sc-tier-mint {
  background: linear-gradient(135deg, #dff4e8, #b7dfc8);
  color: #3d6e54;
  border: 1px solid rgba(141, 194, 166, 0.7);
}

.sc-tier-amethyst {
  background: linear-gradient(135deg, #ece1f7, #c9b5e9);
  color: #5e4791;
  border: 1px solid rgba(177, 156, 217, 0.7);
}

.sc-tier-rose {
  background: linear-gradient(135deg, #ffe4e0, #f6b8be);
  color: #8f3d4f;
  border: 1px solid rgba(232, 142, 148, 0.7);
}

.sc-tier-peach {
  background: linear-gradient(135deg, #ffdec0, #ffae8b);
  color: #8f4524;
  border: 1px solid rgba(255, 140, 102, 0.75);
}

.sc-tier-raspberry {
  background: linear-gradient(135deg, #ffd0dc, #f294b0);
  color: #8f2a51;
  border: 1px solid rgba(232, 106, 148, 0.75);
}

/* オパールは虹彩感を出すため背景をゆるくシマー */
.sc-tier-opal {
  background: linear-gradient(
    135deg,
    #e4d4f6 0%,
    #f8d4e3 33%,
    #fde5cf 66%,
    #d3e7f6 100%
  );
  background-size: 280% 280%;
  animation: opal-shimmer 7s ease-in-out infinite;
  color: #5a4087;
  border: 1px solid rgba(185, 166, 208, 0.8);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05),
    0 3px 10px rgba(200, 150, 210, 0.3);
}

@keyframes opal-shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sc-tier-opal {
    animation: none;
  }
}
</style>
