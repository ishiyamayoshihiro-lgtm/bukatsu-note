import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')

  if (!process.env.BACKUP_API_KEY) {
    return NextResponse.json({ error: 'Backup not configured' }, { status: 503 })
  }

  if (!key || key !== process.env.BACKUP_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [users, invitedUsers, formFields, stamps, logs, logStamps, practiceMenus, schedules] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.invitedUser.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.formField.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.stamp.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.log.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.logStamp.findMany(),
    prisma.practiceMenu.findMany({ orderBy: { date: 'asc' } }),
    prisma.schedule.findMany({ orderBy: { date: 'asc' } }),
  ])

  const backup = {
    version: '1',
    exportedAt: new Date().toISOString(),
    tables: {
      users,
      invitedUsers,
      formFields,
      stamps,
      logs,
      logStamps,
      practiceMenus,
      schedules,
    },
  }

  return NextResponse.json(backup)
}
