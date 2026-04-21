# Refactor Survey

Date: 2026-04-21

## 1. 目的

この survey は、`design-mock-showcase` の包括的なリファクタリング計画を、**既存挙動を壊さないことを最優先**にして整理するためのものです。

今回の方針は次の 3 点です。

1. まず現状の責務過多、重複、未使用コード、改善余地を列挙する
2. その上で、壊れにくい順にリファクタリング候補を並べる
3. 実施前に必要な安全網を明確にする

## 2. 調査サマリ

### 2.1 現在の構成

- フロントエンドは `client/` 配下の React + Vite
- バックエンドは `server/` 配下の Express
- 共有型は `shared/`
- 表示対象のショーケース資産は `showcase/`
- ビルド時に `server/showcase.ts` が manifest / tree を生成し、`dist/public` に保存する構成

### 2.2 実装上の主な観察点

- `client/src/pages/showcase.tsx` が 696 行あり、画面状態、データ取得、CRUD、ダイアログ、カード表示、プレビュー遷移を 1 ファイルに集約している
- `server/showcase.ts` が 585 行あり、スキャン、ツリー生成、manifest 生成、ファイル操作、パス検証、dist artifact 管理を 1 モジュールで担っている
- `client/src/pages/preview.tsx` が動的 import、manifest 解決、HTML/JSX 分岐、エラー表示をまとめて持っている
- `client/src/components/examples/` 配下に、実コンポーネントと対応するサンプル群が 11 個あり、アプリ本体からは参照されていない
- `server/storage.ts` と `shared/schema.ts` は現行の showcase フローから未使用で、認証系テンプレートの名残に見える
- `client/src/components/ConfigPanel.tsx` は実装済みだが、アプリ本体から利用されていない
- `client/src/components/ui/` には 46 個の UI プリミティブがあるが、現在のアプリで使われているのは一部のみ

### 2.3 検証状況

- このワークスペースでは依存関係が未インストールで、`npm run check` / `npm run lint` / `npm run build` はいずれも実行できなかった
- 失敗理由はそれぞれ `tsc: command not found`, `eslint: command not found`, `tsx: command not found`
- `*test*` / `*spec*` の探索では、実質的なテストコードは確認できなかった

補足:

- 現在の Git ワークツリーには未コミット変更は見当たらなかった

## 3. 既存挙動を壊さないための前提条件

大きな整理に入る前に、次の安全網を先に整えるべきです。

### 3.1 最低限の動作保証を用意する

- `npm install` を実行し、`check` / `lint` / `build` が通るかをまず把握する
- 最低限の手動確認シナリオを固定する
- 可能なら Playwright か Vitest で smoke test を追加する

推奨する確認シナリオ:

- 一覧画面で page / component の両タブが表示される
- `showcase/pages` と `showcase/components` のファイルがツリーとカードに出る
- JSX/TSX ファイルが preview できる
- HTML ファイルが iframe preview できる
- rename / delete / create directory / move の API が正常に動く
- production build 後も manifest/tree 読み込みが崩れない

### 3.2 挙動固定の考え方

リファクタリング中は以下を基本的に固定対象とします。

- API エンドポイント名
- manifest と tree の基本レスポンス構造
- preview URL の形
- `showcase/` ディレクトリ配下をスキャンするという前提
- 既存のカード UI と遷移フロー

## 4. 改善候補一覧

ここでは、改善余地を「優先度」と「破壊リスク」で整理します。

### 4.1 最優先: 先に安全網を作る

#### A. 実行基盤の整備

- 対象: `package.json`, リポジトリ全体
- 内容: 依存関係インストール、`check` / `lint` / `build` の通過確認、必要なら README 更新
- 理由: 現状は品質ゲートが実行不能で、変更の安全性を測れない
- リスク: 低
- 期待効果: 今後の refactor 全体の失敗率を大きく下げる

#### B. 回帰確認シナリオの文書化と自動化

