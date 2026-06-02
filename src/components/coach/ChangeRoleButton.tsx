'use client'

import { useTransition } from 'react'
import { changeUserRole } from '@/lib/actions/invite.actions'
import { Role } from '@prisma/client'

interface Props {
  userId: string
  currentRole: Role
}

const roleLabel: Record<Role, string> = {
  [Role.STAFF]: 'スタッフ',
  [Role.MANAGER]: 'マネージャ',
  [Role.MEMBER]: '部員',
}

const roleColor: Record<Role, string> = {
  [Role.STAFF]: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  [Role.MANAGER]: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  [Role.MEMBER]: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
}

const ROLES: Role[] = [Role.STAFF, Role.MANAGER, Role.MEMBER]

export function ChangeRoleButton({ userId, currentRole }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role
    if (newRole === currentRole) return
    if (!confirm(`ロールを「${roleLabel[currentRole]}」→「${roleLabel[newRole]}」に変更しますか？`)) return
    startTransition(() => changeUserRole(userId, newRole))
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs px-2 py-1 rounded border transition-colors cursor-pointer ${roleColor[currentRole]}`}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{roleLabel[r]}</option>
      ))}
    </select>
  )
}
