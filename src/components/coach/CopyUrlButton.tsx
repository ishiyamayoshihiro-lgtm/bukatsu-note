'use client'

import { useState } from 'react'

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>コピーしました</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>URLをコピー</span>
        </>
      )}
    </button>
  )
}
