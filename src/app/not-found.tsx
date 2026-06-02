import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="text-xl font-semibold text-gray-700">ページが見つかりません</h1>
        <p className="text-sm text-gray-500">お探しのページは存在しないか、移動した可能性があります。</p>
        <Link
          href="/"
          className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  )
}
