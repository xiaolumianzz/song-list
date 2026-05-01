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

interface ArtistStat {
  artist: string
  count: number
}

const props = withDefaults(
  defineProps<{
    languages: string[]
    language: string
    tagStats: TagStat[]
    selectedTags: string[]
    artistStats: ArtistStat[]
    artist: string
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
  (e: 'update:artist', v: string): void
  (e: 'toggle-tag', v: string): void
  (e: 'reset'): void
}>()

function pickArtist(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:artist', target.value)
}

function pickLangFromSelect(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:language', target.value)
}

const { t, locale } = useI18n()
const songsStore = useSongsStore()

const orderedLangs = computed(() =>
  LANGUAGE_ORDER.filter((l) => props.languages.includes(l)),
)

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
      <select
        :value="language"
        class="max-w-full rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 px-3 py-1 text-xs text-ink shadow-glass-chip hover:from-white/65 hover:to-white/25 focus:border-sakura focus:outline-none focus:ring-2 focus:ring-sakura/40"
        @change="pickLangFromSelect"
      >
        <option value="all">{{ t('filter.all') }}</option>
        <option v-for="l in orderedLangs" :key="l" :value="l">
          {{ t('language.' + l) }}
        </option>
      </select>
    </div>

    <div v-if="artistStats.length" class="flex flex-wrap items-center gap-2">
      <span class="font-display text-sm text-ink/70">{{ t('filter.artist') }}</span>
      <select
        :value="artist"
        class="max-w-full rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 px-3 py-1 text-xs text-ink shadow-glass-chip hover:from-white/65 hover:to-white/25 focus:border-sakura focus:outline-none focus:ring-2 focus:ring-sakura/40"
        @change="pickArtist"
      >
        <option value="all">{{ t('filter.allArtists') }}</option>
        <option v-for="a in artistStats" :key="a.artist" :value="a.artist">
          {{ a.artist }}（{{ a.count }}）
        </option>
      </select>
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
            : 'bg-gradient-to-b from-white/50 to-white/15 text-ink border border-white/80 shadow-glass-chip hover:from-white/65 hover:to-white/25'
        "
        :style="{ ...tagStyle(t.scale), animationDelay: `${t.count * 0.3}s` }"
        @click="emit('toggle-tag', t.tag)"
      >
        #{{ tagDisplay(t.tag, locale, songsStore.tagDict) }}
      </button>
      <button
        v-if="selectedTags.length || language !== 'all' || artist !== 'all'"
        class="ml-auto rounded-full border border-ash/50 bg-transparent px-3 py-1 text-xs text-ink/70 hover:bg-white"
        @click="emit('reset')"
      >
        {{ t('filter.reset') }}
      </button>
    </div>
  </div>
</template>
