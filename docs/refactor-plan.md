# Refactor Plan

Date: 2026-04-21
Derived from: [refactor-survey.md](./refactor-survey.md)

## 1. 目的

このドキュメントは、`design-mock-showcase` のリファクタリングを**既存挙動を壊さず段階的に進めるための実行計画**です。

survey では改善候補の棚卸しを行いました。この plan では、実際に着手する順番、各フェーズの完了条件、検証方法、保留条件を明文化します。

## 2. 実行原則

今回のリファクタでは、以下を常に優先します。

1. 既存 API と既存 UI フローを壊さない
2. 挙動変更を伴う修正は、必ず先に確認手順かテストを置く
3. 一度に大きく変えず、小さく分割して通す
4. 各フェーズの終了時点で `check` / `lint` / `build` と主要導線確認を行う

## 3. 非目標

今回の plan には次の内容を含めません。

- UI デザインの全面刷新
- ルータや状態管理ライブラリの置き換え
- preview 実行方式の再設計
- `showcase/` ディレクトリ構造の大幅変更
- DB / 認証基盤の導入

## 4. 現時点の前提

現状確認できている前提は以下です。

- `client/src/pages/showcase.tsx` に UI と state と action が集中している
- `server/showcase.ts` に scan / build / mutation / artifact 管理が集中している
- `client/src/pages/preview.tsx` に preview 解決処理が集中している
- `server/storage.ts`, `shared/schema.ts`, `client/src/components/ConfigPanel.tsx`, `client/src/components/examples/*` は現行導線から未使用に見える
- 依存関係未インストールのため、現時点では `npm run check`, `npm run lint`, `npm run build` を実行できていない

## 5. 成功条件

この refactor が成功といえる条件を先に固定します。

### 5.1 機能面

- page / component の一覧表示が維持される
- JSX / TSX preview が維持される
- HTML preview が維持される
- rename / delete / create directory / move が維持される
- development と production build の両方で showcase manifest / tree の取得が維持される

### 5.2 品質面

- `check` / `lint` / `build` が実行可能になる
- 最低限の回帰確認シナリオが文書化または自動化される
- 責務集中ファイルの分割で、読みやすさと変更容易性が改善される

## 6. フェーズ構成

実装は次の 5 フェーズで進めます。

1. Phase 0: ベースライン固定
2. Phase 1: 低リスク整理
3. Phase 2: サーバ責務分割
4. Phase 3: クライアント責務分割
5. Phase 4: 挙動改善を伴う整理

---

## 7. Phase 0: ベースライン固定

### 7.1 目的

このフェーズの目的は、以後の変更で何が壊れたかを判定できる状態を作ることです。

### 7.2 タスク

#### P0-1. 依存関係を整える

- 内容:
  - `npm install` を実行する
  - `npm run check`
  - `npm run lint`
  - `npm run build`
  の結果を確認する
- 期待成果物:
  - 実行結果メモ
  - 必要なら `README.md` の更新
- 完了条件:
  - 3 コマンドすべてが実行可能になっている
  - 失敗する場合でも、失敗理由が再現可能な形で記録されている

#### P0-2. 回帰確認シナリオを定義する

- 内容:
  - 手動確認項目を `docs/` に追加するか、既存ドキュメントに追記する
- 対象シナリオ:
  - 一覧表示
  - タブ切り替え
  - JSX / TSX preview
  - HTML preview
  - rename
  - delete
  - create directory
  - move
  - production build 後の起動確認
- 完了条件:
  - 開発者が同じ手順で同じ確認を再実施できる

#### P0-3. 最低限の自動テスト方針を決める

- 内容:
  - まずは Playwright か Vitest のどちらで smoke test を置くか決める
  - 初回は範囲を広げず、重要導線のみ対象にする
- 推奨:
  - API と画面フローの両方を触るため、E2E 寄りの smoke test を優先
- 完了条件:
  - 最低 1 本、回帰を拾えるテストを追加するか、追加不能なら理由を明記する

### 7.3 このフェーズで壊してはいけないもの

- package script 名
- API パス
- 現在の build 出力構造

### 7.4 このフェーズの exit criteria

- `check` / `lint` / `build` の状態が見える
- 回帰確認の基準ができる

---

## 8. Phase 1: 低リスク整理

### 8.1 目的

このフェーズの目的は、挙動を変えずに不要物と重複を減らし、分割しやすい土台を作ることです。

### 8.2 タスク

#### P1-1. 未使用コードを整理する

- 対象候補:
  - `server/storage.ts`
  - `shared/schema.ts`
  - `client/src/components/ConfigPanel.tsx`
  - `client/src/components/examples/*`
- 方針:
  - いきなり削除せず、まず参照有無を再確認する
  - 必要なら `archive/` ないし `docs/legacy/` 的な退避先へ移す
  - 削除する場合は削除理由を commit message または doc に残す
- 完了条件:
  - 本番導線で未使用のコードが明確化される
  - 誤削除がないことを `rg` と `check` / `lint` で確認できる

#### P1-2. `htmlPages` の暫定構造を整理する

