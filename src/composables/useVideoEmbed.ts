export type VideoPlatform = 'youtube' | 'bilibili' | 'tiktok' | 'douyin' | 'other'
export type VideoAspect = '16:9' | '9:16'

export interface ParsedVideo {
  platform: VideoPlatform
  aspect: VideoAspect
  /** iframe で使える URL。other や短縮 URL では undefined になることがある（外部リンクフォールバック）。 */
  embedUrl?: string
  originalUrl: string
}

const RE_YT_WATCH = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i
const RE_BILI_BV = /bilibili\.com\/video\/(BV[\w]+)/i
const RE_BILI_AV = /bilibili\.com\/video\/av(\d+)/i
const RE_TIKTOK = /tiktok\.com\/@[^/]+\/video\/(\d+)/i
const RE_DOUYIN = /douyin\.com\/video\/(\d+)/i

/**
 * 短縮 URL のホスト → プラットフォーム判定。
 * 短縮 URL はリダイレクト先（実 video ID）をクライアントから取れないので
 * iframe embed は不可。プラットフォームだけ識別して外部リンクボタンに繋ぐ。
 */
const SHORT_LINK_PLATFORM: Record<string, VideoPlatform> = {
  'b23.tv': 'bilibili',
  'vm.tiktok.com': 'tiktok',
  't.tiktok.com': 'tiktok',
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
  const shortPlatform = shortLinkPlatform(trimmed)
  if (shortPlatform) {
    const aspect: VideoAspect =
      shortPlatform === 'tiktok' || shortPlatform === 'douyin' ? '9:16' : '16:9'
    return { platform: shortPlatform, aspect, originalUrl: trimmed }
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

  const tt = trimmed.match(RE_TIKTOK)
  if (tt) {
    return {
      platform: 'tiktok',
      aspect: '9:16',
      embedUrl: `https://www.tiktok.com/embed/v2/${tt[1]}`,
      originalUrl: trimmed,
    }
  }

  const dy = trimmed.match(RE_DOUYIN)
  if (dy) {
    // Douyin 公式の埋め込み API は不安定なので一旦 embed URL は付けず外部リンク扱いにする。
    // （iframe 表示を試みても CSP/X-Frame-Options で弾かれるケースが多い）
    return {
      platform: 'douyin',
      aspect: '9:16',
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
    case 'tiktok':
      return 'TikTok'
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
import type { VideoLink } from '@/types/song'
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
