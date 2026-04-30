<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfileStore } from '@/stores/profile'
import { NEW_BADGE_DEFAULT_DAYS } from '@/types/profile'
import { isRecentlyAdded } from '@/composables/useTagDict'

const props = withDefaults(
  defineProps<{
    addedAt: string
    size?: 'sm' | 'md'
  }>(),
  { size: 'sm' },
)

const { t } = useI18n()
const profileStore = useProfileStore()

const days = computed<number>(() => {
  const d = profileStore.data.newBadgeDays
  if (typeof d !== 'number' || !Number.isFinite(d) || d <= 0) return NEW_BADGE_DEFAULT_DAYS
  return Math.min(365, Math.floor(d))
})

const visible = computed(() => isRecentlyAdded(props.addedAt, days.value))

const sizeClass = computed(() =>
  props.size === 'md' ? 'text-[11px] px-2.5 py-0.5' : 'text-[10px] px-2 py-0.5',
)
</script>

<template>
  <span
    v-if="visible"
    :class="['new-badge', sizeClass]"
    :title="t('badge.newTitle', { days })"
  >
    <span class="new-spark" aria-hidden="true">✦</span>
    <span>{{ t('badge.new') }}</span>
  </span>
</template>

<style scoped>
.new-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  background: linear-gradient(135deg, #ffe6c9, #ffc8a3);
  color: #8f4a1a;
  border: 1px solid rgba(232, 168, 116, 0.7);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 2px 6px rgba(232, 168, 116, 0.28);
  animation: new-pulse 2.4s ease-in-out infinite;
}
.new-spark {
  font-size: 0.85em;
  opacity: 0.95;
  animation: new-spin 3.2s linear infinite;
}
@keyframes new-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}
@keyframes new-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .new-badge { animation: none; }
  .new-spark { animation: none; }
}
</style>
