# Song List ♡

ふんわりパステルな「歌える曲リスト」サイト。Vue 3 + Vite + Tailwind CSS + TypeScript で作られた静的サイトです。

---

## ✨ 機能

- 曲一覧（カード / 行表示の切替可）
- 検索・タグ・言語で絞り込み
- ランダム選曲
- プロフィールカード（アイコン + SNS リンク、未入力は非表示）
- ガラスモーフィズム風の UI
- 可愛い部屋の背景（画像差し替え可）
- 立ち絵キャラクター（差し替え可・CSS でゆらゆら揺れる）
- UI 多言語（日本語 / 英語 / 中国語）

---

## 🚀 ローカルで動かす

```bash
npm install
npm run dev
# → http://localhost:5173 を開く
```

本番ビルドの確認:

```bash
npm run build
npm run preview
```

---

## 🎨 見た目のカスタマイズ

### 背景画像を差し替える
`public/background.png` を配置すると全面背景になります。ない場合は同梱の SVG による部屋シーンにフォールバック。

### 立ち絵を差し替える
`public/character.png` に透過 PNG（縦長 2:3、全身）を置くと、シーンの上に合成され CSS で左右に揺れます。

### カラーパレット
`tailwind.config.js` の `colors` セクションで調整可:
`milk / cotton / blush / sakura / rose / ash / ink / sparkle`

---

## 📝 データの手動編集

直接 JSON を編集しても OK:
- `public/songs.json` — 曲リスト
- `public/profile.json` — プロフィール情報

編集後に `git push` すれば本番に反映されます。

---

## 🗂 ディレクトリ構成

```
public/
  songs.json           # 曲データ
  profile.json         # プロフィール
  character.png        # 立ち絵（任意）
  background.png       # 背景（任意）
  decorations/         # 装飾 SVG
src/
  components/          # UI パーツ
  views/               # 画面
  stores/              # Pinia
  composables/         # 共通ロジック
  i18n/                # 翻訳
  types/               # 型定義
.github/workflows/     # CI/CD
```

---

## 🛠 スタック

- Vue 3 (Composition API) + TypeScript
- Vite
- Tailwind CSS
- Pinia
- Vue Router (hash mode)
- vue-i18n

---

Made by Riru's little brother
