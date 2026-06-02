import { prisma } from '@/lib/prisma'
import { ScheduleForm } from '@/components/coach/ScheduleForm'
import { DeleteScheduleButton } from '@/components/coach/DeleteScheduleButton'

export default async function CoachSchedulePage() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { date: 'asc' },
    take: 50,
  })

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">スケジュール管理</h1>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">新しい予定を追加</h2>
        <ScheduleForm />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">登録済みスケジュール</h2>
        </div>
        {schedules.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">スケジュールはありません</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(s.date)}</p>
                  {s.description && (
                    <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                  )}
                </div>
                <DeleteScheduleButton id={s.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
