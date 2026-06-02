import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RestoreForm } from '@/components/coach/RestoreForm'
import Link from 'next/link'

export default async function BackupPage() {
  const session = await getServerSession(authOptions)
  const apiKey = process.env.BACKUP_API_KEY

  const exportUrl = apiKey ? `/api/backup/export?key=${apiKey}` : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">バックアップ・復旧</h1>

      {/* 情報パネル */}
      <div className="card border-l-4 border-l-blue-400">
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>自動バックアップ:</strong> GAS スクリプトが毎日深夜 2:00 に実行し、
            Googleドライブのバックアップフォルダに保存します。
          </p>
          <p>
            <strong>保持期間:</strong> 最新 30 個のバックアップファイルを保持します。
          </p>
          <p className="text-red-700">
            <strong>⚠️ 注意:</strong> 復旧を実行すると、既存のすべてのデータが削除されます。
            実行前に必ず確認してください。
          </p>
        </div>
      </div>

      {/* 手動エクスポート */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📥 手動バックアップ</h2>
        <p className="text-sm text-gray-600 mb-4">現在のデータベースをJSONファイルとしてダウンロードします。</p>
        {exportUrl ? (
          <a
            href={exportUrl}
            download={`bukatsu_backup_${new Date().toISOString().split('T')[0]}.json`}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            📥 JSONをダウンロード
          </a>
        ) : (
          <p className="text-sm text-red-600">⚠️ バックアップAPIキーが設定されていません</p>
        )}
      </div>

      {/* データ復旧 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔄 データ復旧</h2>
        <p className="text-sm text-gray-600 mb-6">
          Googleドライブから保存したバックアップファイルを選択して復旧します。
        </p>
        <RestoreForm />
      </div>

      {/* バックアップの使用方法 */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">📖 GAS自動バックアップの設定方法</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Apps Script
            </a>
            で新規プロジェクトを作成
          </li>
          <li>以下のスクリプトを貼り付け: <code className="text-xs bg-gray-100 px-1">gas/backup.gs</code></li>
          <li>
            スクリプトプロパティに以下を設定:
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
              <li><code className="text-xs bg-gray-100 px-1">BACKUP_API_URL</code>: https://bukatsu-note.vercel.app/api/backup/export</li>
              <li><code className="text-xs bg-gray-100 px-1">BACKUP_API_KEY</code>: 管理者から提供されたキー</li>
              <li><code className="text-xs bg-gray-100 px-1">DRIVE_FOLDER_ID</code>: Googleドライブのバックアップ先フォルダID</li>
            </ul>
          </li>
          <li>時間ベーストリガーで <code className="text-xs bg-gray-100 px-1">dailyBackup</code> を毎日 2:00 に実行するよう設定</li>
        </ol>
      </div>
    </div>
  )
}
