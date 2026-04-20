import { computed, reactive } from 'vue'
import type { Song } from '@/types/song'

export interface FilterState {
  query: string
  language: string
  tags: string[]
}

export function useFilter(source: () => Song[]) {
  const state = reactive<FilterState>({ query: '', language: 'all', tags: [] })

  const filtered = computed<Song[]>(() => {
    const q = state.query.trim().toLowerCase()
    return source().filter((s) => {
      if (state.language !== 'all' && s.language !== state.language) return false
      if (state.tags.length && !state.tags.every((t) => s.tags.includes(t))) return false
      if (!q) return true
      return (
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.remark.toLowerCase().includes(q)
      )
    })
  })

  function toggleTag(tag: string) {
    const i = state.tags.indexOf(tag)
    if (i >= 0) state.tags.splice(i, 1)
    else state.tags.push(tag)
  }

  function reset() {
    state.query = ''
    state.language = 'all'
    state.tags = []
  }

  return { state, filtered, toggleTag, reset }
}
