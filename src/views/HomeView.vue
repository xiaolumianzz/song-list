<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSongsStore } from '@/stores/songs'
import { useFilter } from '@/composables/useFilter'
import { useViewMode } from '@/composables/useViewMode'
import type { Song } from '@/types/song'

import SearchBar from '@/components/SearchBar.vue'
import FilterChips from '@/components/FilterChips.vue'
import SongGrid from '@/components/SongGrid.vue'
import SongDetailModal from '@/components/SongDetailModal.vue'
import RandomPicker from '@/components/RandomPicker.vue'
import SongCount from '@/components/SongCount.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import ViewToggle from '@/components/ViewToggle.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import SortMenu from '@/components/SortMenu.vue'

const { t } = useI18n()
const store = useSongsStore()
const { songs, tagStats, artistStats, allLanguages, loading, error } = storeToRefs(store)

const { state, filtered, sorted, toggleTag, reset } = useFilter(() => songs.value)
const viewMode = useViewMode()
const selected = ref<Song | null>(null)

function onPicked(song: Song) {
  selected.value = song
}
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-10 sm:px-8">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h1 class="font-display text-3xl font-bold text-ink">
          {{ t('app.title') }}
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <LangSwitcher />
        <router-link
          to="/admin"
          class="rounded-full border border-white/80 bg-gradient-to-b from-white/50 to-white/15 px-3 py-1 text-xs text-ink/80 shadow-glass-chip backdrop-blur-[2px] hover:from-white/65 hover:to-white/25"
        >
          {{ t('nav.admin') }}
        </router-link>
      </div>
    </header>

    <p class="mb-6 font-handwritten text-lg text-ink/80">{{ t('home.tagline') }}</p>

    <!-- 上段：Profile (左) / 女の子 (中央・背景) / 検索＆フィルタ (右) -->
    <div class="mb-8 grid gap-6 lg:grid-cols-[300px_minmax(360px,0.9fr)_minmax(0,1.4fr)]">
      <aside>
        <ProfileCard />
      </aside>
      <!-- 中央カラムは女の子の露出用（デスクトップのみ空ける） -->
      <div class="hidden lg:block" aria-hidden="true"></div>
      <section
        class="space-y-4 rounded-3xl border border-white/70 bg-gradient-to-br from-white/25 via-white/8 to-white/3 p-5 shadow-glass-lg backdrop-blur-[2px]"
      >
        <div class="flex flex-wrap items-center gap-3">
          <SongCount :total="songs.length" :visible="filtered.length" />
          <RandomPicker :pool="filtered" @picked="onPicked" />
        </div>
        <SearchBar v-model="state.query" />
        <FilterChips
          :languages="allLanguages"
          :language="state.language"
          :tag-stats="tagStats"
          :selected-tags="state.tags"
          :artist-stats="artistStats"
          :artist="state.artist"
          @update:language="(v) => (state.language = v)"
          @update:artist="(v) => (state.artist = v)"
          @toggle-tag="toggleTag"
          @reset="reset"
        />
      </section>
    </div>

    <!-- 下段：曲リスト（全幅） -->
    <section>
      <div class="mb-3 flex flex-wrap items-center justify-end gap-3">
        <SortMenu
          :sort-key="state.sortKey"
          :sort-reverse="state.sortReverse"
          @update:sort-key="(v) => (state.sortKey = v)"
          @update:sort-reverse="(v) => (state.sortReverse = v)"
        />
        <ViewToggle :mode="viewMode" @update:mode="viewMode = $event" />
      </div>
      <div v-if="loading" class="py-10 text-center font-handwritten text-ink/60">
        {{ t('home.loading') }}
      </div>
      <div
        v-else-if="error"
        class="rounded-2xl bg-white/80 p-6 text-center text-sm text-rose"
      >
        ⚠ {{ error }}
      </div>
      <div
        v-else-if="!sorted.length"
        class="rounded-2xl bg-white/80 p-10 text-center font-handwritten text-ink/60"
      >
        ♡ {{ t('home.empty') }}
      </div>
      <SongGrid v-else :songs="sorted" :mode="viewMode" @open="selected = $event" />
    </section>

    <footer class="mt-10 text-center">
      <p class="font-handwritten text-xs text-ink/60">{{ t('home.footer') }}</p>
      <p class="mt-1 text-[10px] text-ink/40">© 2026 Riru</p>
    </footer>
  </main>

  <SongDetailModal :song="selected" @close="selected = null" />
</template>
