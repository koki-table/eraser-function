## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI (MUI)
- **Language**: TypeScript
- **Styling**: Material-UI styled components
- **State Management**: SWR + React Context
- **Form**: React Hook Form + Zod
- **Icons**: Phosphor Icons
- **Analytics**: Amplitude

### 開発・テストツール
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier
- **Storybook**: コンポーネントカタログ

## 🚀 開発環境セットアップ

### 必要なコマンド

```bash
# Node.jsバージョン管理（nvm使用）
nvm install && nvm use

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env

# 開発サーバー起動
npm run dev

# リント実行
npm run lint

# テスト実行
npm run test

# Storybook起動
npm run storybook

# ビルド
npm run build
```

## 📁 ディレクトリ構造

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # メインアプリケーション
│   │   ├── generation/          # 画像生成機能
│   │   │   ├── sample/       # サンプル
├── components/                   # Reactコンポーネント
│   ├── common/                  # 共通コンポーネント
│   ├── features/                # 機能別コンポーネント
│   └── system/                  # システム関連コンポーネント
├── hooks/                       # カスタムフック
├── libs/                        # ライブラリ・ユーティリティ
├── types/                       # TypeScript型定義
└── contexts/                    # Reactコンテキスト
```

## 🏗️ アーキテクチャパターン

### ページ構成とコンポーネント配置

**基本方針：Page と同じ階層に配置**

```
app/(app)/example/
├── layout.tsx       # Server Component（メタ情報設定）
├── page.tsx         # Client Component（"use client"）
├── hooks/           # カスタムフック
│   ├── useExample.ts
│   └── useExampleData.ts
├── components/      # そのページ専用コンポーネント
│   ├── ExampleHeader/
│   │   └── index.tsx
│   └── ExampleForm/
│       └── index.tsx
├── helpers/         # ヘルパー関数（ビジネスロジック -> テスト対象）
│   ├── validationHelper.ts
│   └── calculationHelper.ts
├── contexts/        # そのページ専用のReactコンテキスト
│   └── ExampleContext.tsx
└── config/          # 設定値（定数）
    ├── formConfig.ts
    └── apiConfig.ts
```

### Server/Client Component の棲み分け
- **layout.tsx**: Server Component（SEO対策でメタ情報設定）
- **page.tsx**: Client Component（`"use client"` ディレクティブ使用）
- **components**: Client Component（状態管理、イベントハンドリング）

### コンポーネント配置判断基準
- そのページでしか使わない → `page.tsx`と同じ階層の`components/`
- 機能別だが汎用的 → `components/features/`
- プロジェクト全体で再利用 → `components/common/`

## 🧪 テスト戦略

### テスト対象
- **Helper関数**: ビジネスロジックを単体テストで検証
- **コンポーネント**: 複雑なロジックはhelper関数に切り出してテスト

### テスト実行
```bash
npm run test  # Vitest + Testing Library
```

## 📋 開発ガイドライン

### コード規約
- Material-UI の styled components を使用
- CSS Modules は使用しない
- TypeScript必須
- ESLint + Prettier に従う

### 国際化対応
- `messages/${locale}.json`に文言追加
- `useTranslations`経由で参照

### アイコン
- Phosphor Icons使用（https://phosphoricons.com/）

### API通信
- SWR使用
- `types/`ディレクトリでAPI型変換


## 💡 開発時の注意点

### パフォーマンス
- 画像最適化にNext.js Image使用
- 無限スクロールは仮想化検討
- SWRでデータキャッシュ活用

