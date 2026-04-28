import type { LikeEntry, LikesSnapshot } from '@/types/likes'
import { LIKES_SCHEMA_VERSION } from '@/types/likes'

/**
 * いいねの永続化を抽象化したアダプタ。
 *
 * 現在は LocalStorage 実装のみ。将来サーバー集計を入れるときは
 * Remote 実装を作って `setLikesStorage()` で差し替える想定。
 */
export interface LikesStorage {
  load(): LikesSnapshot
  save(snapshot: LikesSnapshot): void
}

const KEY = 'song-list:likes:v1'

function generateClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function emptySnapshot(): LikesSnapshot {
  return { version: LIKES_SCHEMA_VERSION, clientId: generateClientId(), entries: [] }
}

function isLikeEntry(value: unknown): value is LikeEntry {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.songId === 'string' && typeof v.likedAt === 'string'
}

export const localLikesStorage: LikesStorage = {
  load(): LikesSnapshot {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return emptySnapshot()
      const parsed = JSON.parse(raw) as Partial<LikesSnapshot>
      if (!parsed || typeof parsed.clientId !== 'string' || !Array.isArray(parsed.entries)) {
        return emptySnapshot()
      }
      return {
        version: typeof parsed.version === 'number' ? parsed.version : LIKES_SCHEMA_VERSION,
        clientId: parsed.clientId,
        entries: parsed.entries.filter(isLikeEntry),
      }
    } catch {
      return emptySnapshot()
    }
  },
  save(snapshot) {
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot))
    } catch {
      // localStorage 無効（プライベートブラウズ等）はメモリ上のみ保持
    }
  },
}
