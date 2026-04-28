import { Octokit } from '@octokit/rest'
import type { SongData } from '@/types/song'
import type { Profile } from '@/types/profile'
import { useAuthStore } from '@/stores/auth'

interface GithubFileResponse {
  content: string
  sha: string
}

export function useGithub() {
  const auth = useAuthStore()

  function client() {
    if (!auth.token) throw new Error('GitHub token is not set')
    return new Octokit({
      auth: auth.token,
      request: {
        // ブラウザ HTTP キャッシュをバイパス。
        // GitHub の API レスポンスは Cache-Control: private, max-age=60 のため、
        // 直前に push して sha が変わった直後でも 60 秒間は古い sha が返ってきて
        // しまい、次の push で「does not match」エラーになる事象を防ぐ。
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...(init ?? {}), cache: 'no-store' }),
      },
    })
  }

  async function fetchJson<T>(path: string): Promise<{ data: T; sha: string }> {
    const oct = client()
    const { data: res } = await oct.repos.getContent({
      owner: auth.repo.owner,
      repo: auth.repo.repo,
      path,
      ref: auth.repo.branch,
    })
    if (Array.isArray(res) || res.type !== 'file')
      throw new Error('Target path is not a file')
    const file = res as unknown as GithubFileResponse
    const decoded = decodeBase64Utf8(file.content.replace(/\n/g, ''))
    return { data: JSON.parse(decoded) as T, sha: file.sha }
  }

  async function pushJson(path: string, data: unknown, message: string, sha?: string) {
    const oct = client()
    const payload = JSON.stringify(data, null, 2) + '\n'
    const content = encodeBase64Utf8(payload)
    await oct.repos.createOrUpdateFileContents({
      owner: auth.repo.owner,
      repo: auth.repo.repo,
      path,
      branch: auth.repo.branch,
      message,
      content,
      sha,
    })
  }

  // バイナリ（画像等）を push する。`base64Content` は既に base64 エンコード済みの文字列
  async function pushBinary(
    path: string,
    base64Content: string,
    message: string,
    sha?: string,
  ) {
    const oct = client()
    await oct.repos.createOrUpdateFileContents({
      owner: auth.repo.owner,
      repo: auth.repo.repo,
      path,
      branch: auth.repo.branch,
      message,
      content: base64Content,
      sha,
    })
  }

  async function fetchFileSha(path: string): Promise<string> {
    const oct = client()
    const { data: res } = await oct.repos.getContent({
      owner: auth.repo.owner,
      repo: auth.repo.repo,
      path,
      ref: auth.repo.branch,
    })
    if (Array.isArray(res) || res.type !== 'file')
      throw new Error('Target path is not a file')
    const file = res as unknown as GithubFileResponse
    return file.sha
  }

  /**
   * リポジトリ自体にアクセスできるかを確認する。
   * 404 のとき「ファイルが存在しないだけ」と「PAT 権限でリポジトリが見えない」を
   * 切り分けるのに使う。
   */
  async function checkRepoAccess() {
    const oct = client()
    await oct.repos.get({ owner: auth.repo.owner, repo: auth.repo.repo })
  }

  // 既存API（互換のため残す・内部で汎用関数を呼ぶ）
  function fetchSongs() {
    return fetchJson<SongData>(auth.repo.path)
  }
  function pushSongs(data: SongData, message: string, sha?: string) {
    return pushJson(auth.repo.path, data, message, sha)
  }

  // プロフィール
  function fetchProfile() {
    return fetchJson<Profile>(auth.repo.profilePath)
  }
  function pushProfile(data: Profile, message: string, sha?: string) {
    return pushJson(auth.repo.profilePath, data, message, sha)
  }

  return {
    fetchSongs,
    pushSongs,
    fetchProfile,
    pushProfile,
    pushBinary,
    fetchFileSha,
    checkRepoAccess,
  }
}

function encodeBase64Utf8(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function decodeBase64Utf8(input: string): string {
  const binary = atob(input)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
