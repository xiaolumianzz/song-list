<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSongsStore } from '@/stores/songs'
import { tagDisplay } from '@/composables/useTagDict'

const props = defineProps<{
  /** 表示対象のタグキー（日本語）。null/空のときはモーダル非表示。 */
  tagKey: string | null
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit-song', songId: string): void
}>()

const { t, locale } = useI18n()
const songsStore = useSongsStore()

const songs = computed(() => {
  if (!props.tagKey) return []
  return songsStore.songs.filter((s) => s.tags.includes(props.tagKey!))
})

const displayTag = computed(() =>
  props.tagKey ? tagDisplay(props.tagKey, locale.value, songsStore.tagDict) : '',
)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="tagKey"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 py-6 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div class="relative max-h-full w-full max-w-lg animate-popin overflow-y-auto rounded-3xl bg-milk p-6 shadow-pop">
          <button
            class="absolute right-3 top-3 rounded-full bg-blush px-2.5 py-1 text-sm text-ink hover:bg-sakura hover:text-white"
            @click="emit('close')"
            aria-label="close"
          >
            ✕
          </button>
          <h2 class="mb-1 font-display text-xl text-ink">
            #{{ displayTag }}
          </h2>
          <p class="mb-4 text-xs text-ink/60">
            {{ t('admin.tagEditor.usedIn', { n: songs.length }) }}
          </p>
          <ul v-if="songs.length" class="divide-y divide-blush/50 text-sm">
            <li v-for="s in songs" :key="s.id" class="flex items-center justify-between gap-2 py-2">
              <div class="min-w-0">
                <p class="truncate font-display text-ink">{{ s.title }}</p>
                <p class="truncate text-xs text-ink/60">{{ s.artist }}</p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-full bg-blush px-2 py-1 text-xs hover:bg-sakura hover:text-white"
                @click="emit('edit-song', s.id)"
              >
                ✎
              </button>
            </li>
          </ul>
          <p v-else class="text-sm text-ink/60">—</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
