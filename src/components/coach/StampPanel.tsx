'use client'

import { useTransition } from 'react'
import { toggleLogStamp } from '@/lib/actions/settings.actions'

interface Stamp {
  id: string
  label: string
}

interface Props {
  logId: string
  availableStamps: Stamp[]
  appliedStampIds: string[]
}

export function StampPanel({ logId, availableStamps, appliedStampIds }: Props) {
  const [isPending, startTransition] = useTransition()

  if (availableStamps.length === 0) return null

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">スタンプ</h2>
      <div className="flex flex-wrap gap-2">
        {availableStamps.map((stamp) => {
          const applied = appliedStampIds.includes(stamp.id)
          return (
            <button
              key={stamp.id}
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => toggleLogStamp(logId, stamp.id))}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                applied
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800 font-medium shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-300 hover:bg-yellow-50'
              }`}
            >
              {stamp.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
