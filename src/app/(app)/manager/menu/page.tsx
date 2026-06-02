import { prisma } from '@/lib/prisma'
import { PracticeMenuForm } from '@/components/manager/PracticeMenuForm'
import { todayJST } from '@/lib/date'

export default async function ManagerMenuPage() {
  const today = todayJST()
  const todayStr = today.toISOString().split('T')[0]

  const [todayMenu, recentMenus] = await Promise.all([
    prisma.practiceMenu.findUnique({ where: { date: today } }),
    prisma.practiceMenu.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ])

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">練習メニュー登録</h1>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">
          {todayMenu ? '本日のメニューを編集' : '本日のメニューを登録'}
        </h2>
        <PracticeMenuForm defaultDate={todayStr} defaultContent={todayMenu?.content} />
      </div>

      {recentMenus.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">過去の練習メニュー</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMenus.map((m) => (
              <div key={m.id} className="px-5 py-4">
                <p className="text-sm font-medium text-gray-700">{fmtDate(m.date)}</p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap line-clamp-3">{m.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
