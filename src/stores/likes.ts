import { defineStore } from 'pinia'
import { localLikesStorage, type LikesStorage } from '@/composables/useLikesStorage'
import type { LikeEntry, LikesSnapshot } from '@/types/likes'

/**
 * 現在のストレージ実装。
 * 将来サーバー集計に切り替えたいときは setLikesStorage(remoteImpl) で差し替える。
 */
let storage: LikesStorage = localLikesStorage

export function setLikesStorage(next: LikesStorage) {
  storage = next
}

export const useLikesStore = defineStore('likes', {
  state: () => {
    const snap = storage.load()
    const entries = new Map<string, LikeEntry>()
    for (const e of snap.entries) entries.set(e.songId, e)
    return {
      version: snap.version,
      clientId: snap.clientId,
      entries,
    }
  },
  getters: {
    count: (state): number => state.entries.size,
    likedIds: (state): string[] => [...state.entries.keys()],
    isLiked: (state) => (id: string): boolean => state.entries.has(id),
    likedAt: (state) => (id: string): string | undefined => state.entries.get(id)?.likedAt,
    snapshot(state): LikesSnapshot {
      return {
        version: state.version,
        clientId: state.clientId,
        entries: [...state.entries.values()],
      }
    },
  },
  actions: {
    persist() {
      storage.save(this.snapshot)
    },
    like(songId: string) {
      if (this.entries.has(songId)) return
      this.entries.set(songId, { songId, likedAt: new Date().toISOString() })
      this.persist()
    },
    unlike(songId: string) {
      if (!this.entries.has(songId)) return
      this.entries.delete(songId)
      this.persist()
    },
    toggle(songId: string) {
      if (this.entries.has(songId)) this.unlike(songId)
      else this.like(songId)
    },
    clearAll() {
      this.entries.clear()
      this.persist()
    },
  },
})
