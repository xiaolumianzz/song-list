<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Song } from '@/types/song'

defineProps<{ song: Song | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const { t } = useI18n()

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
          <h2 class="font-display text-2xl text-ink">{{ song.title }}</h2>
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
