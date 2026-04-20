import { defineStore } from 'pinia'

const TOKEN_KEY = 'song-list:gh-token'
const REPO_KEY = 'song-list:gh-repo'

interface RepoRef {
  owner: string
  repo: string
  branch: string
  path: string
  profilePath: string
}

const DEFAULT_REPO: RepoRef = {
  owner: '',
  repo: '',
  branch: 'main',
  path: 'public/songs.json',
  profilePath: 'public/profile.json',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: (localStorage.getItem(TOKEN_KEY) ?? '') as string,
    repo: (JSON.parse(localStorage.getItem(REPO_KEY) || 'null') ?? DEFAULT_REPO) as RepoRef,
  }),
  getters: {
    isConfigured: (s) => !!s.token && !!s.repo.owner && !!s.repo.repo,
  },
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)
    },
    setRepo(repo: Partial<RepoRef>) {
      this.repo = { ...this.repo, ...repo }
      localStorage.setItem(REPO_KEY, JSON.stringify(this.repo))
    },
    clear() {
      this.token = ''
      localStorage.removeItem(TOKEN_KEY)
    },
  },
})
