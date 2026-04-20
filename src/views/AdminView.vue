<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSongsStore } from '@/stores/songs'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { useGithub } from '@/composables/useGithub'
import { CONDITION_KEYS, LANGUAGE_ORDER, type Language, type Song } from '@/types/song'
import { SNS_KEYS, type SnsKey } from '@/types/profile'
import LangSwitcher from '@/components/LangSwitcher.vue'
import PasswordGate from '@/components/PasswordGate.vue'

const { t } = useI18n()
const songsStore = useSongsStore()
const profileStore = useProfileStore()
const auth = useAuthStore()
const gh = useGithub()
const { songs, useLocalOverride } = storeToRefs(songsStore)
const { data: profile, useLocalOverride: profileLocalOverride } = storeToRefs(profileStore)

const status = ref<string>('')
const busy = ref(false)
const sha = ref<string | undefined>(undefined)
const profileSha = ref<string | undefined>(undefined)
const profileStatus = ref<string>('')
const profileBusy = ref(false)
const tokenInput = ref(auth.token)
const repoOwner = ref(auth.repo.owner)
const repoName = ref(auth.repo.repo)
const repoBranch = ref(auth.repo.branch || 'main')
const repoPath = ref(auth.repo.path || 'public/songs.json')
const repoProfilePath = ref(auth.repo.profilePath || 'public/profile.json')
const fileInputRef = ref<HTMLInputElement | null>(null)

function saveCreds() {
  auth.setToken(tokenInput.value)
  auth.setRepo({
    owner: repoOwner.value,
    repo: repoName.value,
    branch: repoBranch.value,
    path: repoPath.value,
    profilePath: repoProfilePath.value,
  })
  status.value = t('admin.status.savedLocal')
}

