import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// 固定のサイトタイトル
const SITE_TITLE = "🍫 Riru璃露's Song List ♡"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// public/profile.json の内容と profile-icon.png の有無をもとに
// index.html の OGP プレースホルダを置換するプラグイン。
// ビルド時・devサーバ時どちらでも動く。
function ogpInjectPlugin(): Plugin {
  return {
    name: 'ogp-inject',
    transformIndexHtml(html) {
      const publicDir = path.resolve(__dirname, 'public')
      let tagline = ''
      let displayName = 'Riru璃露'
      try {
        const raw = fs.readFileSync(path.join(publicDir, 'profile.json'), 'utf8')
        const profile = JSON.parse(raw)
        tagline = typeof profile.tagline === 'string' ? profile.tagline : ''
        if (typeof profile.displayName === 'string' && profile.displayName) {
          displayName = profile.displayName
        }
      } catch {
        // profile.json が無ければデフォルト値で続行
      }

      const hasIcon = fs.existsSync(path.join(publicDir, 'profile-icon.png'))
      const hasChar = fs.existsSync(path.join(publicDir, 'character.png'))
      const ogImage = hasIcon
        ? './profile-icon.png'
        : hasChar
        ? './character.png'
        : './favicon.svg'

      const description =
        tagline ||
        `${displayName}の歌える曲リスト ♡ Song Catalog ♡ 曲单目录`

      const tags = [
        `<meta name="description" content="${escapeHtml(description)}" />`,
        `<meta name="theme-color" content="#ffbac3" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${escapeHtml(SITE_TITLE)}" />`,
        `<meta property="og:description" content="${escapeHtml(description)}" />`,
        `<meta property="og:image" content="${ogImage}" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${escapeHtml(SITE_TITLE)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
        `<meta name="twitter:image" content="${ogImage}" />`,
      ].join('\n    ')

      return html
        .replace(/<!--\s*OGP\s*-->/, tags)
        .replace(
          /<title>[^<]*<\/title>/,
          `<title>${escapeHtml(SITE_TITLE)}</title>`,
        )
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [vue(), ogpInjectPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
