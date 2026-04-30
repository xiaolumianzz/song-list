<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSongsStore } from '@/stores/songs'
import { tagDisplay } from '@/composables/useTagDict'
import TagSongsModal from './TagSongsModal.vue'

const emit = defineEmits<{
  (e: 'edit-song', songId: string): void
}>()

const { t, locale } = useI18n()
const songsStore = useSongsStore()

// 編集対象タグ（null = 新規追加モード）
const editingKey = ref<string | null>(null)
const draftJa = ref('')
const draftEn = ref('')
const draftZh = ref('')
const status = ref('')
// タグ別曲一覧モーダル
const songsModalKey = ref<string | null>(null)

const tagRows = computed(() => {
  const dict = songsStore.tagDict
  // 使用曲数マップ
  const counts = new Map<string, number>()
  for (const s of songsStore.songs) for (const t of s.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  // 辞書登録キー + 曲側にあるが辞書未登録のキーを統合
  const keys = new Set<string>([...Object.keys(dict), ...counts.keys()])
  return Array.from(keys)
    .sort((a, b) => a.localeCompare(b, 'ja'))
    .map((key) => {
      const entry = dict[key]
      return {
        key,
        ja: entry?.ja ?? key,
        en: entry?.en ?? '',
        zh: entry?.zh ?? '',
        count: counts.get(key) ?? 0,
      }
    })
})

function startEdit(key: string) {
  const entry = songsStore.tagDict[key]
  editingKey.value = key
  draftJa.value = entry?.ja ?? key
  draftEn.value = entry?.en ?? ''
  draftZh.value = entry?.zh ?? ''
  status.value = ''
}

function cancelEdit() {
  editingKey.value = null
  draftJa.value = ''
  draftEn.value = ''
  draftZh.value = ''
  status.value = ''
}

function save() {
  const ja = draftJa.value.trim()
  if (!ja) {
    status.value = '⚠ ' + t('admin.tagEditor.jaRequired')
    return
  }
  const newEntry = { ja, en: draftEn.value.trim(), zh: draftZh.value.trim() }

  if (editingKey.value === null) {
    // 新規追加
    if (songsStore.tagDict[ja]) {
      // 既存キーと衝突 → 翻訳上書きで救済
      songsStore.upsertTag(newEntry)
      status.value = t('admin.tagEditor.savedExisting')
    } else {
      songsStore.upsertTag(newEntry)
      status.value = t('admin.tagEditor.savedNew')
    }
  } else if (editingKey.value === ja) {
    // 翻訳のみ更新
    songsStore.upsertTag(newEntry)
    status.value = t('admin.tagEditor.savedTranslations')
  } else {
    // rename：別キーへ移行（カスケード rename）
    if (songsStore.tagDict[ja]) {
      // 別の既存キーに合流させる場合は確認
      if (!confirm(t('admin.tagEditor.confirmMerge', { from: editingKey.value, to: ja }))) return
    } else {
      if (!confirm(t('admin.tagEditor.confirmRename', { from: editingKey.value, to: ja }))) return
    }
    songsStore.renameTag(editingKey.value, newEntry)
    status.value = t('admin.tagEditor.savedRename')
  }
  songsStore.saveLocal()
  cancelEdit()
}

function removeTag(key: string) {
  if (!confirm(t('admin.tagEditor.confirmDelete', { tag: key }))) return
  songsStore.removeTag(key)
  songsStore.saveLocal()
  status.value = t('admin.tagEditor.removed', { tag: key })
  if (editingKey.value === key) cancelEdit()
}

function showSongsForTag(key: string) {
  songsModalKey.value = key
}

function onSongModalEditClick(songId: string) {
  songsModalKey.value = null
  emit('edit-song', songId)
}
</script>

<template>
  <section class="mb-6 rounded-3xl bg-white/80 p-5 shadow-soft">
    <h2 class="mb-3 font-display text-lg text-ink">🏷️ {{ t('admin.tagEditor.title') }}</h2>
    <p class="mb-4 text-xs text-ink/70">{{ t('admin.tagEditor.help') }}</p>

    <!-- 上段：3 入力欄 + 保存 / キャンセル -->
    <div class="grid gap-3 sm:grid-cols-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-ink/70">{{ t('admin.tagEditor.fieldJa') }} *</span>
        <input
          v-model="draftJa"
          class="rounded-xl border border-blush bg-milk px-3 py-2"
          :placeholder="t('admin.tagEditor.fieldJaPh')"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-ink/70">{{ t('admin.tagEditor.fieldEn') }}</span>
        <input
          v-model="draftEn"
          class="rounded-xl border border-blush bg-milk px-3 py-2"
          :placeholder="t('admin.tagEditor.fieldEnPh')"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-ink/70">{{ t('admin.tagEditor.fieldZh') }}</span>
        <input
          v-model="draftZh"
          class="rounded-xl border border-blush bg-milk px-3 py-2"
          :placeholder="t('admin.tagEditor.fieldZhPh')"
        />
      </label>
    </div>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        class="rounded-full bg-sakura px-4 py-1.5 text-sm text-white hover:bg-rose"
        @click="save"
      >
        {{ editingKey === null ? t('admin.tagEditor.add') : t('admin.tagEditor.save') }}
      </button>
      <button
        v-if="editingKey !== null"
        class="rounded-full border border-ash/50 px-4 py-1.5 text-sm text-ink/70 hover:bg-white"
        @click="cancelEdit"
      >
        {{ t('admin.tagEditor.cancel') }}
      </button>
      <p v-if="status" class="self-center text-xs text-ink/70">{{ status }}</p>
    </div>

    <!-- 下段：登録済みタグ一覧 -->
    <div class="mt-5">
      <h3 class="mb-2 font-display text-sm text-ink/80">{{ t('admin.tagEditor.list') }}</h3>
      <div class="scrollbar-soft max-h-[420px] overflow-y-auto rounded-2xl border border-blush/40 bg-white/60">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-white/95 text-left text-ink/60">
            <tr>
              <th class="px-3 py-2">{{ t('admin.tagEditor.fieldJa') }}</th>
              <th class="px-3 py-2">{{ t('admin.tagEditor.fieldEn') }}</th>
              <th class="px-3 py-2">{{ t('admin.tagEditor.fieldZh') }}</th>
              <th class="px-3 py-2">{{ t('admin.tagEditor.count') }}</th>
              <th class="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!tagRows.length">
              <td colspan="5" class="px-3 py-6 text-center text-ink/50">—</td>
            </tr>
            <tr
              v-for="row in tagRows"
              :key="row.key"
              class="border-t border-blush/30 transition hover:bg-cotton/40"
              :class="editingKey === row.key ? 'bg-blush/40' : ''"
            >
              <td class="px-3 py-2 font-display">{{ row.ja }}</td>
              <td class="px-3 py-2 text-ink/70">{{ row.en || '—' }}</td>
              <td class="px-3 py-2 text-ink/70">{{ row.zh || '—' }}</td>
              <td class="px-3 py-2">
                <button
                  v-if="row.count > 0"
                  type="button"
                  class="rounded-full bg-cotton px-2 py-0.5 text-xs text-ink hover:bg-blush"
                  :title="t('admin.tagEditor.viewSongs')"
                  @click="showSongsForTag(row.key)"
                >
                  {{ t('admin.tagEditor.usedIn', { n: row.count }) }}
                </button>
                <span v-else class="text-xs text-ink/40">—</span>
              </td>
              <td class="px-3 py-2 text-right">
                <button
                  type="button"
                  class="rounded-full bg-blush px-2 py-0.5 text-xs hover:bg-sakura hover:text-white"
                  :title="t('admin.tagEditor.edit')"
                  @click="startEdit(row.key)"
                >
                  ✎
                </button>
                <button
                  type="button"
                  class="ml-1 rounded-full border border-rose/60 px-2 py-0.5 text-xs text-rose hover:bg-rose hover:text-white"
                  :title="t('admin.tagEditor.delete')"
                  @click="removeTag(row.key)"
                >
                  🗑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-[11px] text-ink/50">
        {{ t('admin.tagEditor.localeHint') }}
        — {{ t('language.' + locale) }}: <span class="font-display">#{{ tagDisplay('example', locale, songsStore.tagDict) }}</span>
      </p>
    </div>

    <TagSongsModal
      :tag-key="songsModalKey"
      @close="songsModalKey = null"
      @edit-song="onSongModalEditClick"
    />
  </section>
</template>
