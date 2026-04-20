export type SnsKey = 'bilibili' | 'tiktok' | 'youtube' | 'twitter'

export const SNS_KEYS: SnsKey[] = ['bilibili', 'tiktok', 'youtube', 'twitter']

export interface Profile {
  iconUrl: string
  displayName: string
  tagline: string
  links: Record<SnsKey, string>
  meta: { version: number; updatedAt: string }
}

export const EMPTY_PROFILE: Profile = {
  iconUrl: '',
  displayName: '',
  tagline: '',
  links: { bilibili: '', tiktok: '', youtube: '', twitter: '' },
  meta: { version: 1, updatedAt: new Date().toISOString() },
}
