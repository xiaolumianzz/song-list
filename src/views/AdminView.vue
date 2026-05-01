<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSongsStore } from '@/stores/songs'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { useGithub } from '@/composables/useGithub'
import { CONDITION_KEYS, LANGUAGE_ORDER, type Language, type Song } from '@/types/song'
import { NEW_BADGE_DEFAULT_DAYS, SNS_KEYS, type SnsKey } from '@/types/profile'
import LangSwitcher from '@/components/LangSwitcher.vue'
import PasswordGate from '@/components/PasswordGate.vue'
import ScBadge from '@/components/ScBadge.vue'
import TagEditor from '@/components/TagEditor.vue'
import Autocomplete, { type Suggestion } from '@/components/Autocomplete.vue'
import { tagDisplay } from '@/composables/useTagDict'
import draggable from 'vuedraggable'

const { t, locale } = useI18n()
const songsStore = useSongsStore()

// ─── タブ ───
type AdminTab = 'songs' | 'tags' | 'profile' | 'connection'
const TAB_STORAGE_KEY = 'song-list:admin-tab'
const tab = ref<AdminTab>('songs')
const savedTab = (() => {
  try {
    return localStorage.getItem(TAB_STORAGE_KEY)
  } catch {
    return null
  }
})()
if (savedTab && ['songs', 'tags', 'profile', 'connection'].includes(savedTab)) {
  tab.value = savedTab as AdminTab
}
watch(tab, (v) => {
  try {
    localStorage.setItem(TAB_STORAGE_KEY, v)
  } catch {
    // ignore
  }
})
const tabs: Array<{ key: AdminTab; icon: string }> = [
  { key: 'songs', icon: '🎵' },
  { key: 'tags', icon: '🏷️' },
  { key: 'profile', icon: '👤' },
  { key: 'connection', icon: '🔌' },
]

// アーティストサジェスト：登録済みアーティストを使用曲数の多い順
const artistSuggestions = computed<Suggestion[]>(() =>
  songsStore.artistStats.map((a) => ({ value: a.artist, count: a.count })),
)
// タグサジェスト：辞書のキー（日本語）を value に、現在のロケール表示を display に
const tagSuggestions = computed<Suggestion[]>(() =>
  songsStore.tagStats.map((t) => ({
    value: t.tag,
    display: tagDisplay(t.tag, locale.value, songsStore.tagDict),
    count: t.count,
  })),
)
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
  // コピペ時の前後空白・改行を除去（先頭スペース混入で 404 になる事故防止）
  const cleanedToken = tokenInput.value.trim()
  const cleanedOwner = repoOwner.value.trim()
  const cleanedRepo = repoName.value.trim()
  const cleanedBranch = repoBranch.value.trim()
  const cleanedPath = repoPath.value.trim()
  const cleanedProfilePath = repoProfilePath.value.trim()
  // フォーム表示も整形済みの値に揃える
  tokenInput.value = cleanedToken
  repoOwner.value = cleanedOwner
  repoName.value = cleanedRepo
  repoBranch.value = cleanedBranch
  repoPath.value = cleanedPath
  repoProfilePath.value = cleanedProfilePath

  auth.setToken(cleanedToken)
  auth.setRepo({
    owner: cleanedOwner,
    repo: cleanedRepo,
    branch: cleanedBranch,
    path: cleanedPath,
    profilePath: cleanedProfilePath,
  })
  status.value = t('admin.status.savedLocal')
}

function isHttpError(e: unknown, status: number): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    (e as { status?: unknown }).status === status
  )
}

/**
 * push の直前に GitHub から最新の sha を取り直して返す。
 * - 取得成功 → その sha（既存ファイル更新）
 * - 404 だがリポジトリ自体は見える → undefined（新規ファイル作成扱い）
 * - 404 でリポジトリも見えない → PAT 権限エラーとして throw
 */
