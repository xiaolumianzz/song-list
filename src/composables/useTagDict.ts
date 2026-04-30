import type { TagEntry } from '@/types/song'

/**
 * タグ表示文字列を解決する。
 * - 辞書に登録されており、対応ロケールの値が入っていればそれを返す
 * - 空または未登録なら日本語値（=キー文字列）を返す
 */
export function tagDisplay(
  key: string,
  locale: string,
  dict?: Record<string, TagEntry>,
): string {
  const entry = dict?.[key]
  if (!entry) return key
  if (locale === 'en' && entry.en && entry.en.trim()) return entry.en
  if (locale === 'zh' && entry.zh && entry.zh.trim()) return entry.zh
  return entry.ja || key
}

/**
 * 既存 songs から tagDict を初期生成する（マイグレーション用）。
 * 各タグに対して `{ ja: tag, en: '', zh: '' }` を設定（空欄フォールバックで表示は ja）。
 */
export function buildTagDictFromSongs(
  songs: { tags: string[] }[],
): Record<string, TagEntry> {
  const dict: Record<string, TagEntry> = {}
  for (const s of songs) {
    for (const t of s.tags) {
      if (!dict[t]) dict[t] = { ja: t, en: '', zh: '' }
    }
  }
  return dict
}

/**
 * 追加日が `days` 日以内なら true。
 * - addedAt は YYYY-MM-DD 文字列を想定（過去はパース失敗時 false）
 * - days <= 0 や非有限値は無効扱いで常に false
 */
export function isRecentlyAdded(addedAt: string, days: number): boolean {
  if (!addedAt || !Number.isFinite(days) || days <= 0) return false
  const t = Date.parse(addedAt)
  if (Number.isNaN(t)) return false
  const now = Date.now()
  const diffMs = now - t
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000
}
