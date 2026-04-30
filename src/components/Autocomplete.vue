<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

export interface Suggestion {
  /** 内部値（Song.tags や Song.artist として保存される文字列）。 */
  value: string
  /** ドロップダウン表示用ラベル（省略時は value）。 */
  display?: string
  /** バッジに出す件数（省略可）。 */
  count?: number
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    suggestions: Suggestion[]
    placeholder?: string
    /** 区切り文字付きの複数値モード（カンマ・全角カンマ・全角読点を区切りに使用）。 */
    multi?: boolean
    inputClass?: string
  }>(),
  { multi: false, inputClass: '' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const open = ref(false)
const activeIdx = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)

// 区切り文字: , 、 ／全角／半角
const SEP_RE = /[,、、]/

function tailToken(value: string): string {
  if (!props.multi) return value
  const m = value.match(new RegExp(`[^${'、、,'}]*$`))
  return m ? m[0] : value
}

function replaceTailToken(current: string, replacement: string): string {
  if (!props.multi) return replacement
  const idx = Math.max(
    current.lastIndexOf(','),
    current.lastIndexOf('、'),
    current.lastIndexOf('、'),
  )
  const head = idx < 0 ? '' : current.slice(0, idx + 1)
  const sep = head && !head.endsWith(' ') ? ' ' : ''
  return head + sep + replacement + ', '
}

const matched = computed<Suggestion[]>(() => {
  const tail = tailToken(props.modelValue).trim().toLowerCase()
  if (!tail) return props.suggestions.slice(0, 8)
  return props.suggestions
    .filter((s) => {
      const v = s.value.toLowerCase()
      const d = (s.display ?? s.value).toLowerCase()
      return v.includes(tail) || d.includes(tail)
    })
    .slice(0, 8)
})

watch(matched, () => {
  activeIdx.value = -1
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  open.value = true
}
function onFocus() {
  open.value = true
}
function onBlur() {
  // クリック確定の mousedown が走るまで少し待つ
  setTimeout(() => {
    open.value = false
  }, 150)
}

function onKey(e: KeyboardEvent) {
  if (!open.value) {
    if (e.key === 'ArrowDown') {
      open.value = true
      e.preventDefault()
    }
    return
  }
  const len = matched.value.length
  if (e.key === 'ArrowDown') {
    activeIdx.value = len ? (activeIdx.value + 1) % len : -1
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    activeIdx.value = len ? (activeIdx.value - 1 + len) % len : -1
    e.preventDefault()
  } else if (e.key === 'Enter') {
    if (activeIdx.value >= 0 && matched.value[activeIdx.value]) {
      pick(matched.value[activeIdx.value])
      e.preventDefault()
    }
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function pick(s: Suggestion) {
  const next = replaceTailToken(props.modelValue, s.value)
  emit('update:modelValue', next)
  open.value = props.multi // 複数モードのときは次の入力のため開きっぱなし
  activeIdx.value = -1
  nextTick(() => inputEl.value?.focus())
}

// 区切り検出時にドロップダウンの末尾候補をリセットしたい（参考実装：何もしない）
void SEP_RE
</script>

<template>
  <div class="relative">
    <input
      ref="inputEl"
      :value="modelValue"
      :placeholder="placeholder"
      :class="['w-full rounded-xl border border-blush bg-milk px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sakura', inputClass]"
      autocomplete="off"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKey"
    />
    <ul
      v-if="open && matched.length"
      class="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-blush bg-white py-1 text-sm shadow-pop"
    >
      <li
        v-for="(s, i) in matched"
        :key="s.value"
        :class="[
          'flex cursor-pointer items-center justify-between gap-3 px-3 py-1.5 hover:bg-blush',
          i === activeIdx ? 'bg-blush' : '',
        ]"
        @mousedown.prevent="pick(s)"
      >
        <span class="truncate">{{ s.display ?? s.value }}</span>
        <span v-if="s.count != null" class="shrink-0 text-[10px] text-ink/50">{{ s.count }}</span>
      </li>
    </ul>
  </div>
</template>
