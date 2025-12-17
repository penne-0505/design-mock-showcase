# Backend / App Implementation Plan (jsx/html page preview + component preview)

## 1. 新要件を踏まえた目標と前提
- 目的: UIモック/コンポーネントショーケースを「実際に動くプレビューアプリ」にする。
  - 「ページ設計書」ではなく、1ファイル単位の `jsx`（または `tsx`）/`html` をプレビュー対象とする。
  - 「コンポーネント」も1ファイル単位でプレビュー対象とする。
- 現状: フロントは `/` にショーケースがあり、ファイルツリー/プレビューはモックデータで表示。バックエンド API は未実装。
- 技術前提: React + Vite (SPA)、Express サーバで dev/prod を同一ポートで配信。

## 2. 重要な難所（JSX を“任意ファイル”としてプレビューする難しさ）
結論: “任意のパスにある JSX をサーバが読み込んで実行し、ブラウザで安全にプレビューする”のは難易度が高いです。
主な理由:
- JSX/TSX はそのままではブラウザ実行できず、ビルド（変換）と依存解決が必要。
- 実行は任意コード実行に近く、セキュリティ/サンドボックス/リソース制御が必要（特にマルチユーザーや外部公開環境）。
- production では「ソースファイルが dist に存在しない」ため、dev のやり方をそのまま持ち込めない。

ただし、以下のように要件を“実装可能な制約”に落とし込めれば、現実的に実装できます。

## 3. 採用方針（A + 2）
本計画は以下を採用します。

### 3.1 A: 置き場所の制約（MVP）
- `html` プレビュー
  - `client/public/showcase/pages/**.html` のように **静的配信できる場所**に置く。
  - プレビューは `iframe` で表示。
- `jsx/tsx` プレビュー
  - `client/src/showcase/pages/**.{jsx,tsx}` および `client/src/showcase/components/**.{jsx,tsx}` に置く。
  - 各ファイルは **default export で React コンポーネント**を提供する（例: `export default function Preview(){...}`）。

### 3.2 2: バックエンドでの再帰探索（dev）+ manifest（prod）
- dev: Express が `client/src/showcase/**` と `client/public/showcase/**` を **再帰走査**して tree/一覧を返す。
- prod: 走査は行わず、ビルド時に生成した `showcase-manifest.json`（および任意で tree）を返す。

補足:
- JSX/TSX の描画自体はフロントで行う（サーバは JSX を実行しない）。
- 設定で“任意パス”を指定するのではなく、`client/src/showcase` 配下の **サブディレクトリを選択（フィルタ）**する仕様に寄せる（glob をユーザー入力で変えない）。

### 3.2 代替案（難易度/リスクが上がる）
- Dev 限定での任意 JSX 実行: Vite の SSR API で `loadModule` 的に読み込む（production 互換が難しい）
- サーバでオンデマンド変換（esbuild/babel）+ サンドボックス実行: 実装/保守/セキュリティ対策が重く、MVP には非推奨

## 4. ディレクトリ規約（確定案）
- HTML pages: `client/public/showcase/pages/**.html`
- JSX pages: `client/src/showcase/pages/**.{jsx,tsx}`
- JSX components: `client/src/showcase/components/**.{jsx,tsx}`

備考:
- HTML と JSX を同一ツリーで扱いたい場合は、manifest（後述）で形式を明示する。
- “どのパスをスキャンするか”を設定で変えたい場合、Vite バンドル対象の制約から `client/src` 配下に寄せるのが安全。

## 5. データモデル案（API/manifest で使う）
`ShowcaseEntry`（ページ/コンポーネント共通）
- id: string（安定 ID。path から生成でも可）
- name: string
- kind: "page" | "component"
- format: "html" | "jsx" | "tsx"
- sourcePath: string（リポジトリ内相対パス。例: `client/src/showcase/pages/foo.tsx`）
- publicUrl?: string（HTML の場合。例: `/showcase/pages/foo.html`）
- moduleKey?: string（JSX/TSX の場合。フロントの `import.meta.glob` のキーと一致させる）
- lastModified?: string

