import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentLogDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [log, fields] = await Promise.all([
    prisma.log.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        studentId: true,
        date: true,
        trainingContent: true,
        reflection: true,
        task: true,
        sleepTime: true,
        fatigue: true,
        injury: true,
        mental: true,
        logType: true,
        replyComment: true,
        isShared: true,
        customFields: true,
      },
    }),
    prisma.formField.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  // 存在しない or 他の生徒の日誌は 404
  if (!log || log.studentId !== session.user.id) notFound()

  const customFields = (log?.customFields ?? {}) as Record<string, string>
  const fieldMap = new Map(fields.map(f => [f.id, f]))

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })

  const mentalColor = log.mental <= 2 ? 'text-red-600' : log.mental <= 3 ? 'text-yellow-600' : 'text-green-600'
  const fatigueColor = log.fatigue >= 4 ? 'text-red-600' : log.fatigue >= 3 ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/student" className="text-sm text-blue-600 hover:underline">
          ← ダッシュボードに戻る
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="card">
        <h1 className="text-xl font-bold text-gray-900">日誌の詳細</h1>
        <p className="text-sm text-gray-500 mt-1">{fmtDate(log.date)}</p>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">睡眠</span>
            <span className="font-semibold">{log.sleepTime}h</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">疲労</span>
            <span className={`font-semibold ${fatigueColor}`}>{log.fatigue}/5</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">メンタル</span>
            <span className={`font-semibold ${mentalColor}`}>{log.mental}/5</span>
          </div>
          {log.injury && <span className="badge-alert">怪我あり</span>}
          {log.isShared && <span className="badge-ok">優秀ノート</span>}
        </div>
      </div>

      {/* 本文 */}
      <div className="space-y-4">
        {log.trainingContent && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">練習内容</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.trainingContent}</p>
          </div>
        )}
        {log.reflection && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">反省</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.reflection}</p>
          </div>
        )}
        {log.task && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">課題</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.task}</p>
          </div>
        )}

        {/* カスタムフィールド */}
        {Object.entries(customFields).map(([fieldId, value]) => {
          const field = fieldMap.get(fieldId)
          if (!field || !value) return null
          return (
            <div key={fieldId} className="card">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">{field.label}</h2>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{value}</p>
            </div>
          )
        })}
      </div>

      {/* コーチコメント */}
      {log.replyComment && (
        <div className="card border-l-4 border-l-blue-400">
          <h2 className="text-sm font-semibold text-blue-700 mb-2">コーチからのコメント</h2>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{log.replyComment}</p>
        </div>
      )}
    </div>
  )
}
