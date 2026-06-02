'use client'

import { useFormState } from 'react-dom'
import { SubmitButton } from '@/components/shared/SubmitButton'
import { savePracticeMenu, type MenuFormState } from '@/lib/actions/menu.actions'

const initialState: MenuFormState = {}

interface Props {
  defaultDate: string
  defaultContent?: string
}

export function PracticeMenuForm({ defaultDate, defaultContent }: Props) {
  const [state, action] = useFormState(savePracticeMenu, initialState)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label">日付</label>
        <input name="date" type="date" defaultValue={defaultDate} required className="input" />
      </div>
      <div>
        <label className="label">練習メニュー</label>
        <textarea
          name="content"
          rows={8}
          required
          defaultValue={defaultContent ?? ''}
          placeholder={`例）\nウォームアップ: 20分\nランニング: 5km\n基礎練習: フォーム確認\nゲーム形式: 3対3\nクールダウン: 10分`}
          className="input resize-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">保存しました</p>}
      <SubmitButton label="保存する" pendingLabel="保存中..." className="btn-primary" />
    </form>
  )
}
