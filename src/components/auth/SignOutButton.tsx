'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="btn-secondary w-full justify-center mt-3"
    >
      サインアウトして再ログイン
    </button>
  )
}
