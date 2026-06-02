'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  label: string
  pendingLabel: string
  className?: string
  disabled?: boolean
}

export function SubmitButton({ label, pendingLabel, className, disabled }: Props) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending || !!disabled} className={className}>
      {pending ? pendingLabel : label}
    </button>
  )
}
