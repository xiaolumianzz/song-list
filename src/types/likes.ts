/**
 * いいね機能のデータ構造。
 * 将来サーバーへ集計を送るため、clientId と likedAt をローカル時点で持っておく。
 */
export interface LikeEntry {
  songId: string
  /** ISO 8601 (UTC)。サーバー側で集計するときに使う想定 */
  likedAt: string
}

export interface LikesSnapshot {
  version: number
  /**
   * ブラウザごとに発行する匿名 ID。サーバー集計時に重複カウント抑止に使う想定。
   * 初回訪問時に自動生成、以降は LocalStorage に永続化される。
   */
  clientId: string
  entries: LikeEntry[]
}

export const LIKES_SCHEMA_VERSION = 1
