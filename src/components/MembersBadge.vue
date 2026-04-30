<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    conditions?: string[]
    size?: 'sm' | 'md'
    /** true ならアイコンのみのコンパクト表示（行表示で SC 列に並べる用） */
    compact?: boolean
  }>(),
  { size: 'sm', compact: false },
)

const { t } = useI18n()
const visible = computed(() => props.conditions?.includes('members-only') ?? false)
const sizeClass = computed(() => {
  if (props.compact) return 'compact-badge'
  return props.size === 'md' ? 'text-[11px] px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
})
</script>

<template>
  <span
    v-if="visible"
    :class="['members-badge', sizeClass]"
    :title="t('condition.members-only')"
    :aria-label="t('condition.members-only')"
  >
    <svg
      class="members-crown"
      viewBox="0 0 24 18"
      aria-hidden="true"
      fill="currentColor"
    >
      <!-- 王冠の山 -->
      <path d="M2 14 L3.5 5 L8.5 10 L12 3 L15.5 10 L20.5 5 L22 14 Z" />
      <!-- 王冠の帯 -->
      <rect x="2" y="13" width="20" height="3" rx="0.6" />
      <!-- 宝石（白いハイライト） -->
      <circle cx="7" cy="11.5" r="0.9" fill="rgba(255,255,255,0.95)" />
      <circle cx="12" cy="8" r="1.05" fill="rgba(255,255,255,0.95)" />
      <circle cx="17" cy="11.5" r="0.9" fill="rgba(255,255,255,0.95)" />
    </svg>
    <span v-if="!compact">{{ t('condition.members-only') }}</span>
  </span>
</template>

<style scoped>
.members-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  /* 桜 → ピンクパープル → ラベンダーのふんわりグラデーション */
  background: linear-gradient(135deg, #ffd9dd 0%, #f3d4ee 45%, #d8c4f0 100%);
  color: #6e3a85;
  border: 1px solid rgba(180, 145, 210, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    inset 0 -1px 0 rgba(110, 58, 133, 0.08),
    0 2px 8px rgba(196, 154, 213, 0.32);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
}
.members-crown {
  width: 1em;
  height: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 0.5px 0 rgba(255, 255, 255, 0.6));
}
.compact-badge {
  padding: 0.18rem 0.4rem;
  font-size: 0.78rem;
  line-height: 1;
}
.compact-badge .members-crown {
  width: 0.95em;
}
</style>
