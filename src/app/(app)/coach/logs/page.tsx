import { prisma } from '@/lib/prisma'
import { Role, Prisma } from '@prisma/client'
import Link from 'next/link'
import { toggleShared } from '@/lib/actions/log.actions'
import { LogSearchForm } from '@/components/coach/LogSearchForm'

type SearchParams = {
  q?: string
  studentId?: string
  from?: string
  to?: string
  page?: string
}

const PAGE_SIZE = 20

export default async function CoachLogsPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const skip = (page - 1) * PAGE_SIZE

  const students = await prisma.user.findMany({
    where: { role: Role.MEMBER },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  const where: Prisma.LogWhereInput = {}
  if (searchParams.q) {
    where.OR = [
      { trainingContent: { contains: searchParams.q, mode: 'insensitive' } },
      { reflection: { contains: searchParams.q, mode: 'insensitive' } },
      { task: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }
  if (searchParams.studentId) where.studentId = searchParams.studentId
  if (searchParams.from) where.date = { gte: new Date(searchParams.from) }
  if (searchParams.to) {
    where.date = { ...(where.date as object), lte: new Date(searchParams.to) }
  }

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { date: 'desc' },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.log.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">日誌一覧</h1>

      <LogSearchForm students={students} searchParams={searchParams} />

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{total} 件</p>
        </div>
        {logs.length === 0 ? (
          <p className="text-center py-12 text-gray-400">該当する日誌がありません</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {log.student.name ?? log.student.email}
                    </span>
                    <span className="text-xs text-gray-400">{fmtDate(log.date)}</span>
                    {log.injury && <span className="badge-alert text-xs">怪我</span>}
                    {log.mental <= 3 && <span className="badge-alert text-xs">メンタル{log.mental}</span>}
                    {log.replyComment && <span className="badge-ok text-xs">返信済</span>}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{log.trainingContent}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <form
                    action={async () => {
                      'use server'
                      await toggleShared(log.id, !log.isShared)
                    }}
                  >
                    <button
                      type="submit"
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        log.isShared
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-yellow-50'
                      }`}
                    >
                      {log.isShared ? '★ 共有中' : '☆ 優秀ノート'}
                    </button>
                  </form>
                  <Link
                    href={`/coach/logs/${log.id}`}
                    className="text-xs btn-secondary py-1"
                  >
                    詳細・返信
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams({
              ...(searchParams.q ? { q: searchParams.q } : {}),
              ...(searchParams.studentId ? { studentId: searchParams.studentId } : {}),
              ...(searchParams.from ? { from: searchParams.from } : {}),
              ...(searchParams.to ? { to: searchParams.to } : {}),
              page: String(p),
            })
            return (
              <Link
                key={p}
                href={`/coach/logs?${params}`}
                className={`px-3 py-1 rounded text-sm ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
