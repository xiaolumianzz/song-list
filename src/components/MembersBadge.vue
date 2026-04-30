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
  return props.size === 'md' ? 'text-[11px] px-2.5 py-0.5' : 'text-[10px] px-2 py-0.5'
})
</script>

<template>
  <span
    v-if="visible"
    :class="['members-badge', sizeClass]"
    :title="t('condition.members-only')"
    :aria-label="t('condition.members-only')"
  >
    <span aria-hidden="true">🔒</span>
    <span v-if="!compact">{{ t('condition.members-only') }}</span>
  </span>
</template>

<style scoped>
.members-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: linear-gradient(135deg, #ece1f7, #c9b5e9);
  color: #5e4791;
  border: 1px solid rgba(177, 156, 217, 0.7);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 2px 6px rgba(177, 156, 217, 0.22);
}
.compact-badge {
  padding: 0.1rem 0.32rem;
  font-size: 0.7rem;
  line-height: 1;
}
</style>
