import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import Link from 'next/link'
import SyncSubmissionButton from '@/components/coach/SyncSubmissionButton'

function toJST(date: Date) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
}

export default async function CoachDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const today = new Date()
  const todayJST = toJST(today)
  todayJST.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date(todayJST)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [allStudents, todayLogs, alertLogs, recentLogs] = await Promise.all([
    prisma.user.findMany({ where: { role: Role.MEMBER }, orderBy: { name: 'asc' } }),
    prisma.log.findMany({
      where: { date: todayJST },
      select: { studentId: true },
    }),
    prisma.log.findMany({
      where: {
        OR: [{ injury: true }, { mental: { lte: 3 } }],
        date: { gte: sevenDaysAgo },
      },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { date: 'desc' },
      take: 20,
    }),
    prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { student: { select: { id: true, name: true } } },
    }),
  ])

  const submittedIds = new Set(todayLogs.map((l) => l.studentId))
  const unsubmitted = allStudents.filter((s) => !submittedIds.has(s.id))

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">教員ダッシュボード</h1>
        <div className="flex items-center gap-4">
          <SyncSubmissionButton />
          <p className="text-sm text-gray-500">
            {todayJST.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
      </div>

      {/* アラートパネル */}
      {(unsubmitted.length > 0 || alertLogs.length > 0) && (
        <div className="space-y-4">
          {/* 未提出 */}
          {unsubmitted.length > 0 && (
            <div className="card border-l-4 border-l-orange-400">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-500">⚠</span>
                <h2 className="font-semibold text-gray-900">本日の日誌 未提出 ({unsubmitted.length}名)</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {unsubmitted.map((s) => (
                  <span key={s.id} className="badge-warn">{s.name ?? s.email}</span>
                ))}
              </div>
            </div>
          )}

          {/* メンタル・怪我アラート */}
          {alertLogs.length > 0 && (
            <div className="card border-l-4 border-l-red-400">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-500">🚨</span>
                <h2 className="font-semibold text-gray-900">
                  要注意 — 怪我あり / メンタル3以下 (直近7日)
                </h2>
              </div>
              <div className="space-y-2">
                {alertLogs.map((log) => (
                  <Link
                    key={log.id}
                    href={`/coach/logs/${log.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 w-24 truncate">
                      {log.student.name ?? log.student.email}
                    </span>
                    <span className="text-xs text-gray-500">{fmtDate(log.date)}</span>
                    <div className="flex gap-2 ml-auto">
                      {log.injury && <span className="badge-alert">怪我</span>}
                      {log.mental <= 3 && (
                        <span className="badge-alert">メンタル {log.mental}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 概要カード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{allStudents.length}</p>
          <p className="text-sm text-gray-500 mt-1">生徒数</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{submittedIds.size}</p>
          <p className="text-sm text-gray-500 mt-1">本日提出</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-orange-600">{unsubmitted.length}</p>
          <p className="text-sm text-gray-500 mt-1">本日未提出</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{alertLogs.length}</p>
          <p className="text-sm text-gray-500 mt-1">要注意(7日)</p>
        </div>
      </div>

      {/* 最近の日誌 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">最近の提出日誌</h2>
          <Link href="/coach/logs" className="text-sm text-blue-600 hover:underline">
            すべて見る →
          </Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">日誌はまだありません</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Link
                key={log.id}
                href={`/coach/logs/${log.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <span className="text-sm font-medium text-gray-900 w-24 truncate">
                  {log.student.name}
                </span>
                <span className="text-xs text-gray-500">{fmtDate(log.date)}</span>
                <p className="text-sm text-gray-600 flex-1 truncate">{log.trainingContent}</p>
                <div className="flex gap-1 shrink-0">
                  {log.injury && <span className="badge-alert text-xs">怪我</span>}
                  {log.mental <= 3 && <span className="badge-warn text-xs">M{log.mental}</span>}
                  {log.isShared && <span className="badge-ok text-xs">★共有</span>}
                  {log.replyComment && <span className="badge-ok text-xs">返信済</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
