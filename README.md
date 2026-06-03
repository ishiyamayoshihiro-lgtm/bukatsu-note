# 部活ノート — 開発ドキュメント

部活動日誌・管理システム。Next.js App Router + Prisma + NextAuth.js (Google OAuth) で構築。

---

## 目次

1. [技術スタック](#技術スタック)
2. [実装済み機能一覧](#実装済み機能一覧)
3. [ファイル構成](#ファイル構成)
4. [別PCでの環境構築手順](#別pcでの環境構築手順)
5. [残り作業・TODO](#残り作業todo)
6. [認証・ロール判定の仕様](#認証ロール判定の仕様)
7. [データベーススキーマ概要](#データベーススキーマ概要)
8. [本番デプロイ手順（Vercel）](#本番デプロイ手順vercel)

---

## 技術スタック

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 3 |
| 認証 | NextAuth.js v4 + Google OAuth 2.0 |
| ORM | Prisma 5 |
| DB | PostgreSQL（ローカル開発は Supabase / Neon 等でも可） |
| バリデーション | Zod |

---

## 実装済み機能一覧

### 認証・セキュリティ（完了）

- [x] Google OAuth 2.0 ログイン（NextAuth.js）
- [x] ドメイン制限: `@haguroko.ed.jp` のみ許可
- [x] 招待ホワイトリスト: `InvitedUser` テーブルに存在するメールのみ通過
- [x] ロール自動判別: メールのローカルパートに数字 → 生徒 / 数字なし → 教員
- [x] JWT + session にロール・ユーザーID を付与
- [x] `middleware.ts` によるルートガード（`/coach/*` / `/student/*` / `/board/*`）
- [x] Server Components 側レイアウトでの二重ロールチェック
- [x] 認証エラー専用ページ（`/error`）

### 教員機能（完了）

- [x] ダッシュボード: 未提出生徒ハイライト・怪我/メンタルアラート表示
- [x] 日誌一覧: 全生徒の日誌を検索（キーワード・生徒絞り込み・日付範囲・ページネーション）
- [x] 日誌詳細: 内容閲覧・コメント返信・クイック返信スタンプ UI
- [x] 優秀ノート設定: `isShared` フラグを ON/OFF（ワンクリック）
- [x] 招待管理: メールアドレスの追加・取消
- [x] スケジュール管理: 予定の追加・削除

### 生徒機能（完了）

- [x] ダッシュボード: 本日の提出状況・コーチコメント表示
- [x] 個人目標の設定・編集
- [x] 日誌入力フォーム: 練習内容・反省・課題・睡眠・疲労度・怪我・メンタル
- [x] 同日の日誌は上書き保存（二重提出防止）
- [x] スケジュール確認: 残り日数表示・過去予定一覧

### 共通機能（完了）

- [x] 掲示板: 優秀ノート（isShared）タイムライン
- [x] 過去ログ検索（生徒は自分のみ、教員は全生徒）
- [x] スケジュール掲示（最新5件）
- [x] ナビゲーションバー（ロール別メニュー・ログアウト）

---

## ファイル構成

```
部活ノート/
├── .env                    ← 環境変数（Git 管理外）★要設定
├── .env.example            ← 環境変数の雛形
├── .gitignore
├── middleware.ts           ← ルートガード
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma       ← DBスキーマ（全モデル定義）
│   └── seed.ts             ← 初期データ★メアド要変更
│
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx                      ← / → ロール別にリダイレクト
    │   ├── api/auth/[...nextauth]/route.ts
    │   ├── (auth)/
    │   │   ├── login/page.tsx            ← ログイン画面
    │   │   └── error/page.tsx            ← 認証エラー画面
    │   └── (app)/
    │       ├── coach/
    │       │   ├── layout.tsx            ← COACHロールガード
    │       │   ├── page.tsx              ← 教員ダッシュボード
    │       │   ├── logs/
    │       │   │   ├── page.tsx          ← 日誌一覧・検索
    │       │   │   └── [id]/page.tsx     ← 日誌詳細・返信
    │       │   ├── invite/page.tsx       ← 招待管理
    │       │   └── schedule/page.tsx     ← スケジュール管理
    │       ├── student/
    │       │   ├── layout.tsx            ← STUDENTロールガード
    │       │   ├── page.tsx              ← 生徒ダッシュボード & 日誌入力
    │       │   └── schedule/page.tsx     ← スケジュール確認
    │       └── board/
    │           ├── layout.tsx            ← 要ログインガード
    │           └── page.tsx              ← 掲示板・過去ログ検索
    │
    ├── components/
    │   ├── NavBar.tsx
    │   ├── Providers.tsx                 ← SessionProvider ラッパー
    │   ├── auth/LoginButton.tsx
    │   ├── coach/
    │   │   ├── LogSearchForm.tsx
    │   │   ├── ReplyForm.tsx             ← スタンプUI付きコメント返信
    │   │   ├── SharedToggle.tsx
    │   │   ├── InviteForm.tsx
    │   │   ├── RevokeButton.tsx
    │   │   ├── ScheduleForm.tsx
    │   │   └── DeleteScheduleButton.tsx
    │   ├── student/
    │   │   ├── LogForm.tsx
    │   │   └── TargetEditor.tsx
    │   └── shared/
    │       └── BoardSearch.tsx
    │
    ├── lib/
    │   ├── auth.ts                       ← NextAuth設定・コールバック
    │   ├── prisma.ts                     ← Prismaシングルトン
    │   └── actions/
    │       ├── log.actions.ts            ← 日誌CRUD・目標更新
    │       ├── invite.actions.ts         ← 招待追加・取消
    │       └── schedule.actions.ts       ← スケジュール追加・削除
    │
    └── types/
        └── next-auth.d.ts               ← session.user.role / .id 型拡張
```

---

## 別PCでの環境構築手順

### 前提条件

- Node.js 18 以上がインストールされていること
- PostgreSQL が使えること（ローカル or クラウド）
- Google Cloud Console へのアクセス権があること

### Step 1: ファイルをコピー

Google Drive からプロジェクトフォルダをコピーし、作業ディレクトリに配置する。  
`node_modules/` と `.next/` は不要（コピーしなくてよい）。

### Step 2: パッケージのインストール

```powershell
cd 部活ノート
npm install --legacy-peer-deps
```

### Step 3: Google Cloud Console で OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクトを作成（または既存を使用）
3. 「APIとサービス」→「認証情報」→「OAuth 2.0 クライアント ID」を作成
   - アプリケーションの種類: **ウェブアプリケーション**
   - 承認済みリダイレクト URI に追加:
     - `http://localhost:3000/api/auth/callback/google`（開発用）
     - `https://本番ドメイン/api/auth/callback/google`（本番用）
4. **クライアント ID** と **クライアントシークレット** をメモ

### Step 4: .env を設定

`.env.example` をコピーして `.env` を作成し、値を埋める:

```env
# Google OAuth（Step 3 で取得）
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# NextAuth（ランダム文字列を生成して貼る）
NEXTAUTH_SECRET=（下記コマンドで生成）
NEXTAUTH_URL=http://localhost:3000

# PostgreSQL 接続文字列
DATABASE_URL="postgresql://user:password@localhost:5432/bukatsu_note"
```

**NEXTAUTH_SECRET の生成方法（PowerShell）:**
```powershell
[Convert]::ToBase64String((1..32 | % { [byte](Get-Random -Max 256) }))
```

**クラウドDBを使う場合（ローカルに PostgreSQL が不要）:**
- [Neon](https://neon.tech) — 無料枠あり、接続文字列をそのまま貼る
- [Supabase](https://supabase.com) — 無料枠あり

### Step 5: 初回コーチのメールアドレスを seed.ts に記入

`prisma/seed.ts` の 6 行目を実際の教員メールに変更:

```typescript
const coachEmail = 'tanaka@haguroko.ed.jp'  // ← 実際のアドレスに変更
```

> **注意:** これが InvitedUser テーブルへの最初のエントリになります。
> このメールアドレスでログインした人だけが最初に教員として入れます。

### Step 6: データベースを初期化

```powershell
# マイグレーション実行（テーブル作成）
npm run db:migrate

# 初期データ投入（コーチメールの招待 + サンプルスケジュール）
npm run db:seed
```

### Step 7: 起動確認

```powershell
npm run dev
```

ブラウザで `http://localhost:3000` を開く  
→ `/login` にリダイレクトされる  
→「@haguroko.ed.jp でログイン」ボタンをクリック  
→ seed したメールアドレスでログインすると教員ダッシュボードへ

---

## 残り作業・TODO

### 優先度：高（動作に必要）

- [ ] **`.env` に実際の値を設定する**（Step 4）
- [ ] **`prisma/seed.ts` のコーチメールを変更する**（Step 5）
- [ ] **DBマイグレーションを実行する**（Step 6）
- [ ] **ブラウザで動作確認**（ログイン → 招待 → 生徒ログイン → 日誌投稿 → 教員確認）

### 優先度：中（UX改善）

- [x] **モバイルメニュー**: `NavBar.tsx` にハンバーガーメニューを追加
- [x] **ローディングUI**: `coach/`・`coach/logs/`・`student/`・`board/` に `loading.tsx` を追加
- [x] **404ページ**: `src/app/not-found.tsx` を作成
- [x] **生徒の過去ログ詳細ページ**: `/student/logs/[id]` — 自分の日誌詳細確認画面（他生徒の日誌は 404）
- [ ] **教員のスケジュール管理**: NavBar にスケジュール管理へのリンクが追加済み（`/coach/schedule`）だが動作確認要

### 優先度：低（将来追加）

- [ ] **通知機能**: 新しいコーチコメントがついたら生徒にメール通知
- [ ] **カレンダービュー**: スケジュール画面のカレンダーUI（現在はリスト表示）
- [ ] **CSV出力**: 教員が日誌データを CSV でダウンロード
- [ ] **パスワードリセット**: 現在は Google OAuth のみのため不要だが、将来的に Email ログインを追加する場合
- [ ] **生徒の日誌編集**: 提出後に当日中のみ編集可能にする（現在は上書き保存で対応済み）

### 優先度：本番デプロイ前に必須

- [ ] **`NEXTAUTH_URL` を本番 URL に変更**
- [ ] **Google OAuth のリダイレクト URI に本番 URL を追加**
- [ ] **本番用 DB（接続文字列）を設定**
- [ ] **`npm run build` でビルドエラーがないか確認**

---

## 認証・ロール判定の仕様

### サインインフロー

```
Google OAuth 認証
    ↓
signIn コールバック（src/lib/auth.ts）
    ├─ ドメインチェック: @haguroko.ed.jp でなければ → false（エラー画面）
    ├─ ホワイトリストチェック: InvitedUser テーブルになければ → false（エラー画面）
    └─ OK → NextAuth が User / Account レコードを作成
         ↓
jwt コールバック（初回ログイン時）
    ├─ メールのローカルパートに数字があれば → STUDENT
    ├─ 数字がなければ → COACH
    └─ DB の User.role を更新 → token に userId / role を付与
         ↓
session コールバック
    └─ session.user.id / session.user.role として公開
```

### ロール判定例

| メール | ローカルパート | 判定 |
|---|---|---|
| `tanaka@haguroko.ed.jp` | `tanaka` | 数字なし → **COACH（教員）** |
| `sato2024@haguroko.ed.jp` | `sato2024` | 数字あり → **STUDENT（生徒）** |
| `2024001@haguroko.ed.jp` | `2024001` | 数字あり → **STUDENT（生徒）** |

### ルートガード（二重防御）

| 層 | 実装場所 | 動作 |
|---|---|---|
| Middleware | `middleware.ts` | `/coach/*` `/student/*` `/board/*` に JWT なしでアクセス → `/login` へリダイレクト |
| Layout (Server) | `(app)/coach/layout.tsx` など | ロール不一致 → `/error?error=AccessDenied` へリダイレクト |
| Server Action | `src/lib/actions/*.ts` | セッションなし・ロール不一致 → エラー返却 |

---

## データベーススキーマ概要

```
User ─────────────────────────────────────────────────────
  id, email, name, image, role(STUDENT|COACH), target, createdAt

InvitedUser（招待ホワイトリスト）─────────────────────────
  id, email(unique), invitedById → User.id, createdAt

Log（日誌）────────────────────────────────────────────────
  id, studentId → User.id, date, trainingContent, reflection,
  task, sleepTime, fatigue(1-5), injury(bool), mental(1-5),
  replyComment?, isShared(bool), createdAt

Schedule（スケジュール）───────────────────────────────────
  id, date, title, description?, createdAt

Account / Session / VerificationToken（NextAuth 管理）─────
  NextAuth Prisma Adapter が使用。直接操作は不要。
```

---

## 本番デプロイ手順（Vercel）

1. GitHub にリポジトリを作成してプッシュ（`.env` は Git 管理外なので注意）
2. [Vercel](https://vercel.com) でリポジトリをインポート
3. 環境変数を Vercel の Settings > Environment Variables に設定
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` ← `https://your-project.vercel.app`
   - `DATABASE_URL` ← 本番DBの接続文字列
4. Google Cloud Console のリダイレクト URI に `https://your-project.vercel.app/api/auth/callback/google` を追加
5. Vercel でデプロイ実行
6. デプロイ後に DB マイグレーション: `npx prisma migrate deploy`

---

## よくある問題

| 症状 | 原因 | 対処 |
|---|---|---|
| ログインしても `/error` に飛ぶ | InvitedUser にメールが未登録 | `npm run db:seed` を実行 or 教員が招待画面から追加 |
| `PrismaClientKnownRequestError` | DBに接続できていない | `DATABASE_URL` を確認 |
| `NEXTAUTH_SECRET` エラー | `.env` に値がない | 上記の生成コマンドで設定 |
| 生徒で教員画面に入ろうとすると `/error` | ミドルウェアが正常に動作している | 正常動作です |
| `npm install` でエラー | peer deps の不一致 | `--legacy-peer-deps` を付けて実行 |

---

## 現在の問題と対応状況（2026-06-03）

### 報告されたエラー

1. **404 NOT_FOUND エラー**
   - 現象: ログイン時に「404 NOT_FOUND」が表示される
   - 原因：NextAuth.js API ルート（`/api/auth/[...nextauth]/route.ts`）が見つからない
   - 状況：調査中

2. **ログイン時の Google OAuth エラー**
   - 現象: 「アクセスをブロック: bukatsu-note のリクエストは Google のポリシーに準拠していません」（エラー403: disallowed_useragent）
   - 原因：Google Cloud Console の OAuth 設定にあるリダイレクト URI とアプリケーション側の URL が一致していない
   - 対応済み：
     - ✅ Google Cloud Console に `https://note.vercel.app/api/auth/callback/google` を追加
     - ✅ Google Cloud Console に `https://bukatsu-note.vercel.app/api/auth/callback/google` も登録済み（デフォルト）
   - 未対応：両方の URI が Google OAuth に登録されているか確認が必要

3. **提出エラー（解決済み v0.1.4）**
   - 現象: 学生が日誌を提出しようとすると「Application error: a server-side exception has occurred」
   - 原因：`createLog` アクション内で `revalidatePath('/coach')` を呼び出していた（学生は `/coach` アクセス権限なし）
   - 対応：`/student` のみを再検証するように修正 → **デプロイ完了**

### Vercel 環境変数設定の問題

**問題：** `NEXTAUTH_URL` を Vercel ダッシュボードで `https://bukatsu-note.vercel.app` に設定しても、再度確認すると `https://example.com` にリセットされる

**原因調査済み：**
- ✅ GitHub Secrets には何も設定されていない（GitHub Workflow で上書きされていない）
- ✅ `.gitignore` で `.env` は除外されている（ファイル不具合でない）

**現在の対応：**
- Vercel CLI を使用して、ダッシュボード UI をバイパスして環境変数を設定中
  ```powershell
  vercel env add NEXTAUTH_URL production --value "https://bukatsu-note.vercel.app" --yes
  ```

### 次のステップ（明日以降）

1. **Vercel CLI での環境変数設定が完了したか確認**
   - Vercel ダッシュボードで `NEXTAUTH_URL` が正しく保存されているか確認
   - Vercel が自動的に再デプロイするのを待つ

2. **ドメイン URL の統一**
   - 現在 `note.vercel.app` と `bukatsu-note.vercel.app` の 2 つの URL が存在
   - どちらかに統一するか、両方対応するかを決定
   - Google Cloud Console での OAuth リダイレクト URI も統一が必要

3. **本番環境でのテスト**
   - ログインが成功するか確認（Google OAuth の 403 エラーが解消されたか）
   - 提出が正常に機能するか確認（v0.1.4 の修正が有効か）
   - 複数の生徒でテストして、特定の生徒だけに問題がないか確認

4. **Google Cloud Console での検証（Verification）状況確認**
   - OAuth consent screen の検証状況が「Verified」か「Unverified」か確認
   - 未検証の場合は、Google に申請（時間がかかる可能性）

### コミット履歴（本日）

- `v0.1.4`: Fix submission error - `revalidatePath('/coach')` 削除
- `v0.1.5`: Improve JWT callback - `upsert` 導入 + エラーログ追加
- `v0.1.6`: Fix domain URL - `vercel.json` から `NEXTAUTH_URL` 削除、`.env` 修正
