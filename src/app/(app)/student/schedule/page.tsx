import { prisma } from '@/lib/prisma'

export default async function SchedulePage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const schedules = await prisma.schedule.findMany({
    where: { date: { gte: today } },
    orderBy: { date: 'asc' },
    take: 30,
  })

  const past = await prisma.schedule.findMany({
    where: { date: { lt: today } },
    orderBy: { date: 'desc' },
    take: 10,
  })

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })

  const daysUntil = (d: Date) => {
    const diff = new Date(d).getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return '今日'
    if (days === 1) return '明日'
    return `${days}日後`
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">スケジュール</h1>

      {/* 直近のスケジュール */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-blue-50">
          <h2 className="font-semibold text-blue-900">今後の予定</h2>
        </div>
        {schedules.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">予定はありません</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {schedules.map((s) => {
              const remaining = daysUntil(s.date)
              const isToday = remaining === '今日'
              const isSoon = typeof remaining === 'string' && remaining.includes('日後') &&
                parseInt(remaining) <= 3

              return (
                <div
                  key={s.id}
                  className={`px-5 py-4 ${isToday ? 'bg-blue-50' : isSoon ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center shrink-0 w-16">
                      <p className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</p>
                      <p className={`text-xs font-bold mt-0.5 ${isToday ? 'text-blue-600' : isSoon ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {remaining}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{fmtDate(s.date)}</p>
                      {s.description && (
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{s.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 過去の予定 */}
      {past.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-500">過去の予定</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {past.map((s) => (
              <div key={s.id} className="px-5 py-3 opacity-60">
                <p className="text-sm font-medium text-gray-700">{s.title}</p>
                <p className="text-xs text-gray-400">{fmtDate(s.date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