async function fetchFromGithub() {
  busy.value = true
  status.value = ''
  try {
    const { data, sha: gotSha } = await gh.fetchSongs()
    songsStore.setData(data)
    sha.value = gotSha
    status.value = t('admin.status.fetched')
  } catch (e) {
    status.value = '⚠ ' + (e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

async function pushToGithub() {
  busy.value = true
  status.value = ''
  try {
    // 既存ファイルを更新するには sha が必要。未取得なら先に取得
    if (sha.value === undefined) {
      try {
        const { sha: gotSha } = await gh.fetchSongs()
        sha.value = gotSha
      } catch {
        // ファイルが存在しない新規作成ケース → sha は不要
      }
    }
    songsStore.data.meta.updatedAt = new Date().toISOString()
    await gh.pushSongs(songsStore.data, `chore(songs): update via admin ui`, sha.value)
    status.value = t('admin.status.pushed')
    songsStore.clearLocal()
    // push 後は新しい sha を取り直す
    const { sha: gotSha } = await gh.fetchSongs()
    sha.value = gotSha
  } catch (e) {
    status.value = '⚠ ' + (e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

// フォーム
const draft = ref<Song>(emptySong())
const editingId = ref<string | null>(null)

function emptySong(): Song {
  return {
    id: '',
    title: '',
    artist: '',
    language: 'ja' as Language,
    tags: [],
    conditions: [],
    remark: '',
    addedAt: new Date().toISOString().slice(0, 10),
  }
}

const tagsInput = ref('')
const conditionCheckState = computed(() => new Set(draft.value.conditions))

function toggleCondition(c: string) {
  const set = new Set(draft.value.conditions)
  if (set.has(c)) set.delete(c)
  else set.add(c)
  draft.value.conditions = Array.from(set)
}

function commitDraft() {
  if (!draft.value.title.trim() || !draft.value.artist.trim()) {
    status.value = '⚠ ' + t('admin.status.required')
    return
  }
  const tags = tagsInput.value
    .split(/[,\u3001、\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  draft.value.tags = tags
  if (!draft.value.id) draft.value.id = crypto.randomUUID()
  songsStore.upsertSong({ ...draft.value })
  songsStore.saveLocal()
  status.value = t('admin.status.savedLocal')
  draft.value = emptySong()
  tagsInput.value = ''
  editingId.value = null
}

function edit(song: Song) {
  draft.value = { ...song, tags: [...song.tags], conditions: [...song.conditions] }
  tagsInput.value = song.tags.join(', ')
  editingId.value = song.id
}

function remove(song: Song) {
  if (!confirm(t('admin.confirmDelete', { title: song.title }))) return
  songsStore.removeSong(song.id)
  songsStore.saveLocal()
}

function cancelEdit() {
  draft.value = emptySong()
  tagsInput.value = ''
  editingId.value = null
}

function exportJson() {
  const blob = new Blob([JSON.stringify(songsStore.data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'songs.json'
  a.click()
  URL.revokeObjectURL(url)
}

function resetLocal() {
  if (!confirm(t('admin.confirmResetLocal'))) return
  songsStore.clearLocal()
  songsStore.loadFromPublic()
  status.value = t('admin.status.resetLocal')
}

// ===================== プロフィール編集 =====================

async function onIconFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    profile.value.iconUrl = await fileToAvatarDataUrl(file)
    profileStatus.value = ''
  } catch (err) {
    profileStatus.value = '⚠ ' + (err instanceof Error ? err.message : String(err))
  } finally {
    // 同じファイルを再度選べるように input を空に
    if (input) input.value = ''
  }
}

function clearIcon() {
  profile.value.iconUrl = ''
}

function saveProfileLocal() {
  profileStore.saveLocal()
  profileStatus.value = t('admin.status.savedLocal')
}

function resetProfileLocal() {
  if (!confirm(t('admin.confirmResetLocal'))) return
  profileStore.clearLocal()
  profileStore.loadFromPublic()
  profileStatus.value = t('admin.status.resetLocal')
}

async function fetchProfileFromGithub() {
  profileBusy.value = true
  profileStatus.value = ''
  try {
    const { data, sha: gotSha } = await gh.fetchProfile()
    profileStore.setData(data)
    profileSha.value = gotSha
    profileStatus.value = t('admin.status.fetched')
  } catch (e) {
    profileStatus.value = '⚠ ' + (e instanceof Error ? e.message : String(e))
  } finally {
    profileBusy.value = false
  }
}

async function pushProfileToGithub() {
  profileBusy.value = true
  profileStatus.value = ''
  try {
    // 既存ファイルを更新するには sha が必要。未取得なら先に取得
    if (profileSha.value === undefined) {
      try {
        const { sha: gotSha } = await gh.fetchProfile()
        profileSha.value = gotSha
      } catch {
        // ファイルが存在しない新規作成ケース → sha は不要
      }
    }
    profile.value.meta.updatedAt = new Date().toISOString()
    await gh.pushProfile(profile.value, 'chore(profile): update via admin ui', profileSha.value)

    // OGP のサムネに使うため、アイコンを別ファイル public/profile-icon.png として push
    await pushIconBinaryIfDataUri().catch((e) => {
      // アイコン push に失敗しても本体更新は成功しているので warn 扱い
      console.warn('icon binary push failed:', e)
    })

    profileStatus.value = t('admin.status.pushed')
    profileStore.clearLocal()
    const { sha: gotSha } = await gh.fetchProfile()
    profileSha.value = gotSha
  } catch (e) {
    profileStatus.value = '⚠ ' + (e instanceof Error ? e.message : String(e))
  } finally {
    profileBusy.value = false
  }
}

async function pushIconBinaryIfDataUri() {
  const iconUrl = profile.value.iconUrl
  if (!iconUrl || !iconUrl.startsWith('data:image/')) return
  const base64 = iconUrl.split(',')[1]
  if (!base64) return
  const iconPath = 'public/profile-icon.png'
  let iconSha: string | undefined
  try {
    iconSha = await gh.fetchFileSha(iconPath)
  } catch {
    // 初回 push の場合はファイル未存在で OK
  }
  await gh.pushBinary(iconPath, base64, 'chore(profile): update icon', iconSha)
}

// File → 中央クロップして 256×256 PNG の data URI を返す
async function fileToAvatarDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas unsupported'))
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('image load error'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('file read error'))
    reader.readAsDataURL(file)
  })
}

function snsLabel(k: SnsKey): string {
  const labels: Record<SnsKey, string> = {
    bilibili: 'BiliBili',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter / X',
  }
  return labels[k]
}
</script>

<template>
  <PasswordGate v-slot="{ logout }">
  <main class="mx-auto max-w-5xl px-4 py-10 sm:px-8">
    <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-2xl font-bold text-ink">🔐 {{ t('admin.title') }}</h1>
      <div class="flex items-center gap-3">
        <LangSwitcher />
        <button
          type="button"
          class="rounded-full border border-ash/40 bg-white/70 px-3 py-1 text-xs text-ink/70 hover:bg-white"
          @click="logout"
        >
          🔒 {{ t('gate.lock') }}
        </button>
        <router-link
          to="/"
          class="rounded-full border border-ash/40 bg-white/70 px-3 py-1 text-xs text-ink/70 hover:bg-white"
        >
          {{ t('nav.home') }}
        </router-link>
      </div>
    </header>

    <section class="mb-6 rounded-3xl bg-white/80 p-5 shadow-soft">
      <h2 class="mb-3 font-display text-lg text-ink">{{ t('admin.credentials') }}</h2>
      <p class="mb-4 text-xs text-ink/70">
        {{ t('admin.credentialsHelp') }}
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.owner') }}</span>
          <input v-model="repoOwner" class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura" placeholder="yourname" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.repo') }}</span>
          <input v-model="repoName" class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura" placeholder="song-list" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.branch') }}</span>
          <input v-model="repoBranch" class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.path') }}</span>
          <input v-model="repoPath" class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura" />
        </label>
        <label class="flex flex-col gap-1 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.profilePath') }}</span>
          <input v-model="repoProfilePath" class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura" placeholder="public/profile.json" />
        </label>
        <label class="flex flex-col gap-1 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.token') }}</span>
          <input
            v-model="tokenInput"
            type="password"
            autocomplete="off"
            class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura"
            placeholder="github_pat_..."
          />
        </label>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button class="rounded-full bg-sakura px-4 py-1.5 text-sm text-white hover:bg-rose" @click="saveCreds">
          {{ t('admin.save') }}
        </button>
        <button
          class="rounded-full border border-sakura px-4 py-1.5 text-sm text-rose hover:bg-blush"
          :disabled="!auth.isConfigured || busy"
          @click="fetchFromGithub"
        >
          ↓ {{ t('admin.fetch') }}
        </button>
        <button
          class="rounded-full bg-rose px-4 py-1.5 text-sm text-white hover:bg-sakura"
          :disabled="!auth.isConfigured || busy"
          @click="pushToGithub"
        >
          ↑ {{ t('admin.push') }}
        </button>
        <button
          class="rounded-full border border-ash/40 px-4 py-1.5 text-sm text-ink/70 hover:bg-white"
          @click="exportJson"
        >
          📥 {{ t('admin.export') }}
        </button>
        <button
          class="ml-auto rounded-full border border-ash/40 px-4 py-1.5 text-sm text-ink/70 hover:bg-white"
          @click="resetLocal"
        >
          {{ t('admin.resetLocal') }}
        </button>
      </div>
      <p v-if="useLocalOverride" class="mt-3 text-xs text-rose">
        ✎ {{ t('admin.localOverrideNotice') }}
      </p>
      <p v-if="status" class="mt-2 text-sm text-ink/80">{{ status }}</p>
    </section>

    <!-- プロフィール編集 -->
    <section class="mb-6 rounded-3xl bg-white/80 p-5 shadow-soft">
      <h2 class="mb-3 font-display text-lg text-ink">👤 {{ t('admin.profile.title') }}</h2>
      <p class="mb-4 text-xs text-ink/70">{{ t('admin.profile.help') }}</p>

      <div class="flex flex-wrap items-start gap-5">
        <!-- アイコン -->
        <div class="flex flex-col items-center gap-2">
          <div class="relative">
            <img
              v-if="profile.iconUrl"
              :src="profile.iconUrl"
              class="h-28 w-28 rounded-full border-2 border-white/80 object-cover shadow-soft"
              alt=""
            />
            <div
              v-else
              class="flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/80 bg-white/60 text-3xl shadow-soft"
            >
              🎀
            </div>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onIconFileChange"
          />
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-full bg-sakura px-3 py-1 text-xs text-white hover:bg-rose"
              @click="fileInputRef?.click()"
            >
              📷 {{ t('admin.profile.chooseImage') }}
            </button>
            <button
              v-if="profile.iconUrl"
              type="button"
              class="rounded-full border border-ash/40 px-3 py-1 text-xs text-ink/70 hover:bg-white"
              @click="clearIcon"
            >
              {{ t('admin.profile.removeImage') }}
            </button>
          </div>
          <p class="max-w-[14rem] text-center text-[10px] text-ink/50">
            {{ t('admin.profile.imageHint') }}
          </p>
        </div>

        <!-- テキスト系 -->
        <div class="grid flex-1 min-w-[240px] gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1 text-sm sm:col-span-2">
            <span class="text-ink/70">{{ t('admin.profile.displayName') }}</span>
            <input
              v-model="profile.displayName"
              class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura"
              placeholder="Riru璃露"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm sm:col-span-2">
            <span class="text-ink/70">{{ t('admin.profile.tagline') }}</span>
            <input
              v-model="profile.tagline"
              class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura"
              :placeholder="t('admin.profile.taglinePh')"
            />
          </label>
          <label v-for="k in SNS_KEYS" :key="k" class="flex flex-col gap-1 text-sm sm:col-span-2">
            <span class="text-ink/70">{{ snsLabel(k) }} URL</span>
            <input
              v-model="profile.links[k]"
              class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura"
              :placeholder="t('admin.profile.urlPh')"
            />
          </label>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button
          class="rounded-full bg-sakura px-4 py-1.5 text-sm text-white hover:bg-rose"
          @click="saveProfileLocal"
        >
          {{ t('admin.save') }}
        </button>
        <button
          class="rounded-full border border-sakura px-4 py-1.5 text-sm text-rose hover:bg-blush disabled:opacity-60"
          :disabled="!auth.isConfigured || profileBusy"
          @click="fetchProfileFromGithub"
        >
          ↓ {{ t('admin.fetch') }}
        </button>
        <button
          class="rounded-full bg-rose px-4 py-1.5 text-sm text-white hover:bg-sakura disabled:opacity-60"
          :disabled="!auth.isConfigured || profileBusy"
          @click="pushProfileToGithub"
        >
          ↑ {{ t('admin.push') }}
        </button>
        <button
          class="ml-auto rounded-full border border-ash/40 px-4 py-1.5 text-sm text-ink/70 hover:bg-white"
          @click="resetProfileLocal"
        >
          {{ t('admin.resetLocal') }}
        </button>
      </div>
      <p v-if="profileLocalOverride" class="mt-3 text-xs text-rose">
        ✎ {{ t('admin.localOverrideNotice') }}
      </p>
      <p v-if="profileStatus" class="mt-2 text-sm text-ink/80">{{ profileStatus }}</p>
    </section>

    <section class="mb-6 rounded-3xl bg-white/80 p-5 shadow-soft">
      <h2 class="mb-3 font-display text-lg text-ink">
        {{ editingId ? t('admin.editSong') : t('admin.addSong') }}
      </h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.title') }} *</span>
          <input v-model="draft.title" class="rounded-xl border border-blush bg-milk px-3 py-2" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.artist') }} *</span>
          <input v-model="draft.artist" class="rounded-xl border border-blush bg-milk px-3 py-2" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.language') }}</span>
          <select v-model="draft.language" class="rounded-xl border border-blush bg-milk px-3 py-2">
            <option v-for="l in LANGUAGE_ORDER" :key="l" :value="l">{{ t('language.' + l) }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.addedAt') }}</span>
          <input v-model="draft.addedAt" type="date" class="rounded-xl border border-blush bg-milk px-3 py-2" />
        </label>
        <label class="flex flex-col gap-1 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.tags') }}</span>
          <input v-model="tagsInput" :placeholder="t('admin.field.tagsPh')" class="rounded-xl border border-blush bg-milk px-3 py-2" />
        </label>
        <div class="flex flex-col gap-2 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.conditions') }}</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in CONDITION_KEYS"
              :key="c"
              type="button"
              class="rounded-full px-3 py-1 text-xs transition"
              :class="conditionCheckState.has(c) ? 'bg-rose text-white' : 'bg-cotton text-ink hover:bg-blush'"
              @click="toggleCondition(c)"
            >
              {{ t('condition.' + c) }}
            </button>
          </div>
        </div>
        <label class="flex flex-col gap-1 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.remark') }}</span>
          <textarea v-model="draft.remark" rows="3" class="rounded-xl border border-blush bg-milk px-3 py-2"></textarea>
        </label>
      </div>
      <div class="mt-4 flex gap-2">
        <button class="rounded-full bg-sakura px-5 py-2 text-sm text-white hover:bg-rose" @click="commitDraft">
          {{ editingId ? t('admin.update') : t('admin.add') }}
        </button>
        <button v-if="editingId" class="rounded-full border border-ash/50 px-5 py-2 text-sm text-ink/70 hover:bg-white" @click="cancelEdit">
          {{ t('admin.cancel') }}
        </button>
      </div>
    </section>

    <section class="rounded-3xl bg-white/80 p-5 shadow-soft">
      <h2 class="mb-3 font-display text-lg text-ink">{{ t('admin.list') }} ({{ songs.length }})</h2>
      <div class="scrollbar-soft max-h-[520px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-white/90">
            <tr class="text-left text-ink/60">
              <th class="px-2 py-2">{{ t('admin.field.title') }}</th>
              <th class="px-2 py-2">{{ t('admin.field.artist') }}</th>
              <th class="px-2 py-2">{{ t('admin.field.language') }}</th>
              <th class="px-2 py-2">{{ t('admin.field.tags') }}</th>
              <th class="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in songs" :key="s.id" class="border-t border-blush/40">
              <td class="px-2 py-2 font-display">{{ s.title }}</td>
              <td class="px-2 py-2 text-ink/80">{{ s.artist }}</td>
              <td class="px-2 py-2 text-xs">{{ t('language.' + s.language) }}</td>
              <td class="px-2 py-2 text-xs text-ink/70">{{ s.tags.join(', ') }}</td>
              <td class="px-2 py-2 text-right">
                <button class="rounded-full bg-blush px-2 py-0.5 text-xs hover:bg-sakura hover:text-white" @click="edit(s)">✎</button>
                <button class="ml-1 rounded-full border border-rose/60 px-2 py-0.5 text-xs text-rose hover:bg-rose hover:text-white" @click="remove(s)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
  </PasswordGate>
</template>
