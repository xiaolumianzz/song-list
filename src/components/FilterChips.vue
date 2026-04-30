<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LANGUAGE_ORDER } from '@/types/song'
import { useSongsStore } from '@/stores/songs'
import { tagDisplay } from '@/composables/useTagDict'

interface TagStat {
  tag: string
  count: number
  scale: number
}

const props = withDefaults(
  defineProps<{
    languages: string[]
    language: string
    tagStats: TagStat[]
    selectedTags: string[]
    tagLimit?: number
  }>(),
  { tagLimit: 6 },
)

const visibleTagStats = computed(() => {
  // 選択中のタグは上位に無くても必ず表示
  const top = props.tagStats.slice(0, props.tagLimit)
  const topSet = new Set(top.map((t) => t.tag))
  const extraSelected = props.tagStats.filter(
    (t) => props.selectedTags.includes(t.tag) && !topSet.has(t.tag),
  )
  return [...top, ...extraSelected]
})
const emit = defineEmits<{
  (e: 'update:language', v: string): void
  (e: 'toggle-tag', v: string): void
  (e: 'reset'): void
}>()

const { t, locale } = useI18n()
const songsStore = useSongsStore()

const orderedLangs = computed(() =>
  LANGUAGE_ORDER.filter((l) => props.languages.includes(l)),
)

function pickLang(v: string) {
  emit('update:language', v)
}

// scale 0..1 を RandomPicker ボタン並みの大きさ ~ 現行の小チップの大きさに線形補間
function tagStyle(scale: number) {
  const fontSize = 0.72 + scale * 0.36 // 0.72rem ~ 1.08rem
  const paddingX = 0.75 + scale * 0.65 // 0.75rem ~ 1.4rem
  const paddingY = 0.22 + scale * 0.45 // 0.22rem ~ 0.67rem
  return {
    fontSize: `${fontSize}rem`,
    padding: `${paddingY}rem ${paddingX}rem`,
  }
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

    <div v-if="visibleTagStats.length" class="flex flex-wrap items-center gap-2">
      <span class="font-display text-sm text-ink/70">{{ t('filter.tags') }}</span>
      <button
        v-for="t in visibleTagStats"
        :key="t.tag"
        class="animate-sway rounded-full font-display font-medium transition"
        :class="
          selectedTags.includes(t.tag)
            ? 'bg-rose text-white shadow-pop'
            : 'bg-gradient-to-b from-white/50 to-white/15 text-ink border border-white/80 shadow-glass-chip backdrop-blur-[2px] hover:from-white/65 hover:to-white/25'
        "
        :style="{ ...tagStyle(t.scale), animationDelay: `${t.count * 0.3}s` }"
        @click="emit('toggle-tag', t.tag)"
      >
        #{{ tagDisplay(t.tag, locale, songsStore.tagDict) }}
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