async function resolveCurrentSha(
  fetcher: () => Promise<{ sha: string }>,
): Promise<string | undefined> {
  try {
    const { sha: gotSha } = await fetcher()
    return gotSha
  } catch (e) {
    if (!isHttpError(e, 404)) throw e
    try {
      await gh.checkRepoAccess()
    } catch (repoErr) {
      if (isHttpError(repoErr, 404)) {
        throw new Error(t('admin.status.repoNoAccess'))
      }
      throw repoErr
    }
    return undefined
  }
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
    // push 直前に必ず最新 sha を取り直す（キャッシュ・他端末更新による不整合を防ぐ）
    const currentSha = await resolveCurrentSha(() => gh.fetchSongs())
    songsStore.data.meta.updatedAt = new Date().toISOString()
    await gh.pushSongs(songsStore.data, `chore(songs): update via admin ui`, currentSha)
    status.value = t('admin.status.pushed')
    songsStore.clearLocal()
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
    sc: 0,
    titleReading: '',
    artistReading: '',
    videos: [],
    chordUrl: '',
  }
}

function addVideoRow() {
  if (!draft.value.videos) draft.value.videos = []
  draft.value.videos.push({ url: '', label: '', _id: crypto.randomUUID() })
}

function removeVideoRow(i: number) {
  if (!draft.value.videos) return
  draft.value.videos.splice(i, 1)
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
  // sc を数値化 + 0 以下や NaN は undefined に正規化（= バッジ非表示）
  const scNum = Number(draft.value.sc)
  draft.value.sc = Number.isFinite(scNum) && scNum > 0 ? scNum : undefined
  // 読み仮名・コードURL は空なら undefined（出力 JSON に空文字を残さない）
  draft.value.titleReading = draft.value.titleReading?.trim() || undefined
  draft.value.artistReading = draft.value.artistReading?.trim() || undefined
  draft.value.chordUrl = draft.value.chordUrl?.trim() || undefined
  // 動画リンクは url 空欄行を除外、全部空なら undefined
  if (draft.value.videos) {
    const cleaned = draft.value.videos
      .map((v) => ({ url: v.url.trim(), label: v.label?.trim() || undefined }))
      .filter((v) => v.url)
    draft.value.videos = cleaned.length ? cleaned : undefined
  }
  // 編集タイムスタンプを更新
  draft.value.updatedAt = new Date().toISOString()
  if (!draft.value.id) draft.value.id = crypto.randomUUID()
  songsStore.upsertSong({ ...draft.value })
  songsStore.saveLocal()
  status.value = t('admin.status.savedLocal')
  draft.value = emptySong()
  tagsInput.value = ''
  editingId.value = null
}

function edit(song: Song) {
  draft.value = {
    ...song,
    tags: [...song.tags],
    conditions: [...song.conditions],
    titleReading: song.titleReading ?? '',
    artistReading: song.artistReading ?? '',
    chordUrl: song.chordUrl ?? '',
    // 編集時に各動画行に並び替え用の一時 ID を割り当てる
    videos: song.videos
      ? song.videos.map((v) => ({ ...v, _id: crypto.randomUUID() }))
      : [],
  }
  tagsInput.value = song.tags.join(', ')
  editingId.value = song.id
}

function editById(id: string) {
  const target = songsStore.songs.find((s) => s.id === id)
  if (target) {
    edit(target)
    // 編集セクションへスクロールしたいところだが、scrollIntoView は要素への参照が必要。
    // 一旦簡単に top に戻す（タグエディタのモーダルを閉じた直後のフォーカス改善は将来）。
  }
}

