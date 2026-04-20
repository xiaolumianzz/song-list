import { defineStore } from 'pinia'
import type { Song, SongData } from '@/types/song'
import { EMPTY_SONG_DATA } from '@/types/song'

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

export const useSongsStore = defineStore('songs', {
  state: () => ({
    data: EMPTY_SONG_DATA as SongData,
    loading: false,
    error: '' as string,
    useLocalOverride: false,
  }),
  getters: {
    songs: (state): Song[] => state.data.songs,
    allTags: (state): string[] => {
      const set = new Set<string>()
      for (const s of state.data.songs) s.tags.forEach((t) => set.add(t))
      return Array.from(set).sort()
    },
    tagStats: (state): { tag: string; count: number; scale: number }[] => {
      const map = new Map<string, number>()
      for (const s of state.data.songs) for (const t of s.tags) map.set(t, (map.get(t) ?? 0) + 1)
      const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
      const max = Math.max(1, ...entries.map(([, c]) => c))
      const min = Math.min(...entries.map(([, c]) => c), max)
      const range = Math.max(1, max - min)
      return entries.map(([tag, count]) => ({
        tag,
        count,
        scale: (count - min) / range, // 0 (least popular) .. 1 (most popular)
      }))
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
          this.data = override
          this.useLocalOverride = true
        } else {
          const url = `${import.meta.env.BASE_URL}songs.json`
          const res = await fetch(url, { cache: 'no-cache' })
          if (!res.ok) throw new Error(`songs.json: ${res.status}`)
          this.data = (await res.json()) as SongData
        }
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e)
      } finally {
        this.loading = false
      }
    },
    setData(next: SongData) {
      this.data = next
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
    },
    removeSong(id: string) {
      this.data.songs = this.data.songs.filter((s) => s.id !== id)
    },
  },
})
