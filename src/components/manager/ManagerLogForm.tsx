'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import type { FormField } from '@prisma/client'
import { createManagerLog, type LogFormState } from '@/lib/actions/manager-log.actions'
import { SubmitButton } from '@/components/shared/SubmitButton'

type LogType = 'manager_practice' | 'manager_expedition'

interface Props {
  defaultDate: string
  practiceFields: FormField[]
  expeditionFields: FormField[]
}

const LOG_TYPE_LABELS: Record<LogType, string> = {
  manager_practice: '練習',
  manager_expedition: '遠征・大会',
}

const FIELD_KEY_TO_NAME: Record<string, string> = {
  mgr_observationNote: 'trainingContent',
  mgr_improvement: 'reflection',
  mgr_nextAction: 'task',
  mgr_exp_observationNote: 'trainingContent',
  mgr_exp_support: 'reflection',
  mgr_exp_nextAction: 'task',
}

const initialState: LogFormState = {}

export function ManagerLogForm({ defaultDate, practiceFields, expeditionFields }: Props) {
  const [state, action] = useFormState(createManagerLog, initialState)
  const [logType, setLogType] = useState<LogType>('manager_practice')

  const fields = logType === 'manager_practice' ? practiceFields : expeditionFields

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="date" value={defaultDate} />
      <input type="hidden" name="logType" value={logType} />

      {/* ログタイプセレクタ */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {(Object.keys(LOG_TYPE_LABELS) as LogType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setLogType(type)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              logType === type
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {LOG_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* フィールド */}
      {fields.map((field) => {
        const inputName = field.fieldKey ? (FIELD_KEY_TO_NAME[field.fieldKey] ?? `cf_${field.id}`) : `cf_${field.id}`
        const isRequired = field.required

        return (
          <div key={field.id}>
            <label className="label">
              {field.label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.hint && <p className="text-xs text-gray-400 mb-1">{field.hint}</p>}

            {field.inputType === 'textarea' && (
              <textarea
                name={inputName}
                rows={3}
                required={isRequired}
                className="input resize-none"
              />
            )}

            {field.inputType === 'text' && (
              <input
                name={inputName}
                type="text"
                required={isRequired}
                className="input"
              />
            )}

            {field.inputType === 'number' && (
              <input
                name={inputName}
                type="number"
                min="0"
                step="0.5"
                required={isRequired}
                className="input"
              />
            )}
          </div>
        )
      })}

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
