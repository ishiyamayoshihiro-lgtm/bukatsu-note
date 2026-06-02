import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LogForm } from '@/components/student/LogForm'
import { TargetEditor } from '@/components/student/TargetEditor'
import Link from 'next/link'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [user, todayLog, recentLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { target: true, name: true },
    }),
    prisma.log.findFirst({
      where: { studentId: session.user.id, date: today },
    }),
    prisma.log.findMany({
      where: { studentId: session.user.id },
      orderBy: { date: 'desc' },
      take: 7,
    }),
  ])

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })

  const todayStr = today.toISOString().split('T')[0]

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

      {/* 目標 */}
      <TargetEditor currentTarget={user?.target ?? null} />

      {/* 今日の提出状態 */}
      {todayLog ? (
        <div className="card border-l-4 border-l-green-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-500">✓</span>
            <h2 className="font-semibold text-green-800">本日の日誌は提出済みです</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>睡眠 {todayLog.sleepTime}h</span>
            <span>疲労 {todayLog.fatigue}/5</span>
            <span>メンタル {todayLog.mental}/5</span>
            {todayLog.injury && <span className="badge-alert">怪我あり</span>}
          </div>
          {todayLog.replyComment && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-500 mb-1">コーチからのコメント</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{todayLog.replyComment}</p>
            </div>
          )}
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
        <LogForm defaultDate={todayStr} defaultValues={todayLog ?? undefined} />
      </div>

      {/* 直近7日の履歴 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">最近の日誌</h2>
          <Link href="/board" className="text-sm text-blue-600 hover:underline">掲示板 →</Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">日誌はまだありません</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Link key={log.id} href={`/student/logs/${log.id}`} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-1 transition-colors">
                <span className="text-xs text-gray-500 w-20 shrink-0">{fmtDate(log.date)}</span>
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-500">疲労{log.fatigue}</span>
                  <span className="text-gray-500">M{log.mental}</span>
                  {log.injury && <span className="badge-alert">怪我</span>}
                  {log.replyComment && <span className="badge-ok">返信あり</span>}
                </div>
                <p className="text-xs text-gray-600 flex-1 truncate">{log.trainingContent}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
