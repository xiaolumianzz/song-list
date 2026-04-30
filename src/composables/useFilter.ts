import { computed, reactive } from 'vue'
import type { Language, Song } from '@/types/song'
import { LANGUAGE_ORDER } from '@/types/song'

export type SortKey = 'default' | 'added' | 'updated' | 'title' | 'artist' | 'language'

export interface FilterState {
  query: string
  language: string
  tags: string[]
  artist: string
  sortKey: SortKey
  sortReverse: boolean
}

export const SORT_KEYS: SortKey[] = [
  'default',
  'added',
  'updated',
  'title',
  'artist',
  'language',
]

const collator = new Intl.Collator('ja')

function languageRank(lang: Language | string): number {
  const idx = LANGUAGE_ORDER.indexOf(lang as Language)
  return idx >= 0 ? idx : LANGUAGE_ORDER.length
}

/** ソート用の比較関数を生成。各キーで「default の方向」を返す。 */
function compareBy(key: SortKey): (a: Song, b: Song) => number {
  switch (key) {
    case 'added':
      // 新しい順がデフォルト → 降順比較（=b の addedAt が a より新しいなら正）
      return (a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0)
    case 'updated':
      return (a, b) => {
        const av = a.updatedAt ?? a.addedAt
        const bv = b.updatedAt ?? b.addedAt
        return av < bv ? 1 : av > bv ? -1 : 0
      }
    case 'title':
      // 五十音昇順がデフォルト
      return (a, b) =>
        collator.compare(a.titleReading || a.title, b.titleReading || b.title)
    case 'artist':
      return (a, b) =>
        collator.compare(a.artistReading || a.artist, b.artistReading || b.artist)
    case 'language':
      return (a, b) => languageRank(a.language) - languageRank(b.language)
    case 'default':
    default:
      return () => 0
  }
}

export function useFilter(source: () => Song[]) {
  const state = reactive<FilterState>({
    query: '',
    language: 'all',
    tags: [],
    artist: 'all',
    sortKey: 'default',
    sortReverse: false,
  })

  const filtered = computed<Song[]>(() => {
    const q = state.query.trim().toLowerCase()
    return source().filter((s) => {
      if (state.language !== 'all' && s.language !== state.language) return false
      if (state.artist !== 'all' && s.artist !== state.artist) return false
      if (state.tags.length && !state.tags.every((t) => s.tags.includes(t))) return false
      if (!q) return true
      return (
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        (s.titleReading ?? '').toLowerCase().includes(q) ||
        (s.artistReading ?? '').toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.remark.toLowerCase().includes(q)
      )
    })
  })

  const sorted = computed<Song[]>(() => {
    const list = filtered.value
    if (state.sortKey === 'default') {
      // 管理者の手動並び順をそのまま使う。reverse のときだけ逆順にする。
      return state.sortReverse ? [...list].reverse() : list
    }
    const cmp = compareBy(state.sortKey)
    const out = [...list].sort(cmp)
    return state.sortReverse ? out.reverse() : out
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
    state.artist = 'all'
    state.sortKey = 'default'
    state.sortReverse = false
  }

  return { state, filtered, sorted, toggleTag, reset }
}
