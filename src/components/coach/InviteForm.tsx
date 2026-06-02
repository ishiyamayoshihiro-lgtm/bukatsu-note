'use client'

import { useFormState } from 'react-dom'
import { inviteUser, type InviteFormState } from '@/lib/actions/invite.actions'
import { SubmitButton } from '@/components/shared/SubmitButton'

const initialState: InviteFormState = {}

export function InviteForm() {
  const [state, action] = useFormState(inviteUser, initialState)

  return (
    <form action={action} className="space-y-3">
      <div className="flex gap-3">
        <input
          name="email"
          type="email"
          placeholder="student01@haguroko.ed.jp"
          required
          className="input flex-1"
        />
        <SubmitButton label="招待する" pendingLabel="招待中..." className="btn-primary shrink-0" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">招待しました</p>}
    </form>
  )
}