- 対象: `client/`, `server/`
- 内容: showcase の主要操作に対する smoke test または手順書を整備
- 理由: rename / move / preview など、見た目以上に壊れやすい導線が多い
- リスク: 低
- 期待効果: 以降の分割・整理を安心して進められる

### 4.2 低リスクで先に着手しやすい候補

#### C. 未使用コードの隔離または削除

- 対象:
  - `server/storage.ts`
  - `shared/schema.ts`
  - `client/src/components/ConfigPanel.tsx`
  - `client/src/components/examples/*`
- 内容: 未使用コードを `archive/` に隔離するか、使用実績を確認した上で削除する
- 理由: 現在の showcase フローに不要なコードが混在しており、保守対象が実態より広く見える
- リスク: 低
- 期待効果: 読解コストの削減、lint 対象の整理、依存関係の見直しがしやすくなる

注意:

- `examples/` は将来のコンポーネントカタログ用途の可能性もあるため、いきなり削除ではなく「本番コードと分離して明示化」から入るのが安全

#### D. 旧来フィールドや暫定構造の整理

- 対象:
  - `shared/showcase.ts`
  - `server/showcase.ts`
  - `client/src/pages/showcase.tsx`
- 内容: `htmlPages` の扱いを見直す
- 理由: サーバは `htmlPages: []` を返しつつ、クライアント側では `pages + htmlPages` を合成している。現状では実質的に冗長で、型と実装の意図がずれている
- リスク: 低から中
- 期待効果: manifest/tree の責務が明確になり、将来の API 変更リスクが減る

#### E. テーマ処理の単一点化

- 対象:
  - `client/src/App.tsx`
  - `client/src/components/ThemeToggle.tsx`
  - `client/src/lib/theme.ts`
- 内容: 初期テーマ適用とトグル状態管理を 1 箇所に寄せる
- 理由: `App` と `ThemeToggle` の両方で `applyTheme(getPreferredTheme())` 系の処理が走っており、責務が重複している
- リスク: 低
- 期待効果: 初期表示のちらつきや将来のテーマ拡張時の分岐増加を防げる

### 4.3 中優先: 分割で読みやすくしたい候補

#### F. `showcase.tsx` の分割

- 対象: `client/src/pages/showcase.tsx`
- 内容:
  - データ取得
  - 選択状態
  - rename / delete / create directory / move の action 群
  - 一覧レイアウト
  - preview レイアウト
  - ダイアログ群
  を別 hook / 別 component に分割する
- 理由: 1 画面に責務が集中しており、UI 調整でも副作用を生みやすい
- リスク: 中
- 期待効果: 今後の機能追加や修正がしやすくなる

推奨する分割単位:

- `useShowcaseData`
- `useShowcaseActions`
- `ShowcaseSidebar`
- `ShowcaseGrid`
- `ShowcaseDialogs`
- `ShowcaseDetailView`

#### G. `server/showcase.ts` の責務分離

- 対象: `server/showcase.ts`
- 内容:
  - path validation
  - scan
  - tree/manifest build
  - dist artifact read/write
  - mutate operations
  を別モジュールへ分割する
- 理由: 現状は変更時の影響範囲が広く、特にファイル操作と読み取りロジックが密結合
- リスク: 中
- 期待効果: API 挙動を変えずに内部整理しやすくなる

推奨する分割単位:

- `server/showcase/paths.ts`
- `server/showcase/scan.ts`
- `server/showcase/tree.ts`
- `server/showcase/artifacts.ts`
- `server/showcase/mutations.ts`
- `server/showcase/errors.ts`

#### H. preview ローダーの責務整理

- 対象: `client/src/pages/preview.tsx`
- 内容: module 解決、manifest 参照、Preview export 判定、HTML preview 表示を分割する
- 理由: preview 周辺は動的 import を使っており、バグが出た時の原因切り分けが難しい
- リスク: 中
- 期待効果: preview 不具合の診断性が上がる

### 4.4 挙動改善も見込めるが、ガードが必要な候補