`Settings`
- pagesDirHtml?: string（例: `client/public/showcase/pages`）
- pagesDirJsx?: string（例: `client/src/showcase/pages`）
- componentsDir?: string（例: `client/src/showcase/components`）

## 6. API 設計（A + 2 に合わせて整理）
### 6.1 なぜ prod は manifest 方式にするか
- production では `client/src` のソースが存在しない/参照しない運用が一般的なため、サーバが runtime に fs スキャンして一覧を作る方式は壊れやすい。
- 一覧（tree/manifest）を **ビルド時に生成**して同梱すれば、dev/prod の挙動が揃う。

### 6.2 API（優先度順）
1) GET `/api/health` → `{ status: "ok" }`
2) GET `/api/showcase/tree` → `{ pages: FileTreeItem[], components: FileTreeItem[], htmlPages?: FileTreeItem[] }`
  - dev: fs 走査で生成
  - prod: ビルド生成物（json）を返却
3) GET `/api/showcase/manifest` → `ShowcaseEntry[]`
  - tree とは別に、フロントのプレビュー解決に必要な情報（html の publicUrl、jsx/tsx の moduleKey 等）を返す
4) GET `/api/settings` / POST `/api/settings`
  - “任意ディレクトリ指定”ではなく、`client/src/showcase` 配下の **サブディレクトリフィルタ**用の値のみを扱う
5) （任意）GET `/api/showcase/source?path=` → ソーステキスト取得（コードプレビュー用。サイズ上限付き）

## 7. 実装ステップ（A + 2 を前提に具体化）
### Step 1: バックエンド再帰探索 API（dev）
- [server/routes.ts](server/routes.ts) に以下を追加:
  - `/api/health`
  - `/api/showcase/tree`（fs 走査して tree 生成）
  - `/api/showcase/manifest`（fs 走査して manifest 生成）
- セキュリティ（非公開でも必須）:
  - 走査/読み取りは `client/src/showcase` と `client/public/showcase` のみ許可
  - パストラバーサル対策（`..` や絶対パス拒否）
  - ファイルサイズ上限（source API を作る場合）

### Step 2: フロントを API 由来 tree に置換
- [client/src/pages/showcase.tsx](client/src/pages/showcase.tsx) の mock ツリーを廃止し、`/api/showcase/tree` から取得。
- `pages/components` のタブ表示や FileTree 表示は現行 UI を流用し、データ供給元だけ差し替える。

### Step 3: プレビュー解決（JSX/TSX と HTML を分岐）
- JSX/TSX:
  - フロント側で `import.meta.glob('/src/showcase/pages/**/*.{tsx,jsx}')` と `...components...` を用意
  - `/api/showcase/manifest` の `moduleKey` と突合し、選択項目を動的 import → default export をレンダリング
- HTML:
  - `publicUrl` を `iframe src` に設定して表示

### Step 4: prod 用 manifest 生成（ビルド時）
- `script/` に manifest/tree の生成ロジックを追加（Node で fs 走査）。
- 出力先を `dist/public/showcase-manifest.json` および `dist/public/showcase-tree.json` に統一。
- [script/build.ts](script/build.ts) の `viteBuild()` 前後で生成する（どちらでも可。Vite build 前でも問題ない）。
- prod の `/api/showcase/*` は生成済み JSON を返す。

## 8. テスト方針
- ユニット: manifest 生成（拡張子フィルタ、ツリー化、id生成、publicUrl/moduleKey生成）。
- API: `/api/health`, `/api/showcase/manifest`。
- E2E（後続）: 代表的な `html` と `tsx` を1つずつプレビューして描画されること。

## 9. マイルストーン（A + 2）
- M1（半日〜1日）: `/api/showcase/tree` を dev で fs 走査実装、フロントの mock を tree API に置換。
- M2（1〜2日）: `/api/showcase/manifest` と JSX 動的 import / HTML iframe プレビューを接続。
- M3（後続）: prod 用の build 時 manifest/tree 生成を追加し、dev/prod の動作差を解消。
- M4（後続）: コード表示、検索、タグ/カテゴリ、コメント、認証など。
