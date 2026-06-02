'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Role } from '@prisma/client'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
}

const coachNav: NavItem[] = [
  { href: '/coach', label: 'ダッシュボード' },
  { href: '/coach/logs', label: '日誌一覧' },
  { href: '/coach/schedule', label: 'スケジュール' },
  { href: '/coach/invite', label: '招待管理' },
  { href: '/coach/settings', label: '設定' },
  { href: '/coach/backup', label: 'バックアップ' },
  { href: '/board', label: '掲示板' },
  { href: '/help', label: '使い方' },
]

const studentNav: NavItem[] = [
  { href: '/student', label: 'ダッシュボード' },
  { href: '/student/schedule', label: 'スケジュール' },
  { href: '/board', label: '掲示板' },
  { href: '/help', label: '使い方' },
]

const managerNav: NavItem[] = [
  { href: '/manager', label: 'ダッシュボード' },
  { href: '/manager/menu', label: '練習メニュー' },
  { href: '/board', label: '掲示板' },
  { href: '/help', label: '使い方' },
]

export function NavBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user.role
  const navItems = role === Role.STAFF ? coachNav : role === Role.MANAGER ? managerNav : studentNav
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="font-bold text-lg tracking-tight">部活ノート</span>
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-blue-300">{session?.user.name}</p>
              <p className="text-xs text-blue-400">
                {role === Role.STAFF ? '顧問' : role === Role.MANAGER ? 'マネージャ' : '部員'}
              </p>
            </div>
            {session?.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-blue-500"
              />
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="hidden sm:block text-xs text-blue-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-blue-800"
            >
              ログアウト
            </button>
            {/* ハンバーガーボタン（sm未満のみ表示） */}
            <button
              className="sm:hidden p-2 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="メニューを開く"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="sm:hidden border-t border-blue-800 px-4 py-3 space-y-1">
          <div className="pb-2 mb-2 border-b border-blue-800">
            <p className="text-sm text-blue-300">{session?.user.name}</p>
            <p className="text-xs text-blue-400">
              {role === Role.STAFF ? '顧問' : role === Role.MANAGER ? 'マネージャ' : '部員'}
            </p>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-blue-300 hover:bg-blue-800 hover:text-white transition-colors"
          >
            ログアウト
          </button>
        </div>
      )}
    </nav>
  )
}
