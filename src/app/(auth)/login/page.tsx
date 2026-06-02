import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { LoginButton } from '@/components/auth/LoginButton'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === Role.STAFF) redirect('/coach')
    if (session.user.role === Role.MANAGER) redirect('/manager/menu')
    redirect('/student')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">部活ノート</h1>
          <p className="text-gray-500 text-sm">部活動日誌・管理システム</p>
        </div>

        <div className="mb-8 p-4 bg-blue-50 rounded-xl text-left">
          <p className="text-sm text-blue-800 font-medium mb-1">ログイン要件</p>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>@haguroko.ed.jp のメールアドレス</li>
            <li>顧問の先生から招待を受けていること</li>
          </ul>
        </div>

        <LoginButton />

        <p className="mt-6 text-xs text-gray-400">
          ログインに問題がある場合は顧問の先生にご連絡ください
        </p>
      </div>
    </div>
  )
}
