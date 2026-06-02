import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role, Prisma } from '@prisma/client'
import { BoardSearch } from '@/components/shared/BoardSearch'

type SearchParams = { q?: string; from?: string; to?: string; page?: string }
const PAGE_SIZE = 20

export default async function BoardPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const isCoach = session.user.role === Role.STAFF || session.user.role === Role.MANAGER
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const skip = (page - 1) * PAGE_SIZE

  // --- ログ検索条件 ---
  const logWhere: Prisma.LogWhereInput = {
    isShared: true,
  }
  if (!isCoach) logWhere.studentId = session.user.id
  if (searchParams.q) {
    logWhere.OR = [
      { trainingContent: { contains: searchParams.q, mode: 'insensitive' } },
      { reflection: { contains: searchParams.q, mode: 'insensitive' } },
      { task: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }
  if (searchParams.from) logWhere.date = { gte: new Date(searchParams.from) }
  if (searchParams.to) {
    logWhere.date = { ...(logWhere.date as object), lte: new Date(searchParams.to) }
  }

  const [sharedLogs, logTotal, schedules] = await Promise.all([
    prisma.log.findMany({
      where: logWhere,
      include: { student: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.log.count({ where: logWhere }),
    prisma.schedule.findMany({
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ])

  const totalPages = Math.ceil(logTotal / PAGE_SIZE)

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">チーム掲示板</h1>

      {/* スケジュール (最新5件) */}
      {schedules.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">📅 最近の連絡・スケジュール</h2>
          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs text-gray-400 shrink-0 w-20">{fmtDate(s.date)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  {s.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 検索フォーム */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">
          {isCoach ? '★ 優秀ノート検索（全生徒）' : '★ 優秀ノート / 過去ログ検索'}
        </h2>
        <BoardSearch searchParams={searchParams} />
      </div>

      {/* 優秀ノート一覧 */}
      <div className="space-y-4">
        <p className="text-sm text-gray-500">{logTotal} 件</p>
        {sharedLogs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">該当するノートがありません</p>
          </div>
        ) : (
          sharedLogs.map((log) => (
            <div key={log.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 font-bold">★</span>
                    <span className="font-semibold text-gray-900">
                      {isCoach ? (log.student.name ?? '不明') : '自分のノート'}
                    </span>
                    <span className="text-xs text-gray-400">{fmtDate(log.date)}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-gray-500">睡眠 {log.sleepTime}h</span>
                    <span className="text-xs text-gray-500">疲労 {log.fatigue}/5</span>
                    <span className="text-xs text-gray-500">メンタル {log.mental}/5</span>
                    {log.injury && <span className="badge-alert text-xs">怪我</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="text-xs font-semibold text-gray-400">練習内容: </span>
                  <span className="whitespace-pre-wrap">{log.trainingContent}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400">反省: </span>
                  <span className="whitespace-pre-wrap">{log.reflection}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400">課題: </span>
                  <span className="whitespace-pre-wrap">{log.task}</span>
                </div>
              </div>
              {log.replyComment && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-500 mb-1">コーチコメント</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{log.replyComment}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams({
              ...(searchParams.q ? { q: searchParams.q } : {}),
              ...(searchParams.from ? { from: searchParams.from } : {}),
              ...(searchParams.to ? { to: searchParams.to } : {}),
              page: String(p),
            })
            return (
              <a
                key={p}
                href={`/board?${params}`}
                className={`px-3 py-1 rounded text-sm ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
