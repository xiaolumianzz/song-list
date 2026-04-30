export type SnsKey = 'bilibili' | 'tiktok' | 'youtube' | 'twitter'

export const SNS_KEYS: SnsKey[] = ['bilibili', 'tiktok', 'youtube', 'twitter']

export interface Profile {
  iconUrl: string
  displayName: string
  tagline: string
  links: Record<SnsKey, string>
  /** 新着バッジを表示する日数（1〜365）。0 / 負値 / 未設定なら NEW_BADGE_DEFAULT_DAYS を使用。 */
  newBadgeDays?: number
  meta: { version: number; updatedAt: string }
}

export const NEW_BADGE_DEFAULT_DAYS = 14

export const EMPTY_PROFILE: Profile = {
  iconUrl: '',
  displayName: '',
  tagline: '',
  links: { bilibili: '', tiktok: '', youtube: '', twitter: '' },
  newBadgeDays: NEW_BADGE_DEFAULT_DAYS,
  meta: { version: 1, updatedAt: new Date().toISOString() },
}
