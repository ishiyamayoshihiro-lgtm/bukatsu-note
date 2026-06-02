'use client'

import { useTransition } from 'react'
import { revokeInvite } from '@/lib/actions/invite.actions'

export function RevokeButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()

  const handleRevoke = () => {
    if (!confirm(`${email} の招待を取り消しますか？\nすでにログイン済みの場合、次回ログイン時からアクセスできなくなります。`)) return
    startTransition(() => revokeInvite(email))
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors"
    >
      {isPending ? '取消中...' : '招待取消'}
    </button>
  )
}