- 対象:
  - `shared/showcase.ts`
  - `server/showcase.ts`
  - `client/src/pages/showcase.tsx`
- 内容:
  - `pages` と `htmlPages` の責務を再定義する
  - 実態に合わせて API 型とクライアント処理を揃える
- 原則:
  - API の互換性をすぐに壊さない
  - 必要なら一度 deprecate 期間を置く
- 完了条件:
  - サーバとクライアントの意図が揃っている
  - 同じデータを二重に扱うコードが減っている

#### P1-3. テーマ処理を単一点化する

- 対象:
  - `client/src/App.tsx`
  - `client/src/components/ThemeToggle.tsx`
  - `client/src/lib/theme.ts`
- 内容:
  - 初期テーマ適用の責務を 1 箇所に寄せる
  - toggle の state と永続化の責務を揃える
- 完了条件:
  - 初期表示とトグルで theme 処理が重複しない
  - 見た目と localStorage の挙動が維持される

### 8.3 このフェーズの exit criteria

- 未使用コードが整理される
- 型と実装のずれが 1 段減る
- 以後の分割のノイズが減る

---

## 9. Phase 2: サーバ責務分割

### 9.1 目的

`server/showcase.ts` の責務集中を解消し、API の表面は変えずに内部構造だけを整理します。

### 9.2 タスク

#### P2-1. エラー生成を分離する

- 新設候補:
  - `server/showcase/errors.ts`
- 内容:
  - `notFoundError`
  - `badRequestError`
  - `conflictError`
  を抽出する
- 完了条件:
  - エラー生成が単独モジュールから参照される

#### P2-2. パス関連ロジックを分離する

- 新設候補:
  - `server/showcase/paths.ts`
- 内容:
  - `toPosix`
  - `resolveShowcasePath`
  - root path 定義
  - path existence helper
  を集約する
- 完了条件:
  - パス解決責務が scan / mutation と分離される

#### P2-3. scan ロジックを分離する

- 新設候補:
  - `server/showcase/scan.ts`
- 内容:
  - `scanDirectory`
  - `scanDirectories`
  - scan に必要な内部 type
  を移す
- 完了条件:
  - ファイル探索ロジックが mutation から独立する

#### P2-4. manifest / tree build を分離する

- 新設候補:
  - `server/showcase/build.ts`
  - `server/showcase/tree.ts`
- 内容:
  - `buildTree`
  - `generateManifest`
  - `generateTree`
  を整理する
- 完了条件:
  - データ構築ロジックが見通しよく追える

#### P2-5. dist artifact 管理を分離する

- 新設候補:
  - `server/showcase/artifacts.ts`
- 内容:
  - `loadDistJson`
  - `writeJson`
  - `writeShowcaseArtifacts`
  を移す
- 完了条件:
  - production / build 用ロジックが scan / mutation から分離される

#### P2-6. mutation を分離する

- 新設候補:
  - `server/showcase/mutations.ts`
- 内容:
  - rename
  - delete
  - create directory
  - move
  を集約する
- 完了条件:
  - read 系と write 系が分離される

### 9.3 実装上の注意

- `server/routes.ts` の外部インターフェースは極力維持する
- 一度に全部動かさず、抽出ごとに `check` / `build` を確認する

### 9.4 このフェーズの exit criteria

- `server/showcase.ts` が薄い facade か export 集約モジュールになる
- 挙動変更なしで責務分離が完了する

---

## 10. Phase 3: クライアント責務分割

### 10.1 目的

`showcase.tsx` と `preview.tsx` の責務集中を解消し、UI 変更や機能追加時の影響範囲を狭めます。

### 10.2 タスク

#### P3-1. `showcase.tsx` の state / query を hook 化する

- 新設候補:
  - `client/src/features/showcase/hooks/useShowcaseData.ts`
  - `client/src/features/showcase/hooks/useShowcaseSelection.ts`
- 内容:
  - tree / manifest 取得
  - flat list 化
  - manifest map 化
  - selected entry 解決
  を hook へ寄せる
- 完了条件:
  - ページ本体からデータ解決ロジックが大幅に減る

#### P3-2. action 群を hook 化する

- 新設候補:
  - `client/src/features/showcase/hooks/useShowcaseActions.ts`
- 内容:
  - reload
  - rename
  - delete
  - create directory
  - move
  をまとめる
- 完了条件:
  - API 呼び出しと toast 表示が 1 箇所で管理される

#### P3-3. ダイアログ群を分離する

- 新設候補:
  - `client/src/features/showcase/components/ShowcaseDialogs.tsx`
- 内容:
  - rename dialog
  - delete dialog
  - create directory dialog
  を 1 コンポーネントにまとめる
- 完了条件:
  - `showcase.tsx` から modal 実装詳細が切り離される

#### P3-4. 一覧画面のレイアウトを分離する

- 新設候補:
  - `client/src/features/showcase/components/ShowcaseSidebar.tsx`
  - `client/src/features/showcase/components/ShowcaseGrid.tsx`
  - `client/src/features/showcase/components/ShowcaseDetailView.tsx`
- 内容:
  - sidebar
  - tab 切り替え
  - cards
  - detail view 分岐
  を独立させる
