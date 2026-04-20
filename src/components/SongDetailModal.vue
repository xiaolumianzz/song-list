<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Song } from '@/types/song'

defineProps<{ song: Song | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const { t } = useI18n()

const copied = ref(false)
let copyTimer: number | null = null

async function copyTitle(title: string) {
  try {
    await navigator.clipboard.writeText(title)
    copied.value = true
    if (copyTimer !== null) clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // クリップボード API が使えない環境（古いブラウザ等）はフォールバック
    const ta = document.createElement('textarea')
    ta.value = title
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    if (copyTimer !== null) clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => (copied.value = false), 1500)
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (copyTimer !== null) clearTimeout(copyTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="song"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="relative w-full max-w-md animate-popin rounded-3xl bg-milk p-6 shadow-pop"
        >
          <button
            class="absolute right-3 top-3 rounded-full bg-blush px-2.5 py-1 text-sm text-ink hover:bg-sakura hover:text-white"
            @click="emit('close')"
            aria-label="close"
          >
            ✕
          </button>

          <div class="mb-2 flex items-center gap-2">
            <span class="rounded-full bg-sakura px-2 py-0.5 text-[10px] font-bold text-white">
              {{ t('language.' + song.language) }}
            </span>
            <span class="text-[11px] text-ash">{{ song.addedAt }}</span>
          </div>

          <div class="flex items-start gap-2 pr-10">
            <h2 class="font-display text-2xl text-ink">{{ song.title }}</h2>
            <button
              type="button"
              class="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-sakura/60 bg-white px-2 py-1 text-[11px] text-rose shadow-soft transition hover:bg-sakura hover:text-white"
              :aria-label="t('detail.copyTitle')"
              :title="t('detail.copyTitle')"
              @click="copyTitle(song.title)"
            >
              <svg
                v-if="copied"
                viewBox="0 0 24 24"
                class="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                class="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{{ copied ? t('detail.copied') : t('detail.copy') }}</span>
            </button>
          </div>
          <p class="mt-1 text-base text-ink/80">{{ song.artist }}</p>

          <div v-if="song.tags.length" class="mt-4 flex flex-wrap gap-1.5">
            <span
              v-for="t in song.tags"
              :key="t"
              class="rounded-full bg-cotton px-3 py-0.5 text-xs text-ink"
            >
              #{{ t }}
            </span>
          </div>

          <div v-if="song.conditions.length" class="mt-4">
            <p class="font-display text-sm text-ink/70">{{ t('detail.conditions') }}</p>
            <ul class="mt-1 list-disc pl-5 text-sm text-ink">
              <li v-for="c in song.conditions" :key="c">{{ t('condition.' + c) }}</li>
            </ul>
          </div>

          <div v-if="song.remark" class="mt-4 rounded-2xl bg-white/80 p-3">
            <p class="font-display text-sm text-ink/70">{{ t('detail.remark') }}</p>
            <p class="mt-1 whitespace-pre-wrap text-sm text-ink">{{ song.remark }}</p>
          </div>
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
