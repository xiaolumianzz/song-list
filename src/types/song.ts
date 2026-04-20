export type Language = 'ja' | 'en' | 'zh' | 'ko' | 'other'

export interface Song {
  id: string
  title: string
  artist: string
  language: Language
  tags: string[]
  conditions: string[]
  remark: string
  addedAt: string
  /** BiliBili Super Chat 金額。0 or 未設定なら非表示 */
  sc?: number
}

export interface SongData {
  meta: { version: number; updatedAt: string }
  songs: Song[]
}

export const EMPTY_SONG_DATA: SongData = {
  meta: { version: 1, updatedAt: new Date().toISOString() },
  songs: [],
}

export const LANGUAGE_ORDER: Language[] = ['ja', 'en', 'zh', 'ko', 'other']

export const CONDITION_KEYS = [
  'karaoke-only',
  'practice-needed',
  'paid-only',
  'members-only',
  'with-guitar',
  'short-version',
] as const
export type ConditionKey = (typeof CONDITION_KEYS)[number]
