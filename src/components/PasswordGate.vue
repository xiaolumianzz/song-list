<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ADMIN_HASH } from '@/config/adminHash'

const { t } = useI18n()

const SESSION_KEY = 'song-list:admin-unlocked'

const unlocked = ref(false)
const input = ref('')
const error = ref(false)
const busy = ref(false)

onMounted(() => {
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    unlocked.value = true
  }
})

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = false
  try {
    const h = await sha256Hex(input.value)
    if (h === ADMIN_HASH) {
      sessionStorage.setItem(SESSION_KEY, '1')
      unlocked.value = true
    } else {
      error.value = true
      input.value = ''
    }
  } finally {
    busy.value = false
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY)
  unlocked.value = false
  input.value = ''
}

defineExpose({ logout })
</script>

<template>
  <slot v-if="unlocked" :logout="logout" />

  <div
    v-else
    class="mx-auto flex min-h-screen max-w-md items-center justify-center px-4"
  >
    <form
      class="w-full rounded-3xl border border-white/70 bg-gradient-to-br from-white/35 via-white/12 to-white/5 p-8 shadow-glass backdrop-blur-[2px]"
      @submit.prevent="submit"
    >
      <h1 class="mb-2 text-center font-display text-2xl font-bold text-ink">
        🔒 {{ t('gate.title') }}
      </h1>
      <p class="mb-6 text-center text-xs text-ink/70">
        {{ t('gate.subtitle') }}
      </p>
      <input
        v-model="input"
        type="password"
        autocomplete="current-password"
        autofocus
        :placeholder="t('gate.placeholder')"
        class="w-full rounded-full border border-white/80 bg-gradient-to-b from-white/60 to-white/20 px-5 py-3 text-center font-display text-base text-ink shadow-glass-chip backdrop-blur-[2px] placeholder:text-ash/60 focus:border-sakura focus:outline-none focus:ring-4 focus:ring-sakura/30"
      />
      <p
        v-if="error"
        class="mt-3 text-center text-xs text-rose"
      >
        ✕ {{ t('gate.wrong') }}
      </p>
      <button
        type="submit"
        class="mt-5 w-full rounded-full bg-gradient-to-r from-sakura to-rose px-5 py-3 font-display text-white shadow-pop transition hover:scale-[1.02] disabled:opacity-60"
        :disabled="!input || busy"
      >
        {{ busy ? '...' : t('gate.unlock') }}
      </button>
      <p class="mt-6 text-center text-[10px] text-ink/50">
        {{ t('gate.hint') }}
      </p>
    </form>
  </div>
</template>
