import { createI18n } from 'vue-i18n'
import ja from './ja.json'
import en from './en.json'
import zh from './zh.json'

export type UiLocale = 'ja' | 'en' | 'zh'
const LS_KEY = 'song-list:locale'

function detect(): UiLocale {
  const saved = localStorage.getItem(LS_KEY) as UiLocale | null
  if (saved === 'ja' || saved === 'en' || saved === 'zh') return saved
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('zh')) return 'zh'
  if (nav.startsWith('en')) return 'en'
  return 'ja'
}

export const i18n = createI18n({
  legacy: false,
  locale: detect(),
  fallbackLocale: 'ja',
  messages: { ja, en, zh },
})

export function setLocale(locale: UiLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(LS_KEY, locale)
  document.documentElement.lang = locale
}
