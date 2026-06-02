'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useTransition, useState } from 'react'
import { addStamp, editStamp, moveStamp, deleteStamp, type StampFormState } from '@/lib/actions/settings.actions'

interface StampItem {
  id: string
  label: string
  isActive: boolean
}

interface Props {
  stamps: StampItem[]
}

const initial: StampFormState = {}

function EditForm({ stamp, onCancel }: { stamp: StampItem; onCancel: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [label, setLabel] = useState(stamp.label)
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!label.trim()) { setError('ラベルを入力してください'); return }
    startTransition(async () => {
      await editStamp(stamp.id, label)
      onCancel()
    })
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex-1 space-y-1">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="input text-sm"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <button type="button" disabled={isPending} onClick={handleSave} className="btn-primary py-1 text-sm shrink-0">
        {isPending ? '保存中...' : '保存'}
      </button>
      <button type="button" onClick={onCancel} className="btn-secondary py-1 text-sm shrink-0">
        キャンセル
      </button>
    </div>
  )
}

export function StampManager({ stamps }: Props) {
  const [state, action] = useFormState(addStamp, initial)
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {/* スタンプ一覧 */}
      {stamps.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">スタンプはまだありません</p>
      ) : (
        <div className="space-y-2">
          {stamps.map((stamp, idx) =>
            editingId === stamp.id ? (
              <EditForm key={stamp.id} stamp={stamp} onCancel={() => setEditingId(null)} />
            ) : (
              <div key={stamp.id} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200">
                {/* 並び替え */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={isPending || idx === 0}
                    onClick={() => startTransition(() => moveStamp(stamp.id, 'up'))}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 text-xs"
                  >↑</button>
                  <button
                    type="button"
                    disabled={isPending || idx === stamps.length - 1}
                    onClick={() => startTransition(() => moveStamp(stamp.id, 'down'))}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 text-xs"
                  >↓</button>
                </div>

                {/* ラベル */}
                <span className="flex-1 text-sm font-medium">{stamp.label}</span>

                {/* 操作 */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setEditingId(stamp.id)}
                    className="text-xs px-2 py-1 rounded border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  >編集</button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm(`「${stamp.label}」を削除しますか？`)) return
                      startTransition(() => deleteStamp(stamp.id))
                    }}
                    className="text-xs px-2 py-1 rounded border bg-white text-red-400 border-red-200 hover:bg-red-50"
                  >削除</button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* 追加フォーム */}
      <form action={action} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-sm font-semibold text-gray-700">スタンプを追加</p>
        <p className="text-xs text-gray-500">絵文字・テキスト・組み合わせ何でもOKです（例: 👍 よくできました！）</p>
        <div className="flex gap-3">
          <input name="label" type="text" placeholder="👍 よくできました！" required className="input flex-1" />
          <AddButton />
        </div>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        {state.success && <p className="text-xs text-green-600">追加しました</p>}
      </form>
    </div>
  )
}

function AddButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary shrink-0">
      {pending ? '追加中...' : '追加'}
    </button>
  )
}
