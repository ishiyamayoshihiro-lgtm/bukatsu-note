import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

interface BackupData {
  version: string
  exportedAt: string
  tables: {
    users: any[]
    invitedUsers: any[]
    formFields: any[]
    stamps: any[]
    logs: any[]
    logStamps: any[]
    practiceMenus: any[]
    schedules: any[]
  }
}

function normalizeDates<T extends Record<string, any>>(row: T): T {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      result[key] = new Date(value)
    } else {
      result[key] = value
    }
  }
  return result as T
}

async function restoreDatabase(backup: BackupData) {
  const { tables: t } = backup

  const stats = await prisma.$transaction(
    async (tx) => {
      await tx.logStamp.deleteMany()
      await tx.log.deleteMany()
      await tx.practiceMenu.deleteMany()
      await tx.invitedUser.deleteMany()
      await tx.stamp.deleteMany()
      await tx.user.deleteMany()
      await tx.formField.deleteMany()
      await tx.schedule.deleteMany()

      if (t.users.length > 0) {
        await tx.user.createMany({ data: t.users.map(normalizeDates) })
      }
      if (t.invitedUsers.length > 0) {
        await tx.invitedUser.createMany({ data: t.invitedUsers.map(normalizeDates) })
      }
      if (t.formFields.length > 0) {
        await tx.formField.createMany({ data: t.formFields.map(normalizeDates) })
      }
      if (t.stamps.length > 0) {
        await tx.stamp.createMany({ data: t.stamps.map(normalizeDates) })
      }
      if (t.practiceMenus.length > 0) {
        await tx.practiceMenu.createMany({ data: t.practiceMenus.map(normalizeDates) })
      }
      if (t.schedules.length > 0) {
        await tx.schedule.createMany({ data: t.schedules.map(normalizeDates) })
      }
      if (t.logs.length > 0) {
        await tx.log.createMany({ data: t.logs.map(normalizeDates) })
      }
      if (t.logStamps.length > 0) {
        await tx.logStamp.createMany({ data: t.logStamps })
      }

      return {
        users: t.users.length,
        logs: t.logs.length,
        invitedUsers: t.invitedUsers.length,
        formFields: t.formFields.length,
        stamps: t.stamps.length,
        logStamps: t.logStamps.length,
        practiceMenus: t.practiceMenus.length,
        schedules: t.schedules.length,
      }
    },
    { timeout: 60000 }
  )

  return stats
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  let backup: BackupData
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }
    const text = await file.text()
    backup = JSON.parse(text)
  } else {
    backup = await request.json()
  }

  if (backup.version !== '1') {
    return NextResponse.json({ error: '対応していないバックアップバージョンです' }, { status: 400 })
  }

  if (!backup.tables) {
    return NextResponse.json({ error: 'バックアップデータが不正です' }, { status: 400 })
  }

  const stats = await restoreDatabase(backup)

  return NextResponse.json({ success: true, stats })
}
