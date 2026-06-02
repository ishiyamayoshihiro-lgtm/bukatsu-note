'use client'

import { useTransition, useState } from 'react'
import { syncSubmissionStatus } from '@/lib/actions/submission.actions'

export default function SyncSubmissionButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleClick = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await syncSubmissionStatus()
      if (result.success) {
        setMessage({ type: 'success', text: result.message || '同期しました' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || '同期に失敗しました' })
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        {isPending ? '同期中...' : '提出状況を同期'}
      </button>
      {message && (
        <span
          className={`text-xs font-medium ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.text}
        </span>
      )}
    </div>
  )
}
