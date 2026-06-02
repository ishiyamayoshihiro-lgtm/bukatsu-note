'use client'

import { useState } from 'react'
import { SubmitButton } from '@/components/shared/SubmitButton'

type Step = 'idle' | 'preview' | 'confirm' | 'restoring' | 'done' | 'error'

interface PreviewData {
  exportedAt: string
  counts: Record<string, number>
}

interface RestoreResult {
  stats?: Record<string, number>
  error?: string
}

export function RestoreForm() {
  const [step, setStep] = useState<Step>('idle')
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [result, setResult] = useState<RestoreResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const backup = JSON.parse(content)

        if (backup.version !== '1' || !backup.tables) {
          setStep('error')
          setResult({ error: 'バックアップファイルが不正です' })
          return
        }

        const counts = Object.entries(backup.tables).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: Array.isArray(value) ? value.length : 0,
          }),
          {} as Record<string, number>
        )

        setSelectedFile(file)
        setPreviewData({
          exportedAt: backup.exportedAt,
          counts,
        })
        setStep('preview')
        setConfirmText('')
        setResult(null)
      } catch (err) {
        setStep('error')
        setResult({ error: 'ファイルの解析に失敗しました' })
      }
    }
    reader.readAsText(file)
  }

  const handleRestore = async () => {
    if (!selectedFile || confirmText !== '復旧を実行する') return

    setStep('restoring')
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setStep('error')
        setResult({ error: data.error || '復旧に失敗しました' })
        return
      }

      setStep('done')
      setResult({ stats: data.stats })
    } catch (err) {
      setStep('error')
      setResult({ error: err instanceof Error ? err.message : '復旧に失敗しました' })
    }
  }

  const isConfirmButtonEnabled = confirmText === '復旧を実行する' && step === 'confirm'

  return (
    <div className="space-y-6">
      {/* STEP 1: ファイル選択 */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">STEP 1: バックアップファイルを選択</h3>
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          disabled={step === 'restoring'}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      {/* STEP 2: プレビュー */}
      {previewData && (
        <div className="card border-l-4 border-l-blue-400">
          <h3 className="font-semibold text-gray-900 mb-3">STEP 2: バックアップ内容の確認</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">バックアップ日時:</span> {new Date(previewData.exportedAt).toLocaleString('ja-JP')}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.entries(previewData.counts).map(([table, count]) => (
                <p key={table} className="text-gray-600">
                  <span className="font-semibold">{table}:</span> {count}件
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: 確認テキスト */}
      {(step === 'preview' || step === 'confirm' || step === 'error') && previewData && (
        <div className="card border-l-4 border-l-red-400">
          <h3 className="font-semibold text-gray-900 mb-3">STEP 3: 復旧の確認</h3>
          <p className="text-sm text-red-700 mb-4">
            ⚠️ <strong>既存のすべてのデータが削除されます。</strong>
            確認テキストを入力してください。
          </p>
          <p className="text-xs text-gray-500 mb-2">以下の文言を正確に入力してください:</p>
          <code className="block bg-gray-100 px-3 py-2 rounded text-sm font-mono mb-3">復旧を実行する</code>
          <input
            type="text"
            placeholder="復旧を実行する"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={step !== 'confirm' && step !== 'preview'}
            className="input w-full mb-4"
          />
          <button
            onClick={handleRestore}
            disabled={!isConfirmButtonEnabled}
            className={`btn w-full justify-center ${
              isConfirmButtonEnabled
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            復旧を実行する
          </button>
        </div>
      )}

      {/* 完了画面 */}
      {step === 'done' && result?.stats && (
        <div className="card border-l-4 border-l-green-400">
          <h3 className="font-semibold text-green-800 mb-3">✓ 復旧が完了しました</h3>
          <div className="space-y-1 text-sm text-gray-600 mb-4">
            {Object.entries(result.stats).map(([table, count]) => (
              <p key={table}>
                {table}: <strong>{count}</strong>件
              </p>
            ))}
          </div>
          <p className="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded">
            <strong>重要:</strong> すべてのユーザーは再度ログインが必要です。
          </p>
        </div>
      )}

      {/* エラー画面 */}
      {step === 'error' && result?.error && (
        <div className="card border-l-4 border-l-red-400">
          <h3 className="font-semibold text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-sm text-red-700">{result.error}</p>
          <button
            onClick={() => {
              setStep('idle')
              setPreviewData(null)
              setConfirmText('')
              setResult(null)
              setSelectedFile(null)
            }}
            className="btn btn-secondary mt-4 w-full justify-center"
          >
            別のファイルを選択
          </button>
        </div>
      )}
    </div>
  )
}
