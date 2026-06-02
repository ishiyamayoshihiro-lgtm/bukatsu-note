'use client'

import { useFormState } from 'react-dom'
import { createSchedule, type ScheduleFormState } from '@/lib/actions/schedule.actions'
import { SubmitButton } from '@/components/shared/SubmitButton'

const initialState: ScheduleFormState = {}

export function ScheduleForm() {
  const [state, action] = useFormState(createSchedule, initialState)

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">日付</label>
          <input name="date" type="date" required className="input" />
        </div>
        <div>
          <label className="label">タイトル</label>
          <input name="title" type="text" required placeholder="春季大会 など" className="input" />
        </div>
      </div>
      <div>
        <label className="label">詳細・連絡事項 (任意)</label>
        <textarea
          name="description"
          rows={3}
          placeholder="集合場所・時間、持ち物など..."
          className="input resize-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">スケジュールを追加しました</p>}
      <SubmitButton label="追加する" pendingLabel="追加中..." className="btn-primary" />
    </form>
  )
}
