'use client'

import { useRef } from 'react'
import { useFormState } from 'react-dom'
import { replyToLog, type LogFormState } from '@/lib/actions/log.actions'
import { SubmitButton } from '@/components/shared/SubmitButton'

const STAMPS = [
  'よく頑張りました！引き続き頑張ろう！',
  '反省をしっかり活かして次の練習に臨もう！',
  '課題意識が高いね。次回も意識してみよう！',
  '怪我に気をつけて、無理せず回復を優先してください。',
  'メンタルが心配です。いつでも話しかけてね。',
  '今日の練習の成果が出ていますね！',
  '基礎をしっかり積み重ねていこう！',
]

const initialState: LogFormState = {}

export function ReplyForm({ logId, currentReply }: { logId: string; currentReply: string | null }) {
  const [state, action] = useFormState(replyToLog, initialState)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertStamp = (text: string) => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    const prev = el.value
    el.value = prev ? `${prev}\n${text}` : text
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-4">コーチコメント</h2>

      {currentReply && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-500 mb-1">現在のコメント</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{currentReply}</p>
        </div>
      )}

      {/* スタンプUI */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">クイック返信 (スタンプ)</p>
        <div className="flex flex-wrap gap-2">
          {STAMPS.map((stamp) => (
            <button
              key={stamp}
              type="button"
              onClick={() => insertStamp(stamp)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-gray-200"
            >
              {stamp.length > 20 ? stamp.slice(0, 20) + '…' : stamp}
            </button>
          ))}
        </div>
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="logId" value={logId} />
        <textarea
          ref={textareaRef}
          name="replyComment"
          defaultValue={currentReply ?? ''}
          rows={4}
          placeholder="生徒へのコメントを入力..."
          className="input resize-none"
        />
        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-green-600">コメントを保存しました</p>
        )}
        <SubmitButton label="コメントを保存" pendingLabel="保存中..." className="btn-primary" />
      </form>
    </div>
  )
}
