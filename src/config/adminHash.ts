// 管理画面の合言葉（SHA-256 ハッシュ）
//
// 変更方法:
//   1. ブラウザのコンソール（F12 → Console）で以下を実行:
//        (async () => {
//          const p = '新しい合言葉'
//          const buf = new TextEncoder().encode(p)
//          const h = await crypto.subtle.digest('SHA-256', buf)
//          console.log([...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join(''))
//        })()
//   2. 出力された 64 文字のハッシュ値を下の ADMIN_HASH に貼り付けて commit & push
//
export const ADMIN_HASH =
  'a8c846c6c2db2a4a7582e2ea17a2c6597ae9f0c60deacb807f0472511a1bb5df'
