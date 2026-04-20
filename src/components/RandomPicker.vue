<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Song } from '@/types/song'

const props = defineProps<{ pool: Song[] }>()
const emit = defineEmits<{ (e: 'picked', song: Song): void }>()

const { t } = useI18n()
const spinning = ref(false)

function pick() {
  if (!props.pool.length || spinning.value) return
  spinning.value = true
  setTimeout(() => {
    const song = props.pool[Math.floor(Math.random() * props.pool.length)]
    spinning.value = false
    emit('picked', song)
  }, 700)
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sakura to-rose px-5 py-2.5 font-display text-white shadow-pop transition hover:scale-105 disabled:opacity-60"
    :disabled="!pool.length"
    @click="pick"
  >
    <span class="inline-block" :class="spinning ? 'animate-spin' : 'animate-floaty'" aria-hidden="true">🎲</span>
    <span>{{ spinning ? t('random.spinning') : t('random.pick') }}</span>
  </button>
</template>
