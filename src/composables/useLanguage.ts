import { useI18n } from 'vue-i18n'
import { LANGUAGE_ORDER } from '@/types/song'

/**
 * 予め i18n ラベルが用意されている言語コードかどうか。
 * 自由入力された値は false を返す。
 */
export function isPredefinedLanguage(code: string): boolean {
  if (!code) return false
  return (LANGUAGE_ORDER as readonly string[]).includes(code)
}

/**
 * 言語コードを表示用テキストに変換するヘルパーフック。
 * - 予め用意された言語（ja/en/zh/ko/other）→ 現在のロケールに対応する翻訳
 * - それ以外（自由入力）→ 入力された文字列をそのまま返す
 */
export function useLanguageDisplay() {
  const { t } = useI18n()
  return (code: string): string => {
    if (!code) return ''
    return isPredefinedLanguage(code) ? t('language.' + code) : code
  }
}
