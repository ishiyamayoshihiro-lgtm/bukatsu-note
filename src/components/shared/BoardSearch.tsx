'use client'

import { useRouter } from 'next/navigation'

interface Props {
  searchParams: { q?: string; from?: string; to?: string }
}

export function BoardSearch({ searchParams }: Props) {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const q = fd.get('q')?.toString()
    const from = fd.get('from')?.toString()
    const to = fd.get('to')?.toString()
    if (q) params.set('q', q)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    router.push(`/board?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <input
        name="q"
        defaultValue={searchParams.q}
        placeholder="キーワード..."
        className="input flex-1 min-w-40"
      />
      <input name="from" type="date" defaultValue={searchParams.from} className="input" />
      <input name="to" type="date" defaultValue={searchParams.to} className="input" />
      <button type="submit" className="btn-primary">検索</button>
      <button type="button" onClick={() => router.push('/board')} className="btn-secondary">
        リセット
      </button>
    </form>
  )
}
