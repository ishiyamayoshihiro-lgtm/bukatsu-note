import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-3">
      <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </div>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
      <div className="text-sm text-gray-600 space-y-1">{children}</div>
    </div>
  )
}

export default async function HelpPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user.role
  const isStaff = role === Role.STAFF

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">使い方ガイド</h1>

      {/* ログイン */}
      <Section title="ログイン方法">
        <Item label="初回ログイン">
          <p>顧問の先生からURLが届いたら、ブラウザで開いてください。</p>
          <p>「Googleでログイン」ボタンを押して、学校のGoogleアカウント（@haguroko.ed.jp）でログインします。</p>
        </Item>
        <Item label="2回目以降">
          <p>同じURLにアクセスして「Googleでログイン」を押すだけです。</p>
        </Item>
        <Item label="ログインできない場合">
          <p>顧問の先生に招待してもらっているか確認してください。招待されていないとログインできません。</p>
        </Item>
      </Section>

      {/* 部員向け（MEMBER・全員共通） */}
      {(role === Role.MEMBER || isStaff) && (
        <Section title="部員向け機能">
          <Item label="ダッシュボード（トップページ）">
            <p>今日の日誌の提出状況と、顧問からのコメントが確認できます。</p>
            <p>個人目標の設定・編集もここから行います。</p>
          </Item>
          <Item label="日誌の書き方">
            <p>ダッシュボードのフォームから毎日の練習内容・反省・課題・体調を記録します。</p>
            <p>同じ日に再提出すると上書き保存されます。</p>
          </Item>
          <Item label="スケジュール確認">
            <p>ナビバーの「スケジュール」から大会・練習試合などの予定を確認できます。</p>
          </Item>
          <Item label="掲示板">
            <p>顧問が「優秀ノート」に選んだ日誌がタイムライン形式で表示されます。</p>
            <p>キーワードや日付で過去の自分のノートを検索することもできます。</p>
          </Item>
        </Section>
      )}

      {/* マネージャ向け */}
      {(role === Role.MANAGER || isStaff) && (
        <Section title="マネージャ向け機能">
          <Item label="日誌（練習・遠征の記録）">
            <p>ナビバーの「ダッシュボード」から毎日の練習・遠征の記録を入力します。</p>
            <p>練習日誌では「練習観察メモ」「気づき・改善提案」「明日への申し送り」などを記録できます。</p>
            <p>遠征・大会では「遠征・試合の記録」「サポート内容・反省」「次回への申し送り」などを記録できます。</p>
            <p>同じ日に再提出すると上書き保存されます。</p>
            <p>記入内容は顧問の日誌一覧に表示され、確認・コメント返信できます。</p>
          </Item>
          <Item label="練習メニューの登録">
            <p>ナビバーの「練習メニュー」から日付を指定してメニューを登録できます。</p>
            <p>登録したメニューは掲示板のスケジュール欄に反映されます。</p>
          </Item>
          <Item label="日誌フォームのカスタマイズ（顧問のみ）">
            <p>「設定」ページの「日誌フォームの項目」で「マネージャ用」タブを開くと、マネージャ用の入力項目を管理できます。</p>
            <p>練習用・遠征・大会用それぞれで異なる項目を設定できます。</p>
          </Item>
        </Section>
      )}

      {/* 顧問向け（管理者のみ） */}
      {isStaff && (
        <Section title="顧問向け機能（管理者のみ）">
          <Item label="ユーザー招待・管理">
            <p>「招待管理」ページでメールアドレスを登録することでログインを許可できます。</p>
            <p>メールは自動送信されません。URLを別途生徒に連絡してください。</p>
            <p>招待ページのURLコピーボタンを使うと便利です。</p>
          </Item>
          <Item label="日誌の確認・コメント返信">
            <p>「日誌一覧」から全生徒の日誌を確認できます。キーワード・生徒名・日付範囲で絞り込み可能です。</p>
            <p>日誌詳細ページのコメント欄から返信できます。スタンプ（定型文）を使うと素早く返信できます。</p>
          </Item>
          <Item label="優秀ノート設定">
            <p>日誌詳細ページの「優秀ノートに設定」トグルをONにすると掲示板に表示されます。</p>
          </Item>
          <Item label="スケジュール管理">
            <p>「スケジュール」ページから大会・練習試合などの予定を追加・削除できます。</p>
            <p>登録した予定は掲示板と生徒のスケジュールページに表示されます。</p>
          </Item>
          <Item label="フォーム・スタンプの設定">
            <p>「設定」ページで日誌フォームの項目の表示/非表示を切り替えられます。</p>
            <p>返信時に使うスタンプ（定型文）の追加・編集もここから行います。</p>
          </Item>
          <Item label="CSVダウンロード">
            <p>日誌一覧ページの「CSVダウンロード」から全生徒の日誌データをExcel用CSVで取得できます。</p>
          </Item>
          <Item label="ロール変更">
            <p>招待管理ページの一覧から、各ユーザーのロール（部員・マネージャ・顧問）を変更できます。</p>
          </Item>
        </Section>
      )}
    </div>
  )
}
