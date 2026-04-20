import { defineStore } from 'pinia'
import type { Profile } from '@/types/profile'
import { EMPTY_PROFILE } from '@/types/profile'

const LOCAL_KEY = 'song-list:profile-local-override'

function loadLocalOverride(): Profile | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    data: { ...EMPTY_PROFILE } as Profile,
    loading: false,
    error: '' as string,
    useLocalOverride: false,
  }),
  actions: {
    async loadFromPublic() {
      this.loading = true
      this.error = ''
      try {
        const override = loadLocalOverride()
        if (override) {
          this.data = override
          this.useLocalOverride = true
        } else {
          const url = `${import.meta.env.BASE_URL}profile.json`
          const res = await fetch(url, { cache: 'no-cache' })
          if (!res.ok) throw new Error(`profile.json: ${res.status}`)
          this.data = (await res.json()) as Profile
        }
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e)
      } finally {
        this.loading = false
      }
    },
    setData(next: Profile) {
      this.data = next
    },
    saveLocal() {
      this.data.meta.updatedAt = new Date().toISOString()
      localStorage.setItem(LOCAL_KEY, JSON.stringify(this.data))
      this.useLocalOverride = true
    },
    clearLocal() {
      localStorage.removeItem(LOCAL_KEY)
      this.useLocalOverride = false
    },
  },
})
