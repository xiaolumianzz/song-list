import { ref, watch } from 'vue'

export type ViewMode = 'grid' | 'list'
const LS_KEY = 'song-list:view-mode'

function load(): ViewMode {
  const v = localStorage.getItem(LS_KEY)
  // デフォルトは行表示。明示的に 'grid' が保存されている場合だけ grid。
  return v === 'grid' ? 'grid' : 'list'
}

export function useViewMode() {
  const mode = ref<ViewMode>(load())
  watch(mode, (v) => localStorage.setItem(LS_KEY, v))
  return mode
}
