import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * 瞬き・口パクのタイマー制御。
 * 差分画像を使わず、単一レイヤーに scaleY を当てて表現する軽量実装。
 */
export function useCharacterAnim() {
  const eyesScaleY = ref(1)
  const mouthScaleY = ref(1)
  let blinkTimer: number | null = null
  let mouthRaf: number | null = null

  function scheduleBlink() {
    const wait = 3000 + Math.random() * 2500
    blinkTimer = window.setTimeout(() => {
      eyesScaleY.value = 0.08
      window.setTimeout(() => {
        eyesScaleY.value = 1
        // ダブル瞬きをたまに
        if (Math.random() < 0.25) {
          window.setTimeout(() => {
            eyesScaleY.value = 0.08
            window.setTimeout(() => {
              eyesScaleY.value = 1
              scheduleBlink()
            }, 110)
          }, 140)
        } else {
          scheduleBlink()
        }
      }, 120)
    }, wait)
  }

  function mouthLoop() {
    const t = performance.now() / 1000
    // 0.85〜1.0 の間でゆっくり動く微小呼吸＋細かい震え
    mouthScaleY.value = 0.92 + Math.sin(t * 2.2) * 0.05 + Math.sin(t * 7) * 0.02
    mouthRaf = requestAnimationFrame(mouthLoop)
  }

  onMounted(() => {
    scheduleBlink()
    mouthLoop()
  })

  onBeforeUnmount(() => {
    if (blinkTimer !== null) clearTimeout(blinkTimer)
    if (mouthRaf !== null) cancelAnimationFrame(mouthRaf)
  })

  return { eyesScaleY, mouthScaleY }
}
