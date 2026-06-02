import { prisma } from '@/lib/prisma'
import { InviteForm } from '@/components/coach/InviteForm'
import { RevokeButton } from '@/components/coach/RevokeButton'
import { CopyUrlButton } from '@/components/coach/CopyUrlButton'

const APP_URL = 'https://bukatsu-note.vercel.app'

export default async function InvitePage() {
  const invited = await prisma.invitedUser.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invitedBy: { select: { name: true, email: true } },
    },
  })

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ユーザー招待・管理</h1>

      {/* 仕組みの説明 */}
      <div className="card bg-blue-50 border border-blue-200">
        <h2 className="font-semibold text-blue-900 mb-2">招待の仕組み</h2>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside mb-4">
          <li>招待してもメールは自動送信されません</li>
          <li>下のURLを生徒・スタッフに別途連絡してください（LINE・メールなど）</li>
          <li>アクセスしてきたとき、登録済みアドレスならログインできます</li>
        </ul>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
          <code className="text-sm text-gray-700 flex-1 break-all">{APP_URL}</code>
          <CopyUrlButton url={APP_URL} />
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">新しいユーザーを招待</h2>
        <p className="text-sm text-gray-500 mb-4">
          @haguroko.ed.jp のメールアドレスを入力してください。招待されたアカウントのみログインできます。
        </p>
        <InviteForm />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">招待済みユーザー ({invited.length}名)</h2>
        </div>
        {invited.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">招待済みのユーザーはいません</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {invited.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{inv.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    招待: {inv.invitedBy.name ?? inv.invitedBy.email} — {fmtDate(inv.createdAt)}
                  </p>
                </div>
                <RevokeButton email={inv.email} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
