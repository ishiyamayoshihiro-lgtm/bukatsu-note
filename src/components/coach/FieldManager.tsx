'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useTransition, useState, useEffect, useRef } from 'react'
import {
  addFormField,
  editFormField,
  moveFormField,
  deleteFormField,
  restoreFormField,
  type FieldFormState,
} from '@/lib/actions/settings.actions'

type Tab = 'common' | 'practice' | 'expedition'

interface Field {
  id: string
  fieldKey: string | null
  group: string
  inputType: string
  label: string
  hint: string | null
  required: boolean
  minLength: number | null
  maxLength: number | null
  isVisible: boolean
  canDelete: boolean
}

interface Props {
  fields: Field[]
  activeTab?: Tab
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'common',     label: '共通項目' },
  { key: 'practice',   label: '練習' },
  { key: 'expedition', label: '遠征・大会' },
]

const INPUT_TYPE_LABELS: Record<string, string> = {
  textarea: 'テキスト（複数行）',
  score10:  '10段階評価',
  text:     'テキスト（1行）',
  number:   '数値',
  checkbox: 'チェック',
  rating5:  '5段階評価',
  rating5m: '5段階評価',
}

const CUSTOM_INPUT_TYPES = [
  { value: 'textarea', label: 'テキスト（複数行）' },
  { value: 'score10',  label: '10段階評価' },
]

const TEXT_TYPES = new Set(['textarea', 'text'])
const initial: FieldFormState = {}

function LimitBadge({ min, max }: { min: number | null; max: number | null }) {
  if (!min && !max) return null
  const text = min && max ? `${min}〜${max}文字` : min ? `${min}文字以上` : `${max}文字以下`
  return <span className="text-xs text-blue-500">{text}</span>
}

function AddForm({ group }: { group: Tab }) {
  const [state, action] = useFormState(addFormField, initial)
  const [inputType, setInputType] = useState('textarea')
  const [hasLimit, setHasLimit] = useState(false)
  const [label, setLabel] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setLabel('')
      setInputType('textarea')
      setHasLimit(false)
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-4">
      <p className="text-sm font-semibold text-gray-700">項目の追加</p>
      <input type="hidden" name="group" value={group} />

      <div>
        <label className="block text-xs text-gray-500 mb-1">入力形式</label>
        <select
          name="inputType"
          value={inputType}
          onChange={(e) => { setInputType(e.target.value); setHasLimit(false) }}
          className="input"
        >
          {CUSTOM_INPUT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <input
        name="label"
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="項目名（例：次の目標）"
        className="input"
      />
      <input name="hint" type="text" placeholder="ヒント・補足（省略可）" className="input" />

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input name="required" type="checkbox" className="w-4 h-4 accent-blue-600" />
          <span className="text-gray-600">必須入力</span>
        </label>
        {TEXT_TYPES.has(inputType) && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="hasLimit"
              type="checkbox"
              checked={hasLimit}
              onChange={(e) => setHasLimit(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-gray-600">文字数制限</span>
          </label>
        )}
      </div>

      {hasLimit && TEXT_TYPES.has(inputType) && (
        <div className="flex items-center gap-2 text-sm">
          <input name="minLength" type="number" min={1} placeholder="0" className="input w-24 text-center" />
          <span className="text-gray-500">文字以上</span>
          <input name="maxLength" type="number" min={1} placeholder="∞" className="input w-24 text-center" />
          <span className="text-gray-500">文字以下</span>
        </div>
      )}

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">追加しました</p>}
      <AddButton labelEmpty={!label.trim()} />
    </form>
  )
}

function AddButton({ labelEmpty }: { labelEmpty: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending || labelEmpty} className="btn-primary text-sm py-1.5">
      {pending ? '追加中...' : '追加する'}
    </button>
  )
}

