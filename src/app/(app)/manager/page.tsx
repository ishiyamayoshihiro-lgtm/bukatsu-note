import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ManagerLogForm } from '@/components/manager/ManagerLogForm'
import { ensureManagerBaseFields } from '@/lib/fieldDefaults'
import Link from 'next/link'

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await ensureManagerBaseFields()

  const [user, todayLog, recentLogs, practiceFields, expeditionFields] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
    prisma.log.findFirst({
      where: {
        studentId: session.user.id,
        date: today,
        logType: { in: ['manager_practice', 'manager_expedition'] },
      },
    }),
    prisma.log.findMany({
      where: {
        studentId: session.user.id,
        logType: { in: ['manager_practice', 'manager_expedition'] },
      },
      orderBy: { date: 'desc' },
      take: 7,
    }),
    prisma.formField.findMany({
      where: { group: 'manager_practice', isVisible: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.formField.findMany({
      where: { group: 'manager_expedition', isVisible: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })

  const todayStr = today.toISOString().split('T')[0]

  const LOG_TYPE_LABELS: Record<string, string> = {
    manager_practice: '練習',
    manager_expedition: '遠征・大会',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {session.user.name ?? ''}さんのダッシュボード
        </h1>
        <p className="text-sm text-gray-500">
          {today.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
      </div>

      {/* 今日の提出状態 */}
      {todayLog ? (
        <div className="card border-l-4 border-l-green-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-500">✓</span>
            <h2 className="font-semibold text-green-800">本日の日誌は提出済みです</h2>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{LOG_TYPE_LABELS[todayLog.logType] ?? todayLog.logType}</span>
          </p>
        </div>
      ) : (
        <div className="card border-l-4 border-l-orange-400">
          <p className="text-sm font-medium text-orange-700">本日の日誌がまだ提出されていません</p>
        </div>
      )}

      {/* 日誌入力フォーム */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">
          {todayLog ? '本日の日誌を更新' : '本日の日誌を提出'}
        </h2>
        <ManagerLogForm
          defaultDate={todayStr}
          practiceFields={practiceFields}
          expeditionFields={expeditionFields}
        />
      </div>

      {/* 過去ログ */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">最近の日誌</h2>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">日誌はまだありません</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Link
                key={log.id}
                href={`/manager/logs/${log.id}`}
                className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-1 transition-colors"
              >
                <span className="text-xs text-gray-500 w-20 shrink-0">{fmtDate(log.date)}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    log.logType === 'manager_expedition'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {LOG_TYPE_LABELS[log.logType] ?? log.logType}
                </span>
                <p className="text-xs text-gray-600 flex-1 truncate">{log.trainingContent}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
