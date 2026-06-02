'use client'

import { useTransition } from 'react'
import { toggleShared } from '@/lib/actions/log.actions'

export function SharedToggle({ logId, isShared }: { logId: string; isShared: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleShared(logId, !isShared))}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
        isShared
          ? 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200'
          : 'bg-white text-gray-600 border-gray-300 hover:bg-yellow-50 hover:border-yellow-300'
      }`}
    >
      <span>{isShared ? '★' : '☆'}</span>
      {isShared ? '優秀ノート共有中' : '優秀ノートに設定'}
    </button>
  )
}
