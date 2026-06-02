'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface Student {
  id: string
  name: string | null
  email: string | null
}

interface Props {
  students: Student[]
  searchParams: {
    q?: string
    studentId?: string
    from?: string
    to?: string
  }
}

export function LogSearchForm({ students, searchParams }: Props) {
  const router = useRouter()

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      const params = new URLSearchParams()
      const q = fd.get('q')?.toString()
      const studentId = fd.get('studentId')?.toString()
      const from = fd.get('from')?.toString()
      const to = fd.get('to')?.toString()
      if (q) params.set('q', q)
      if (studentId) params.set('studentId', studentId)
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      router.push(`/coach/logs?${params.toString()}`)
    },
    [router]
  )

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="キーワード検索..."
          className="input sm:col-span-2"
        />
        <select name="studentId" defaultValue={searchParams.studentId} className="input">
          <option value="">すべての生徒</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name ?? s.email}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input name="from" type="date" defaultValue={searchParams.from} className="input flex-1" />
          <input name="to" type="date" defaultValue={searchParams.to} className="input flex-1" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button type="submit" className="btn-primary">検索</button>
        <button
          type="button"
          onClick={() => router.push('/coach/logs')}
          className="btn-secondary"
        >
          リセット
        </button>
      </div>
    </form>
  )
}
