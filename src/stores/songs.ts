import { defineStore } from 'pinia'
import type { Song, SongData, TagEntry } from '@/types/song'
import { EMPTY_SONG_DATA } from '@/types/song'
import { buildTagDictFromSongs } from '@/composables/useTagDict'

const LOCAL_KEY = 'song-list:local-override'

function loadLocalOverride(): SongData | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SongData
  } catch {
    return null
  }
}

/**
 * 既存データに tagDict が無いケースを補完する。
 * 既存タグから初期辞書を生成し、足りないキーだけ追加する（既存値は壊さない）。
 */
function ensureTagDict(data: SongData): SongData {
  if (!data.tagDict) data.tagDict = {}
  const built = buildTagDictFromSongs(data.songs)
  for (const [key, entry] of Object.entries(built)) {
    if (!data.tagDict[key]) data.tagDict[key] = entry
  }
  return data
}

export const useSongsStore = defineStore('songs', {
  state: () => ({
    data: { ...EMPTY_SONG_DATA, tagDict: {} } as SongData,
    loading: false,
    error: '' as string,
    useLocalOverride: false,
  }),
  getters: {
    songs: (state): Song[] => state.data.songs,
    tagDict: (state): Record<string, TagEntry> => state.data.tagDict ?? {},
    allTags: (state): string[] => {
      const set = new Set<string>()
      for (const s of state.data.songs) s.tags.forEach((t) => set.add(t))
      // 辞書にあるキーも含める（曲未割当のタグも編集可能にするため）
      for (const k of Object.keys(state.data.tagDict ?? {})) set.add(k)
      return Array.from(set).sort()
    },
    tagStats: (state): { tag: string; count: number; scale: number }[] => {
      const map = new Map<string, number>()
      for (const s of state.data.songs) for (const t of s.tags) map.set(t, (map.get(t) ?? 0) + 1)
      // 辞書にあるが使用されていないタグも 0 件で含める
      for (const k of Object.keys(state.data.tagDict ?? {})) {
        if (!map.has(k)) map.set(k, 0)
      }
      const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
      const max = Math.max(1, ...entries.map(([, c]) => c))
      const min = Math.min(...entries.map(([, c]) => c), max)
      const range = Math.max(1, max - min)
      return entries.map(([tag, count]) => ({
        tag,
        count,
        scale: (count - min) / range,
      }))
    },
    artistStats: (state): { artist: string; count: number }[] => {
      const map = new Map<string, number>()
      for (const s of state.data.songs) {
        const a = s.artist.trim()
        if (!a) continue
        map.set(a, (map.get(a) ?? 0) + 1)
      }
      return Array.from(map.entries())
        .map(([artist, count]) => ({ artist, count }))
        .sort((a, b) => b.count - a.count || a.artist.localeCompare(b.artist, 'ja'))
    },
    allLanguages: (state): string[] => {
      const set = new Set<string>()
      for (const s of state.data.songs) set.add(s.language)
      return Array.from(set)
    },
  },
  actions: {
    async loadFromPublic() {
      this.loading = true
      this.error = ''
      try {
        const override = loadLocalOverride()
        if (override) {
          this.data = ensureTagDict(override)
          this.useLocalOverride = true
        } else {
          const url = `${import.meta.env.BASE_URL}songs.json`
          const res = await fetch(url, { cache: 'no-cache' })
          if (!res.ok) throw new Error(`songs.json: ${res.status}`)
          const fetched = (await res.json()) as SongData
          this.data = ensureTagDict(fetched)
        }
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e)
      } finally {
        this.loading = false
      }
    },
    setData(next: SongData) {
      this.data = ensureTagDict(next)
    },
    saveLocal() {
      this.data.meta.updatedAt = new Date().toISOString()
      localStorage.setItem(LOCAL_KEY, JSON.stringify(this.data))
      this.useLocalOverride = true
    },
    clearLocal() {
      localStorage.removeItem(LOCAL_KEY)
      this.useLocalOverride = false
    },
    upsertSong(song: Song) {
      const idx = this.data.songs.findIndex((s) => s.id === song.id)
      if (idx >= 0) this.data.songs.splice(idx, 1, song)
      else this.data.songs.push(song)
      // 新規タグを辞書にも反映（en/zh は空欄＝ja にフォールバック表示）
      if (!this.data.tagDict) this.data.tagDict = {}
      for (const t of song.tags) {
        if (!this.data.tagDict[t]) this.data.tagDict[t] = { ja: t, en: '', zh: '' }
      }
    },
    removeSong(id: string) {
      this.data.songs = this.data.songs.filter((s) => s.id !== id)
    },
    /** 曲の並び順を完全に置き換える（drag-and-drop で使用）。 */
    reorderSongs(next: Song[]) {
      this.data.songs = next
    },
    /** タグ辞書に追加 or 翻訳更新（rename ではない）。 */
    upsertTag(entry: TagEntry) {
      if (!this.data.tagDict) this.data.tagDict = {}
      this.data.tagDict[entry.ja] = { ja: entry.ja, en: entry.en ?? '', zh: entry.zh ?? '' }
    },
    /** タグの ja キーを変更（カスケード rename：全曲の tags 配列も書き換え）。 */
    renameTag(oldKey: string, newEntry: TagEntry) {
      if (!this.data.tagDict) this.data.tagDict = {}
      if (oldKey === newEntry.ja) {
        // ja キー不変：翻訳の更新のみ
        this.upsertTag(newEntry)
        return
      }
      // 旧キーを削除して新キーを登録
      delete this.data.tagDict[oldKey]
      this.data.tagDict[newEntry.ja] = {
        ja: newEntry.ja,
        en: newEntry.en ?? '',
        zh: newEntry.zh ?? '',
      }
      // 全曲の tags 配列の旧キーを新キーに置換
      for (const s of this.data.songs) {
        if (s.tags.includes(oldKey)) {
          s.tags = s.tags.map((t) => (t === oldKey ? newEntry.ja : t))
        }
      }
    },
    /** タグを辞書からも全曲からも除去。 */
    removeTag(key: string) {
      if (this.data.tagDict) delete this.data.tagDict[key]
      for (const s of this.data.songs) {
        if (s.tags.includes(key)) s.tags = s.tags.filter((t) => t !== key)
      }
    },
  },
})
