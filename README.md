# Design Mock Showcase

`showcase/` 配下に置いたデザインモックや UI コンポーネントを、一覧・プレビュー・簡易管理できるローカル向けショーケースアプリです。React/Vite のフロントエンドと Express の API を 1 つの Node.js プロセスで動かし、ページとコンポーネントを同じ UI から確認できます。

このリポジトリは「デザイン確認用の置き場」を素早く用意したいときに向いています。`.jsx` / `.tsx` / `.html` を自動でスキャンし、ファイルツリーの表示、プレビュー、リネーム、移動、削除、ディレクトリ追加まで行えます。

## 主な機能

- `showcase/pages` と `showcase/components` を自動スキャンして一覧化
- ページとコンポーネントをタブで切り替えて管理
- `.jsx` / `.tsx` はアプリ内プレビュー、`.html` は静的ファイルとしてプレビュー
- ファイルツリー上での移動、ファイル名変更、削除、ディレクトリ作成
- React Query による manifest / tree の再取得
- 本番ビルド時に `showcase-manifest.json` と `showcase-tree.json` を生成

## 動作環境

- Node.js 20 系推奨
- npm

## セットアップ

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

起動後は `http://localhost:5000` でアクセスできます。

## 使い方

### 1. ファイルを配置する

以下のいずれかにファイルを追加します。

- `showcase/pages`
- `showcase/components`

対応している拡張子は次のとおりです。

- `.jsx`
- `.tsx`
- `.html`

補足:

- 先頭が `.` のファイルやディレクトリはスキャン対象外です。
- サブディレクトリは再帰的にスキャンされます。
- `pages` はページ全体のモック、`components` は単体 UI の確認用途を想定しています。

### 2. ブラウザで確認する

アプリを開くと、`showcase/` 以下のファイルから manifest とツリーが生成され、サイドバーに表示されます。

- ページは `Pages` タブに表示されます。
- コンポーネントは `Components` タブに表示されます。
- 項目を選ぶと詳細ビューに遷移し、プレビューを確認できます。

### 3. UI から管理する

アプリ上から次の操作ができます。

- リロード
- ファイル名変更
- ファイル削除
- ファイル移動
- ディレクトリ追加

これらの操作は `showcase/` 配下に限定されており、アプリ外のパスは操作できません。

## スクリプト

`package.json` で定義されている主なスクリプトです。

- `npm run dev`: 開発サーバーを起動します。Express が API と Vite をまとめて提供します。
- `npm run build`: クライアントをビルドし、`dist/public` を作成したうえで manifest / tree の JSON と `dist/index.cjs` を生成します。
- `npm start`: 本番モードで `dist/index.cjs` を起動します。事前に `npm run build` が必要です。
- `npm run check`: TypeScript の型チェックを実行します。
- `npm run lint`: ESLint を実行します。
- `npm run test:smoke`: ショーケースの読み込みとファイル操作のスモークテストを実行します。
- `npm run db:push`: Drizzle Kit の `push` を実行します。現在のショーケース機能だけを使う場合は必須ではありません。

## ディレクトリ構成

```text
.
├── client/                 # Vite + React フロントエンド
│   ├── src/
│   │   ├── components/     # 汎用 UI と画面部品
│   │   ├── features/       # showcase / preview の機能別実装
│   │   ├── lib/            # QueryClient, theme など
│   │   └── pages/          # 画面ルーティング
│   └── public/             # 静的アセット
├── server/                 # Express サーバーと showcase 処理
│   └── showcase/           # スキャン、manifest/tree 生成、ファイル操作
├── shared/                 # クライアント・サーバー共通型
├── showcase/               # 表示対象のモック置き場
│   ├── pages/
│   └── components/
├── script/build.ts         # 本番ビルドのエントリ
└── tests/                  # スモークテスト
```

## 仕組み

### 開発時

- `npm run dev` は `server/index.ts` を `tsx` で実行します。
- API は Express、フロントエンドは Vite を経由して配信されます。
- `/api/showcase/tree` と `/api/showcase/manifest` は、その場で `showcase/` をスキャンして結果を返します。

### 本番時

- `npm run build` でクライアント成果物を `dist/public` に出力します。
- 同時に `dist/public/showcase-manifest.json` と `dist/public/showcase-tree.json` を生成します。
- `npm start` では生成済み JSON を読み込んで高速に配信します。

## API の概要

UI は主に以下の API を利用します。

- `GET /api/health`
- `GET /api/showcase/tree`
- `GET /api/showcase/manifest`
- `POST /api/showcase/rename`
- `POST /api/showcase/delete`
- `POST /api/showcase/directory`
- `POST /api/showcase/move`

HTML ファイルは `/showcase/...` 配下の静的ファイルとしても配信されます。

## プレビュー仕様

- `.jsx` / `.tsx`
  - manifest に module key を持たせ、`/preview/:id` 経由で表示します。
- `.html`
  - `showcase/` を静的配信し、`publicUrl` を iframe で開きます。
- `component`
  - 枠付きのプレビュー領域内で表示します。
- `page`
  - 画面全体に近い形で表示します。

## テスト

最低限の動作確認は次のコマンドで行えます。

```bash
npm run test:smoke
```

このテストでは次の内容を確認しています。

- manifest / tree が取得できること
- 本番用 artifact が生成できること
- ディレクトリ作成、リネーム、移動、削除が期待どおり動くこと

## 補足

- デフォルトの待受ポートは `5000` です。`PORT` 環境変数があればそちらを使用します。
- 本番起動は `dist/public` の存在を前提にしているため、`npm run build` 前に `npm start` を実行すると失敗します。

## ライセンス

`LICENSE.txt` を参照してください。
