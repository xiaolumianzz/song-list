<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LANGUAGE_ORDER } from '@/types/song'

const props = defineProps<{
  languages: string[]
  language: string
  tags: string[]
  selectedTags: string[]
}>()
const emit = defineEmits<{
  (e: 'update:language', v: string): void
  (e: 'toggle-tag', v: string): void
  (e: 'reset'): void
}>()

const { t } = useI18n()

const orderedLangs = computed(() =>
  LANGUAGE_ORDER.filter((l) => props.languages.includes(l)),
)

function pickLang(v: string) {
  emit('update:language', v)
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <span class="font-display text-sm text-ink/70">{{ t('filter.language') }}</span>
      <button
        class="rounded-full px-3 py-1 text-xs font-medium transition"
        :class="language === 'all' ? 'bg-sakura text-white shadow-pop' : 'bg-gradient-to-b from-white/50 to-white/15 text-ink border border-white/80 shadow-glass-chip backdrop-blur-[2px] hover:from-white/65 hover:to-white/25'"
        @click="pickLang('all')"
      >
        {{ t('filter.all') }}
      </button>
      <button
        v-for="l in orderedLangs"
        :key="l"
        class="rounded-full px-3 py-1 text-xs font-medium transition"
        :class="language === l ? 'bg-sakura text-white shadow-pop' : 'bg-gradient-to-b from-white/50 to-white/15 text-ink border border-white/80 shadow-glass-chip backdrop-blur-[2px] hover:from-white/65 hover:to-white/25'"
        @click="pickLang(l)"
      >
        {{ t('language.' + l) }}
      </button>
    </div>

    <div v-if="tags.length" class="flex flex-wrap items-center gap-2">
      <span class="font-display text-sm text-ink/70">{{ t('filter.tags') }}</span>
      <button
        v-for="tag in tags"
        :key="tag"
        class="rounded-full px-3 py-1 text-xs font-medium transition"
        :class="
          selectedTags.includes(tag)
            ? 'bg-rose text-white shadow-pop'
            : 'bg-gradient-to-b from-white/50 to-white/15 text-ink border border-white/80 shadow-glass-chip backdrop-blur-[2px] hover:from-white/65 hover:to-white/25'
        "
        @click="emit('toggle-tag', tag)"
      >
        #{{ tag }}
      </button>
      <button
        v-if="selectedTags.length || language !== 'all'"
        class="ml-auto rounded-full border border-ash/50 bg-transparent px-3 py-1 text-xs text-ink/70 hover:bg-white"
        @click="emit('reset')"
      >
        {{ t('filter.reset') }}
      </button>
    </div>
  </div>
</template>
