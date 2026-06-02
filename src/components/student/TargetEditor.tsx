'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { updateTarget, type LogFormState } from '@/lib/actions/log.actions'
import { SubmitButton } from '@/components/shared/SubmitButton'

const initialState: LogFormState = {}

export function TargetEditor({ currentTarget }: { currentTarget: string | null }) {
  const [editing, setEditing] = useState(false)
  const [state, action] = useFormState(updateTarget, initialState)

  if (!editing) {
    return (
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">個人目標</p>
            {currentTarget ? (
              <p className="text-base text-gray-900">{currentTarget}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">目標が設定されていません</p>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:underline shrink-0 ml-4"
          >
            {currentTarget ? '編集' : '設定する'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">個人目標を設定</p>
      <form
        action={async (fd) => {
          await action(fd)
          setEditing(false)
        }}
        className="space-y-3"
      >
        <textarea
          name="target"
          rows={3}
          defaultValue={currentTarget ?? ''}
          placeholder="今シーズンの目標を入力してください..."
          maxLength={500}
          className="input resize-none"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <SubmitButton label="保存" pendingLabel="保存中..." className="btn-primary" />
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
