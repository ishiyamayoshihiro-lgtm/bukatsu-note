'use client'

import { useFormState } from 'react-dom'
import { createLog, type LogFormState } from '@/lib/actions/log.actions'
import { SubmitButton } from '@/components/shared/SubmitButton'

interface DefaultValues {
  date?: Date
  trainingContent?: string
  reflection?: string
  task?: string
  sleepTime?: number
  fatigue?: number
  injury?: boolean
  mental?: number
}

interface Props {
  defaultDate: string
  defaultValues?: DefaultValues
}

const initialState: LogFormState = {}

const LEVELS = [1, 2, 3, 4, 5]

export function LogForm({ defaultDate, defaultValues }: Props) {
  const [state, action] = useFormState(createLog, initialState)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="date" value={defaultDate} />

      {/* ステータス入力 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">睡眠時間 (時間)</label>
          <input
            name="sleepTime"
            type="number"
            min="0"
            max="24"
            step="0.5"
            defaultValue={defaultValues?.sleepTime ?? 7}
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">怪我</label>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              name="injury"
              type="checkbox"
              defaultChecked={defaultValues?.injury ?? false}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-sm text-gray-700">怪我・不調あり</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">疲労度</label>
          <RatingInput name="fatigue" defaultValue={defaultValues?.fatigue ?? 3} />
        </div>
        <div>
          <label className="label">メンタル</label>
          <RatingInput name="mental" defaultValue={defaultValues?.mental ?? 3} />
        </div>
      </div>

      {/* テキスト入力 */}
      <div>
        <label className="label">練習内容</label>
        <textarea
          name="trainingContent"
          rows={3}
          required
          defaultValue={defaultValues?.trainingContent ?? ''}
          placeholder="今日の練習メニュー・内容を記入..."
          className="input resize-none"
        />
      </div>
      <div>
        <label className="label">反省</label>
        <textarea
          name="reflection"
          rows={3}
          required
          defaultValue={defaultValues?.reflection ?? ''}
          placeholder="今日の練習を振り返って..."
          className="input resize-none"
        />
      </div>
      <div>
        <label className="label">明日への課題</label>
        <textarea
          name="task"
          rows={3}
          required
          defaultValue={defaultValues?.task ?? ''}
          placeholder="次の練習で意識すること..."
          className="input resize-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">日誌を提出しました！</p>
      )}

      <SubmitButton label="日誌を提出する" pendingLabel="送信中..." className="btn-primary w-full justify-center py-3" />
    </form>
  )
}

function RatingInput({ name, defaultValue }: { name: string; defaultValue: number }) {
  return (
    <div className="flex gap-2 mt-1">
      {LEVELS.map((v) => (
        <label key={v} className="flex flex-col items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={v}
            defaultChecked={v === defaultValue}
            className="sr-only peer"
            required
          />
          <span className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white transition-colors cursor-pointer">
            {v}
          </span>
        </label>
      ))}
    </div>
  )
}
