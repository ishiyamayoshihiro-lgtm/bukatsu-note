'use client'

import { useTransition } from 'react'
import { deleteSchedule } from '@/lib/actions/schedule.actions'

export function DeleteScheduleButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (!confirm('このスケジュールを削除しますか？')) return
        startTransition(() => deleteSchedule(id))
      }}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors shrink-0"
    >
      {isPending ? '削除中...' : '削除'}
    </button>
  )
}
