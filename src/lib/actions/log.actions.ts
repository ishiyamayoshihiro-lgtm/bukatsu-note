'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { z } from 'zod'

const LogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'),
  trainingContent: z.string().min(1, '練習内容を入力してください').max(2000),
  reflection: z.string().min(1, '反省を入力してください').max(2000),
  task: z.string().min(1, '課題を入力してください').max(2000),
  sleepTime: z.coerce.number().min(0).max(24),
  fatigue: z.coerce.number().int().min(1).max(5),
  injury: z.coerce.boolean(),
  mental: z.coerce.number().int().min(1).max(5),
})

export type LogFormState = {
  error?: string
  success?: boolean
}

export async function createLog(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.MEMBER) {
    return { error: '権限がありません' }
  }

  const raw = {
    date: formData.get('date'),
    trainingContent: formData.get('trainingContent'),
    reflection: formData.get('reflection'),
    task: formData.get('task'),
    sleepTime: formData.get('sleepTime'),
    fatigue: formData.get('fatigue'),
    injury: formData.get('injury') === 'on',
    mental: formData.get('mental'),
  }

  const parsed = LogSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { date, ...rest } = parsed.data

  // 同日の日誌が既にある場合は上書き
  const existing = await prisma.log.findFirst({
    where: { studentId: session.user.id, date: new Date(date) },
  })

  if (existing) {
    await prisma.log.update({
      where: { id: existing.id },
      data: { ...rest, date: new Date(date) },
    })
  } else {
    await prisma.log.create({
      data: {
        studentId: session.user.id,
        date: new Date(date),
        ...rest,
      },
    })
  }

  revalidatePath('/student')
  revalidatePath('/coach')
  return { success: true }
}

const ReplySchema = z.object({
  logId: z.string().cuid(),
  replyComment: z.string().max(1000),
})

export async function replyToLog(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    return { error: '権限がありません' }
  }

  const parsed = ReplySchema.safeParse({
    logId: formData.get('logId'),
    replyComment: formData.get('replyComment'),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.log.update({
    where: { id: parsed.data.logId },
    data: { replyComment: parsed.data.replyComment },
  })

  revalidatePath('/coach')
  revalidatePath(`/coach/logs/${parsed.data.logId}`)
  return { success: true }
}

export async function toggleShared(logId: string, isShared: boolean) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    throw new Error('権限がありません')
  }

  await prisma.log.update({
    where: { id: logId },
    data: { isShared },
  })

  revalidatePath('/coach')
  revalidatePath('/board')
}

export async function updateTarget(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.MEMBER) {
    return { error: '権限がありません' }
  }

  const target = formData.get('target')?.toString() ?? ''
  if (target.length > 500) return { error: '目標は500文字以内で入力してください' }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { target },
  })

  revalidatePath('/student')
  return { success: true }
}
