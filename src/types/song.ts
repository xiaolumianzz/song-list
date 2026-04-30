export type Language = 'ja' | 'en' | 'zh' | 'ko' | 'other'

export interface VideoLink {
  /** 元 URL（YouTube watch URL / BiliBili / TikTok / Douyin など） */
  url: string
  /** 任意ラベル：「カラオケver.」「弾き語り」「2024配信版」など */
  label?: string
}

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
  /** 曲が最後に編集された日時（ISO 8601）。新規時は addedAt と同義に近い。
   *  既存データに無い場合は sort 時に addedAt をフォールバック。 */
  updatedAt?: string
  /** 曲名の読み仮名（ひらがな推奨）。五十音ソート・検索精度向上のため optional。 */
  titleReading?: string
  /** アーティスト名の読み仮名。 */
  artistReading?: string
  /** 歌ってみた動画リンク。複数登録可（左右矢印で切替）。 */
  videos?: VideoLink[]
  /** ギターコード参照URL（コード譜サイト等）。1曲につき 1 URL。 */
  chordUrl?: string
}

export interface TagEntry {
  /** カノニカル日本語名（辞書のキー、Song.tags の文字列と一致） */
  ja: string
  /** 英語訳（空なら表示時に ja にフォールバック） */
  en?: string
  /** 中国語訳（空なら表示時に ja にフォールバック） */
  zh?: string
}

export interface SongData {
  meta: { version: number; updatedAt: string }
  songs: Song[]
  /** タグ多言語辞書。キーは Song.tags に入っているカノニカル文字列。
   *  既存 songs.json への後方互換のため optional。 */
  tagDict?: Record<string, TagEntry>
}

export const EMPTY_SONG_DATA: SongData = {
  meta: { version: 1, updatedAt: new Date().toISOString() },
  songs: [],
  tagDict: {},
}

export const LANGUAGE_ORDER: Language[] = ['ja', 'en', 'zh', 'ko', 'other']

// 「リクエスト条件」は使わなくなったため、メンバー限定のみ残す。
// 既存データに別の条件文字列が入っていても Song.conditions は string[] のままなので、
// silent に保持される（admin の編集UIには出てこないが消されもしない）。
export const CONDITION_KEYS = ['members-only'] as const
export type ConditionKey = (typeof CONDITION_KEYS)[number]