#### I. FileTree の DnD 挙動見直し

- 対象: `client/src/components/FileTree.tsx`
- 内容: 再帰描画時にも `onMove` を引き継ぐように整理し、ネストされたフォルダへのドロップ可否を明確化する
- 理由: 現状コードでは再帰呼び出し時に `onMove` が渡されておらず、トップレベル以外のフォルダで drag & drop が成立しない可能性が高い
- リスク: 中
- 期待効果: 期待通りのファイル移動 UX に近づく

注意:

- これは純粋な構造整理ではなく挙動修正を含むため、テスト導入後に着手すべき

#### J. モバイル対応の実運用レベル化

- 対象:
  - `client/src/pages/showcase.tsx`
  - `client/src/components/ui/sidebar.tsx`
  - `client/src/hooks/use-mobile.tsx`
- 内容: 既存の固定 `aside` レイアウトを、実際のモバイル利用に耐える構造へ置き換える
- 理由: design guidelines ではモバイル時の sidebar collapse が想定されているが、現実装は固定サイドバー中心
- リスク: 中から高
- 期待効果: 小画面での操作性向上

#### K. production / development の manifest-tree 取得経路の整合性検証

- 対象:
  - `server/showcase.ts`
  - `script/build.ts`
  - `server/static.ts`
- 内容: 開発時のライブスキャンと本番時の dist artifact 読み込みの差分を吸収する
- 理由: 実行経路が 2 系統あり、将来的に片方だけ壊れるリスクがある
- リスク: 中
- 期待効果: 環境差異による不具合の防止

## 5. 推奨実施順

「既存挙動を壊さない」を最優先にするなら、順番は次の通りが安全です。

### Phase 0: ベースライン固定

1. 依存関係を入れて `check` / `lint` / `build` を通す
2. 主要導線の手動確認シナリオを文書化する
3. 最低限の smoke test を追加する

### Phase 1: 低リスク整理

1. 未使用コードを隔離する
2. `htmlPages` など暫定構造を整理する
3. テーマ処理を単一点化する
4. ドキュメントとディレクトリ役割を更新する

### Phase 2: 内部責務の分割

1. `server/showcase.ts` を内部モジュールに分解する
2. `client/src/pages/showcase.tsx` を hook / view / dialog に分割する
3. `client/src/pages/preview.tsx` の loader 周辺を分割する

### Phase 3: 挙動改善を伴う整理

1. FileTree の nested DnD を見直す
2. モバイル sidebar を改善する
3. dev/prod 経路差の吸収を仕上げる

## 6. すぐに着手しない方がよいもの

以下は魅力があるものの、現時点では優先度を上げすぎない方が安全です。

- UI デザインの全面刷新
- ルータや状態管理ライブラリの置き換え
- preview 実行方式の大変更
- showcase ディレクトリ構造そのものの変更
- DB や認証機構の追加

理由:

- これらは「リファクタリング」より「再設計」に近く、既存挙動維持の前提と相性が悪い

## 7. 最初の 1 スプリントでやるべき範囲

初手として最も安全で効果が高いのは次のセットです。

1. 依存関係を整えて `check` / `lint` / `build` が走る状態にする
2. 回帰確認シナリオを追加する
3. 未使用コードを隔離する
4. `showcase.tsx` と `server/showcase.ts` の責務を棚卸しし、分割用の内部境界を切る

この順番なら、機能を増やさずに保守性だけを上げやすいです。

## 8. 結論

このプロジェクトは、現時点でも目的は明確で、主要機能も比較的一本筋です。一方で、`showcase` 関連の責務がフロントとサーバの両方で大きな単位に集約されているため、今のうちに安全網を整えた上で分割しておく価値が高いです。

最も重要なのは、**先にテストや確認手順で挙動を固定し、その後に未使用コード整理と責務分割へ進むこと**です。これを守れば、既存挙動を壊さずに段階的な改善を進めやすくなります。