- 完了条件:
  - `showcase.tsx` が compose 専用に近い見通しになる

#### P3-5. `preview.tsx` のローダー責務を分離する

- 新設候補:
  - `client/src/features/preview/lib/showcaseModules.ts`
  - `client/src/features/preview/lib/resolvePreviewComponent.ts`
  - `client/src/features/preview/hooks/usePreviewEntry.ts`
- 内容:
  - module glob
  - export 解決
  - manifest entry 解決
  を分離する
- 完了条件:
  - preview 失敗時の原因が切り分けやすくなる

### 10.3 実装上の注意

- 新しい `features/` 構成を入れる場合でも、既存 import alias は壊さない
- 分割後も props の責務を肥大化させない

### 10.4 このフェーズの exit criteria

- `client/src/pages/showcase.tsx` と `client/src/pages/preview.tsx` が薄くなる
- UI は変えずに構造だけが整理される

---

## 11. Phase 4: 挙動改善を伴う整理

### 11.1 目的

ここでは構造整理ではなく、改善余地がある挙動に着手します。Phase 0 から 3 のガードが揃ってから実施します。

### 11.2 タスク

#### P4-1. FileTree の nested DnD 改善

- 対象:
  - `client/src/components/FileTree.tsx`
- 内容:
  - 再帰描画時に `onMove` を引き継ぐ
  - nested folder drop を正常化する
  - 必要なら drop target 表示を改善する
- 完了条件:
  - トップレベル以外のフォルダにも move できる
  - 誤移動が起きない

#### P4-2. モバイル sidebar の改善

- 対象:
  - `client/src/pages/showcase.tsx`
  - `client/src/components/ui/sidebar.tsx`
  - `client/src/hooks/use-mobile.tsx`
- 内容:
  - 固定 sidebar をモバイルで扱える構造へ見直す
  - 必要なら既存の `ui/sidebar` を活用する
- 完了条件:
  - 768px 未満でも主要操作が成立する
  - デスクトップ体験を壊さない

#### P4-3. dev / prod 差分の吸収

- 対象:
  - `server/showcase.ts`
  - `script/build.ts`
  - `server/static.ts`
- 内容:
  - 開発時ライブスキャンと build artifact 読み込みの差分を整理する
  - 環境差で manifest / tree が壊れないようにする
- 完了条件:
  - dev / prod で同じファイル集合に対して整合した結果が得られる

### 11.3 このフェーズの exit criteria

- 構造改善だけでなく、実際の UX 改善が確認できる
- それでも既存の主要導線は壊れていない

---

## 12. タスク依存関係

各フェーズは完全独立ではありません。依存関係は以下の通りです。

- Phase 1 は Phase 0 完了後に着手する
- Phase 2 と Phase 3 は並行も可能だが、同時に大きく進めすぎない
- Phase 4 は Phase 0 の確認基準がない限り着手しない

特に依存が強いもの:

- `P4-1 FileTree DnD 改善` は `P0-2`, `P0-3` の後
- `P2-*` と `P3-*` は `P1-2 htmlPages 整理` の方針が固まってからの方が安全

## 13. 変更単位の推奨

1 回の PR または 1 まとまりの変更は、小さく保つ方が安全です。

推奨単位:

1. 基盤整備だけの変更
2. 未使用コード整理だけの変更
3. サーバ分割だけの変更
4. クライアント分割だけの変更
5. 挙動改善だけの変更

避けたい進め方:

- 未使用コード削除と責務分割と挙動変更を同時に行うこと

## 14. 各フェーズの検証チェックリスト

### 共通

- `npm run check`
- `npm run lint`
- `npm run build`
- 一覧表示確認
- page preview 確認
- component preview 確認
- HTML preview 確認

### mutation 変更時の追加確認

- rename
- delete
- create directory
- move
- エラートースト表示

### build 系変更時の追加確認

- build 後に manifest / tree が生成される
- production 起動で画面が成立する

## 15. 保留条件

以下に当てはまる場合は、そのフェーズを止めて再判断します。

- `check` / `lint` / `build` が新たに崩れた
- preview の読み込み方式に想定外の制約が見つかった
- `examples/` や `ConfigPanel` に利用予定があることが判明した
- dev / prod の挙動差が大きく、単純分割では吸収できない

## 16. 最初に着手する実装セット

最初の実装セットとして推奨するのは次の順です。

1. Phase 0 を完了する
2. Phase 1 の `P1-1`, `P1-2`, `P1-3` を進める
3. Phase 2 の `P2-1` から `P2-3` まで進める
4. その後で Phase 3 に入る

この順番なら、構造を整えながらも、いきなり挙動変更に踏み込まずに済みます。

## 17. 結論

この refactor は、一気にきれいにするより、**安全網を先に作ってから責務を分割し、最後に挙動改善へ進む**のが最も安全です。

実行上の第一目標は、次の状態を作ることです。

- 変更前後の差分を検証できる
- 1 ファイルに集中した責務を少しずつ解ける
- 挙動改善を入れても戻しやすい

この plan は、そのための実装順と判断基準を固定するためのものです。
