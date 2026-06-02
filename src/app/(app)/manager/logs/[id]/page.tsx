import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const LOG_TYPE_LABELS: Record<string, string> = {
  manager_practice: '練習',
  manager_expedition: '遠征・大会',
}

export default async function ManagerLogDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [log, fields] = await Promise.all([
    prisma.log.findUnique({
      where: { id: params.id },
    }),
    prisma.formField.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!log || log.studentId !== session.user.id) notFound()

  const customFields = (log.customFields ?? {}) as Record<string, string>
  const fieldMap = new Map(fields.map(f => [f.id, f]))

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/manager" className="text-sm text-blue-600 hover:underline">
          ← ダッシュボードに戻る
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="card">
        <h1 className="text-xl font-bold text-gray-900">日誌の詳細</h1>
        <p className="text-sm text-gray-500 mt-1">{fmtDate(log.date)}</p>
        <div className="mt-3">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              log.logType === 'manager_expedition'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {LOG_TYPE_LABELS[log.logType] ?? log.logType}
          </span>
        </div>
      </div>

      {/* 本文 */}
      <div className="space-y-4">
        {log.trainingContent && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              {log.logType === 'manager_expedition' ? '遠征・試合の記録' : '練習観察メモ'}
            </h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.trainingContent}</p>
          </div>
        )}
        {log.reflection && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              {log.logType === 'manager_expedition' ? 'サポート内容・反省' : '気づき・改善提案'}
            </h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.reflection}</p>
          </div>
        )}
        {log.task && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              {log.logType === 'manager_expedition' ? '次回への申し送り' : '明日への申し送り'}
            </h2>
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
    </div>
  )
}
