import Link from 'next/link'
import { SignOutButton } from '@/components/auth/SignOutButton'

type SearchParams = { error?: string }

export default function AuthErrorPage({ searchParams }: { searchParams: SearchParams }) {
  const error = searchParams?.error

  const isAccessDenied =
    error === 'AccessDenied' ||
    error === 'Callback' ||
    error === 'OAuthCallback'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">アクセスが拒否されました</h1>
        </div>

        {isAccessDenied ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-red-800 font-medium mb-2">このアカウントは許可されていません</p>
            <p className="text-xs text-red-700">
              以下のいずれかの理由が考えられます：
            </p>
            <ul className="text-xs text-red-700 mt-2 space-y-1 list-disc list-inside">
              <li>@haguroko.ed.jp 以外のメールアドレスでログインしようとした</li>
              <li>顧問の先生からの招待が完了していない</li>
            </ul>
            <p className="text-xs text-red-700 mt-3 font-medium">
              顧問の先生に招待を依頼してください。
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-yellow-800">
              ログイン中にエラーが発生しました。再度お試しください。
            </p>
            {error && (
              <p className="text-xs text-yellow-600 mt-2">エラーコード: {error}</p>
            )}
          </div>
        )}

        <Link
          href="/login"
          className="btn-primary w-full justify-center"
        >
          ログイン画面に戻る
        </Link>
        <SignOutButton />
      </div>
    </div>
  )
}