function onSongReorder() {
  // vuedraggable は v-model で配列を直接 mutate するので、ここでは saveLocal を呼ぶだけ
  songsStore.saveLocal()
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

// プロフィールの「下書き保存」ボタンは廃止（公開ボタンだけで運用）。
// 必要なら profileStore.saveLocal() を直接呼べる。

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
    const currentSha = await resolveCurrentSha(() => gh.fetchProfile())
    profile.value.meta.updatedAt = new Date().toISOString()
    await gh.pushProfile(profile.value, 'chore(profile): update via admin ui', currentSha)

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

    <!-- タブナビゲーション -->
    <nav class="mb-6 flex flex-wrap gap-1.5">
      <button
        v-for="tabDef in tabs"
        :key="tabDef.key"
        type="button"
        class="rounded-full px-4 py-1.5 text-sm font-medium transition"
        :class="tab === tabDef.key
          ? 'bg-sakura text-white shadow-pop'
          : 'border border-white/80 bg-white/60 text-ink/75 hover:bg-blush/40'"
        @click="tab = tabDef.key"
      >
        {{ tabDef.icon }} {{ t('admin.tabs.' + tabDef.key) }}
      </button>
    </nav>

    <!-- 「曲」「タグ」タブ共通：songs.json データの公開アクションバー -->
    <section
      v-show="tab === 'songs' || tab === 'tags'"
      class="mb-6 rounded-3xl bg-white/80 p-5 shadow-soft"
    >
      <div class="mb-3 flex flex-wrap items-baseline gap-2">
        <h2 class="font-display text-lg text-ink">{{ t('admin.songsActionsTitle') }}</h2>
        <div
          v-if="useLocalOverride"
          class="inline-flex items-center gap-1.5 rounded-full bg-blush/40 px-3 py-1 text-xs font-medium text-rose"
        >
          <span aria-hidden="true">⚠</span>
          <span>{{ t('admin.localOverrideNotice') }}</span>
        </div>
      </div>
      <p class="mb-3 text-xs text-ink/70">{{ t('admin.songsActionsHelp') }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <button
          class="rounded-full border border-sakura bg-white/70 px-4 py-1.5 text-sm text-rose hover:bg-blush disabled:opacity-60"
          :disabled="!auth.isConfigured || busy"
          :title="t('admin.fetchHint')"
          @click="fetchFromGithub"
        >
          🔄 {{ t('admin.fetch') }}
        </button>
        <button
          class="rounded-full bg-gradient-to-r from-rose to-sakura px-5 py-2 text-sm font-bold text-white shadow-pop transition hover:from-sakura hover:to-rose disabled:opacity-60"
          :disabled="!auth.isConfigured || busy"
          :title="t('admin.pushHint')"
          @click="pushToGithub"
        >
          ✦ {{ t('admin.push') }}
        </button>
        <div class="ml-auto flex items-center gap-1.5">
          <button
            class="rounded-full border border-ash/40 bg-white/60 px-3 py-1 text-xs text-ink/65 hover:bg-white hover:text-ink"
            :title="t('admin.exportHint')"
            @click="exportJson"
          >
            📥 {{ t('admin.export') }}
          </button>
          <button
            class="rounded-full border border-ash/40 bg-white/60 px-3 py-1 text-xs text-ink/55 hover:border-rose/40 hover:text-rose"
            :title="t('admin.resetLocalHint')"
            @click="resetLocal"
          >
            🗑 {{ t('admin.resetLocal') }}
          </button>
        </div>
      </div>
      <p v-if="status" class="mt-2 text-sm text-ink/80">{{ status }}</p>
    </section>

    <!-- ─── 接続設定タブ ─── -->
    <section
      v-show="tab === 'connection'"
      class="mb-6 rounded-3xl bg-white/80 p-5 shadow-soft"
    >
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
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button
          class="rounded-full bg-sakura px-4 py-1.5 text-sm text-white shadow-soft hover:bg-rose"
          :title="t('admin.saveSettingsHint')"
          @click="saveCreds"
        >
          💾 {{ t('admin.saveSettings') }}
        </button>
        <span class="text-[11px] text-ink/55">{{ t('admin.saveSettingsHint') }}</span>
      </div>
      <p v-if="status && tab === 'connection'" class="mt-2 text-sm text-ink/80">{{ status }}</p>
    </section>

    <!-- ─── プロフィールタブ ─── -->
    <section
      v-show="tab === 'profile'"
      class="mb-6 rounded-3xl bg-white/80 p-5 shadow-soft"
    >
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
          <label class="flex flex-col gap-1 text-sm sm:col-span-2">
            <span class="text-ink/70">{{ t('admin.profile.newBadgeDays') }}</span>
            <input
              v-model.number="profile.newBadgeDays"
              type="number"
              min="1"
              max="365"
              class="rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura"
              :placeholder="String(NEW_BADGE_DEFAULT_DAYS)"
            />
            <span class="text-[10px] text-ink/50">{{ t('admin.profile.newBadgeDaysHelp') }}</span>
          </label>
        </div>
      </div>

      <p class="mt-4 text-xs text-ink/65">{{ t('admin.profileActionsHelp') }}</p>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <!-- サイトから読み込む -->
        <button
          class="rounded-full border border-sakura bg-white/70 px-4 py-1.5 text-sm text-rose hover:bg-blush disabled:opacity-60"
          :disabled="!auth.isConfigured || profileBusy"
          :title="t('admin.fetchHint')"
          @click="fetchProfileFromGithub"
        >
          🔄 {{ t('admin.fetch') }}
        </button>

        <!-- サイトに公開（最重要） -->
        <button
          class="rounded-full bg-gradient-to-r from-rose to-sakura px-5 py-2 text-sm font-bold text-white shadow-pop transition hover:from-sakura hover:to-rose disabled:opacity-60"
          :disabled="!auth.isConfigured || profileBusy"
          :title="t('admin.pushHint')"
          @click="pushProfileToGithub"
        >
          ✦ {{ t('admin.push') }}
        </button>

        <!-- 控えめなリセット（右寄せ） -->
        <button
          class="ml-auto rounded-full border border-ash/40 bg-white/60 px-3 py-1 text-xs text-ink/55 hover:border-rose/40 hover:text-rose"
          :title="t('admin.resetLocalHint')"
          @click="resetProfileLocal"
        >
          🗑 {{ t('admin.resetLocal') }}
        </button>
      </div>
      <div
        v-if="profileLocalOverride"
        class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blush/40 px-3 py-1 text-xs font-medium text-rose"
      >
        <span aria-hidden="true">⚠</span>
        <span>{{ t('admin.localOverrideNotice') }}</span>
      </div>
      <p v-if="profileStatus" class="mt-2 text-sm text-ink/80">{{ profileStatus }}</p>
    </section>

    <!-- ─── タグタブ ─── -->
    <div v-show="tab === 'tags'">
      <TagEditor @edit-song="editById" />
    </div>

    <!-- ─── 曲タブ：フォーム + リスト ─── -->
    <div v-show="tab === 'songs'">
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
          <Autocomplete
            v-model="draft.artist"
            :suggestions="artistSuggestions"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.titleReading') }}</span>
          <input
            v-model="draft.titleReading"
            class="rounded-xl border border-blush bg-milk px-3 py-2"
            :placeholder="t('admin.field.readingPh')"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink/70">{{ t('admin.field.artistReading') }}</span>
          <input
            v-model="draft.artistReading"
            class="rounded-xl border border-blush bg-milk px-3 py-2"
            :placeholder="t('admin.field.readingPh')"
          />
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
          <span class="text-ink/70">{{ t('admin.field.sc') }}</span>
          <input
            v-model.number="draft.sc"
            type="number"
            min="0"
            step="10"
            class="rounded-xl border border-blush bg-milk px-3 py-2"
            :placeholder="t('admin.field.scPh')"
          />
          <span class="text-[10px] text-ink/50">{{ t('admin.field.scHelp') }}</span>
        </label>
        <label class="flex flex-col gap-1 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.tags') }}</span>
          <Autocomplete
            v-model="tagsInput"
            multi
            :suggestions="tagSuggestions"
            :placeholder="t('admin.field.tagsPh')"
          />
          <span class="text-[10px] text-ink/50">{{ t('admin.field.tagsHint') }}</span>
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

        <!-- 動画リンク（任意・複数登録可、ドラッグで並び替え） -->
        <div class="flex flex-col gap-2 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.videos') }}</span>
          <draggable
            v-if="draft.videos && draft.videos.length"
            v-model="draft.videos"
            item-key="_id"
            handle=".video-drag-handle"
            ghost-class="opacity-50"
            class="flex flex-col gap-2"
          >
            <template #item="{ element: v, index: i }: { element: import('@/types/song').VideoLink, index: number }">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="video-drag-handle cursor-grab select-none px-1 text-ink/40 hover:text-ink/70"
                  :title="t('admin.dragHint')"
                >⋮⋮</span>
                <input
                  v-model="v.url"
                  class="min-w-0 flex-1 rounded-xl border border-blush bg-milk px-3 py-2 text-sm"
                  :placeholder="t('admin.field.videoUrlPh')"
                />
                <input
                  v-model="v.label"
                  class="w-44 shrink-0 rounded-xl border border-blush bg-milk px-3 py-2 text-sm sm:w-64"
                  :placeholder="t('admin.field.videoLabelPh')"
                />
                <button
                  type="button"
                  class="rounded-full border border-rose/60 px-2 py-1 text-xs text-rose hover:bg-rose hover:text-white"
                  :aria-label="t('admin.field.removeVideo')"
                  @click="removeVideoRow(i)"
                >
                  −
                </button>
              </div>
            </template>
          </draggable>
          <button
            type="button"
            class="self-start rounded-full bg-cotton px-3 py-1 text-xs text-ink hover:bg-blush"
            @click="addVideoRow"
          >
            + {{ t('admin.field.addVideo') }}
          </button>
        </div>

        <!-- ギターコードURL -->
        <label class="flex flex-col gap-1 text-sm sm:col-span-2">
          <span class="text-ink/70">{{ t('admin.field.chordUrl') }}</span>
          <input
            v-model="draft.chordUrl"
            class="rounded-xl border border-blush bg-milk px-3 py-2"
            :placeholder="t('admin.field.chordUrlPh')"
          />
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
      <h2 class="mb-2 font-display text-lg text-ink">{{ t('admin.list') }} ({{ songs.length }})</h2>
      <p class="mb-3 text-[11px] text-ink/60">{{ t('admin.dragHint') }}</p>
      <div class="scrollbar-soft max-h-[520px] overflow-y-auto">
        <!-- ヘッダ行（ドラッグ対象外） -->
        <div class="admin-row-header sticky top-0 z-10 bg-white/95 px-2 py-2 text-left text-xs text-ink/60">
          <span></span>
          <span>{{ t('admin.field.title') }}</span>
          <span>{{ t('admin.field.artist') }}</span>
          <span>{{ t('admin.field.language') }}</span>
          <span>SC</span>
          <span>{{ t('admin.field.tags') }}</span>
          <span></span>
        </div>
        <draggable
          v-model="songsStore.data.songs"
          item-key="id"
          handle=".drag-handle"
          ghost-class="opacity-50"
          @change="onSongReorder"
        >
          <template #item="{ element: s }: { element: Song }">
            <div class="admin-row border-t border-blush/40 px-2 py-2 text-sm hover:bg-blush/20">
              <span
                class="drag-handle cursor-grab select-none text-ink/40 hover:text-ink/70"
                :title="t('admin.dragHint')"
              >⋮⋮</span>
              <span class="truncate font-display">{{ s.title }}</span>
              <span class="truncate text-ink/80">{{ s.artist }}</span>
              <span class="text-xs">{{ t('language.' + s.language) }}</span>
              <span>
                <ScBadge v-if="s.sc && s.sc > 0" :amount="s.sc" size="sm" />
                <span v-else class="text-xs text-ink/30">—</span>
              </span>
              <span class="truncate text-xs text-ink/70">{{ s.tags.join(', ') }}</span>
              <span class="text-right">
                <button class="rounded-full bg-blush px-2 py-0.5 text-xs hover:bg-sakura hover:text-white" @click="edit(s)">✎</button>
                <button class="ml-1 rounded-full border border-rose/60 px-2 py-0.5 text-xs text-rose hover:bg-rose hover:text-white" @click="remove(s)">🗑</button>
              </span>
            </div>
          </template>
        </draggable>
      </div>
    </section>
    </div>
  </main>
  </PasswordGate>
</template>

<style scoped>
/* 曲リスト行：ヘッダ行と body 行で共通の grid 列幅 */
.admin-row,
.admin-row-header {
  display: grid;
  grid-template-columns:
    1.5rem            /* drag handle */
    minmax(0, 2fr)    /* title */
    minmax(0, 1.4fr)  /* artist */
    4rem              /* language */
    5rem              /* SC */
    minmax(0, 2fr)    /* tags */
    5rem;             /* operations */
  column-gap: 0.5rem;
  align-items: center;
}
</style>
