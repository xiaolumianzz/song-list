import type { VideoLink } from '@/types/song'

export type VideoPlatform = 'youtube' | 'bilibili' | 'douyin' | 'other'
export type VideoAspect = '16:9' | '9:16'

export interface ParsedVideo {
  platform: VideoPlatform
  aspect: VideoAspect
  /** iframe で使える URL。other や Douyin、短縮 URL では undefined（外部リンクボタンへフォールバック）。 */
  embedUrl?: string
  originalUrl: string
}

const RE_YT_WATCH = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i
const RE_BILI_BV = /bilibili\.com\/video\/(BV[\w]+)/i
const RE_BILI_AV = /bilibili\.com\/video\/av(\d+)/i
const RE_DOUYIN = /douyin\.com\/video\/(\d+)/i

/**
 * 短縮 URL のホスト → プラットフォーム判定。
 * 短縮 URL はリダイレクト先（実 video ID）をクライアントから取れないので
 * iframe embed は不可。プラットフォームだけ識別して外部リンクボタンに繋ぐ。
 */
const SHORT_LINK_PLATFORM: Record<string, VideoPlatform> = {
  'b23.tv': 'bilibili',
  'v.douyin.com': 'douyin',
}

function shortLinkPlatform(url: string): VideoPlatform | null {
  try {
    const u = new URL(url)
    for (const host in SHORT_LINK_PLATFORM) {
      if (u.hostname.endsWith(host)) return SHORT_LINK_PLATFORM[host]
    }
  } catch {
    // ignore
  }
  return null
}

export function parseVideoEmbed(url: string): ParsedVideo {
  const trimmed = (url ?? '').trim()
  if (!trimmed) {
    return { platform: 'other', aspect: '16:9', originalUrl: trimmed }
  }

  // 短縮URLはリダイレクト先を取得できないので embed 不可だが、プラットフォームは識別する
  // 動画枠は他のプラットフォームと統一して 16:9 で表示する。
  const shortPlatform = shortLinkPlatform(trimmed)
  if (shortPlatform) {
    return { platform: shortPlatform, aspect: '16:9', originalUrl: trimmed }
  }

  const yt = trimmed.match(RE_YT_WATCH)
  if (yt) {
    return {
      platform: 'youtube',
      aspect: '16:9',
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}`,
      originalUrl: trimmed,
    }
  }

  const bv = trimmed.match(RE_BILI_BV)
  if (bv) {
    return {
      platform: 'bilibili',
      aspect: '16:9',
      // autoplay=0 でモーダルを開いた瞬間の自動再生を抑止
      embedUrl: `https://player.bilibili.com/player.html?bvid=${bv[1]}&high_quality=1&autoplay=0`,
      originalUrl: trimmed,
    }
  }
  const av = trimmed.match(RE_BILI_AV)
  if (av) {
    return {
      platform: 'bilibili',
      aspect: '16:9',
      embedUrl: `https://player.bilibili.com/player.html?aid=${av[1]}&high_quality=1&autoplay=0`,
      originalUrl: trimmed,
    }
  }

  const dy = trimmed.match(RE_DOUYIN)
  if (dy) {
    // Douyin は公式に外部 iframe 埋め込みをサポートしていないため embed URL は付けない。
    // VideoPlayer 側で動画エリア全体を「Douyin で見る」ボタンに置き換える。
    // 動画枠は他のプラットフォームと統一して 16:9 横長で表示する。
    return {
      platform: 'douyin',
      aspect: '16:9',
      originalUrl: trimmed,
    }
  }

  return { platform: 'other', aspect: '16:9', originalUrl: trimmed }
}

/** プラットフォーム名の表示用ラベル。 */
export function platformLabel(p: VideoPlatform): string {
  switch (p) {
    case 'youtube':
      return 'YouTube'
    case 'bilibili':
      return 'BiliBili'
    case 'douyin':
      return '抖音'
    default:
      return ''
  }
}

/**
 * 与えられた動画リンク群からユニークなプラットフォームを抽出する。
 * 出現順を保持しつつ重複を排除。`other` は判別不能なので結果に含めない。
 */
export function videoPlatforms(videos?: VideoLink[]): VideoPlatform[] {
  if (!videos || !videos.length) return []
  const seen = new Set<VideoPlatform>()
  const out: VideoPlatform[] = []
  for (const v of videos) {
    if (!v?.url?.trim()) continue
    const p = parseVideoEmbed(v.url).platform
    if (p === 'other') continue
    if (!seen.has(p)) {
      seen.add(p)
      out.push(p)
    }
  }
  return out
}
