# 部活ノート — 開発ガイド

## 作業場所について

**必ず `C:\bukatsu-note` にコピーしてから作業すること。**

Googleドライブ上では `node_modules` の読み書きが遅く、サーバ起動やビルドが正常に動作しない。

---

## 作業開始時

Googleドライブから `C:\bukatsu-note` にコピーする（`node_modules`・`.next` は除外）:

```powershell
robocopy "G:\マイドライブ\DB\App\部活ノート" "C:\bukatsu-note" /E /XD node_modules .next .git /XF "*.log" /NFL /NDL /NJS
```

その後、依存パッケージをインストールしてサーバを起動:

```powershell
cd C:\bukatsu-note
npm install
npm run dev
```

---

## 作業終了時

`C:\bukatsu-note` からGoogleドライブに必ずコピーして保存する（`node_modules`・`.next` は除外）:

```powershell
robocopy "C:\bukatsu-note" "G:\マイドライブ\DB\App\部活ノート" /E /XD node_modules .next .git /XF "*.log" /NFL /NDL /NJS
```

---

## プロジェクト概要

- **フレームワーク**: Next.js 14 (App Router)
- **DB**: PostgreSQL (Neon) + Prisma ORM
- **認証**: NextAuth.js (Google OAuth)
- **スタイル**: Tailwind CSS

### ロール

| ロール | 説明 | アクセス先 |
|--------|------|-----------|
| STAFF | 顧問・教員 | `/coach/*` |
| MANAGER | マネージャ | `/manager/*` |
| MEMBER | 部員 | `/student/*` |

### ログイン要件

- `@haguroko.ed.jp` のメールアドレス
- STAFFによる招待（`InvitedUser` テーブルに登録済み）
- ロールはメールアドレスで自動判定（数字を含む → MEMBER、含まない → STAFF）

---

## DB操作

```powershell
cd C:\bukatsu-note
npx prisma studio        # DB閲覧
npx prisma db push       # スキーマ反映
npx prisma generate      # クライアント再生成
```
