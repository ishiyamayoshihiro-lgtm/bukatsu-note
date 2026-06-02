import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 })
  }

  const logs = await prisma.log.findMany({
    include: { student: { select: { name: true, email: true } } },
    orderBy: [{ date: 'desc' }, { student: { name: 'asc' } }],
  })

  const header = [
    '日付',
    '生徒名',
    'メール',
    '睡眠(h)',
    '疲労(1-5)',
    'メンタル(1-5)',
    '怪我',
    '練習内容',
    '反省',
    '課題',
    'コーチコメント',
    '優秀ノート',
  ]

  const rows = logs.map((log) => [
    new Date(log.date).toLocaleDateString('ja-JP'),
    log.student.name ?? '',
    log.student.email,
    log.sleepTime,
    log.fatigue,
    log.mental,
    log.injury ? 'あり' : 'なし',
    log.trainingContent.replace(/"/g, '""'),
    log.reflection.replace(/"/g, '""'),
    log.task.replace(/"/g, '""'),
    (log.replyComment ?? '').replace(/"/g, '""'),
    log.isShared ? '○' : '',
  ])

  const csv =
    '﻿' + // BOM（Excel文字化け防止）
    [header, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="logs_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