function EditForm({ field, onCancel }: { field: Field; onCancel: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [label, setLabel] = useState(field.label)
  const [hint, setHint] = useState(field.hint ?? '')
  const [required, setRequired] = useState(field.required)
  const [hasLimit, setHasLimit] = useState(field.minLength != null || field.maxLength != null)
  const [minLength, setMinLength] = useState(field.minLength?.toString() ?? '')
  const [maxLength, setMaxLength] = useState(field.maxLength?.toString() ?? '')
  const [error, setError] = useState('')
  const isTextField = TEXT_TYPES.has(field.inputType)

  const handleSave = () => {
    if (!label.trim()) { setError('項目名を入力してください'); return }
    const min = hasLimit && isTextField && minLength ? parseInt(minLength, 10) : null
    const max = hasLimit && isTextField && maxLength ? parseInt(maxLength, 10) : null
    startTransition(async () => {
      await editFormField(field.id, label, hint.trim() || null, required, min, max)
      onCancel()
    })
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-sm">
      <p className="font-semibold text-blue-800">項目の編集</p>
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="項目名" className="input" />
      <input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="ヒント・補足（省略可）" className="input" />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="w-4 h-4 accent-blue-600" />
          <span className="text-gray-600">必須入力</span>
        </label>
        {isTextField && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={hasLimit} onChange={(e) => setHasLimit(e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <span className="text-gray-600">文字数制限</span>
          </label>
        )}
      </div>
      {isTextField && hasLimit && (
        <div className="flex items-center gap-2">
          <input type="number" min={1} value={minLength} onChange={(e) => setMinLength(e.target.value)} placeholder="0" className="input w-24 text-center" />
          <span className="text-gray-500">文字以上</span>
          <input type="number" min={1} value={maxLength} onChange={(e) => setMaxLength(e.target.value)} placeholder="∞" className="input w-24 text-center" />
          <span className="text-gray-500">文字以下</span>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={isPending} onClick={handleSave} className="btn-primary py-1 text-sm">
          {isPending ? '保存中...' : '保存'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary py-1 text-sm">
          キャンセル
        </button>
      </div>
    </div>
  )
}

export function FieldManager({ fields, activeTab: controlledTab }: Props) {
  const [internalTab, setInternalTab] = useState<Tab>('common')
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)

  const activeTab = controlledTab ?? internalTab
  const showTabs = controlledTab === undefined

  const visibleFields = fields.filter(f => f.group === activeTab && f.isVisible)
  const hiddenFields  = fields.filter(f => f.group === activeTab && !f.isVisible)

  return (
    <div>
      {/* タブ（親から activeTab が渡されている場合は非表示） */}
      {showTabs && (
        <div className="flex border-b border-gray-200 mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setInternalTab(tab.key); setEditingId(null) }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* フィールドリスト */}
      <div className="space-y-2">
        {visibleFields.map((field, idx) => (
          <div key={field.id}>
            {editingId === field.id ? (
              <EditForm field={field} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-xl border bg-white border-gray-200">
                {/* 並び替え */}
                <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                  <button
                    type="button"
                    disabled={isPending || idx === 0}
                    onClick={() => startTransition(() => moveFormField(field.id, 'up'))}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 text-xs"
                  >↑</button>
                  <button
                    type="button"
                    disabled={isPending || idx === visibleFields.length - 1}
                    onClick={() => startTransition(() => moveFormField(field.id, 'down'))}
                    className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 text-xs"
                  >↓</button>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900">{field.label}</span>
                    {field.required && <span className="text-xs text-red-500 font-medium">必須</span>}
                    <span className="text-xs text-gray-300">{INPUT_TYPE_LABELS[field.inputType] ?? field.inputType}</span>
                  </div>
                  {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
                  {TEXT_TYPES.has(field.inputType) && (
                    <LimitBadge min={field.minLength} max={field.maxLength} />
                  )}
                </div>

                {/* 操作ボタン */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setEditingId(field.id)}
                    className="text-xs px-2 py-1 rounded border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  >編集</button>
                  {field.canDelete ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm(`「${field.label}」を削除しますか？`)) return
                        startTransition(() => deleteFormField(field.id))
                      }}
                      className="text-xs px-2 py-1 rounded border bg-white text-red-400 border-red-200 hover:bg-red-50"
                    >削除</button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm(`「${field.label}」を非表示にしますか？\n設定から再表示できます。`)) return
                        startTransition(() => deleteFormField(field.id))
                      }}
                      className="text-xs px-2 py-1 rounded border bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                    >非表示</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 項目の追加 */}
      <AddForm key={activeTab} group={activeTab} />

      {/* 非表示の項目 */}
      {hiddenFields.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 tracking-wide mb-2">非表示の項目</p>
          <div className="space-y-2">
            {hiddenFields.map(field => (
              <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 border-gray-100">
                <p className="flex-1 text-sm text-gray-500">{field.label}</p>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => restoreFormField(field.id))}
                  className="text-xs px-2 py-1 rounded border bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shrink-0"
                >表示に戻す</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
