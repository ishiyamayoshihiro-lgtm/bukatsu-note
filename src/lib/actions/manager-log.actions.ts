'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { Prisma } from '@prisma/client'

export type LogFormState = {
  error?: string
  success?: boolean
}

export async function createManagerLog(_prev: LogFormState, formData: FormData): Promise<LogFormState> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.MANAGER) {
    return { error: '権限がありません' }
  }

  const dateStr = formData.get('date')?.toString() ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return { error: '日付が不正です' }

  const logType = formData.get('logType')?.toString()
  if (!['manager_practice', 'manager_expedition'].includes(logType ?? '')) {
    return { error: 'ログタイプが不正です' }
  }

  const trainingContent = formData.get('trainingContent')?.toString() ?? ''
  if (!trainingContent) return { error: '項目を入力してください' }

  const reflection = formData.get('reflection')?.toString() ?? ''
  if (!reflection) return { error: '項目を入力してください' }

  const task = formData.get('task')?.toString() ?? ''
  if (!task) return { error: '項目を入力してください' }

  // カスタムフィールドを集める
  const customFields: Record<string, string> = {}
  for (const [key, value] of Array.from(formData.entries())) {
    if (key.startsWith('cf_')) {
      const fieldId = key.replace('cf_', '')
      customFields[fieldId] = value.toString()
    }
  }

  const logData = {
    logType,
    trainingContent,
    reflection,
    task,
    sleepTime: 0,
    fatigue: 0,
    mental: 0,
    injury: false,
    customFields: Object.keys(customFields).length > 0 ? customFields : Prisma.JsonNull,
  }

  const existing = await prisma.log.findFirst({
    where: { studentId: session.user.id, date: new Date(dateStr) },
  })

  if (existing) {
    await prisma.log.update({ where: { id: existing.id }, data: { ...logData, date: new Date(dateStr) } })
  } else {
    await prisma.log.create({ data: { studentId: session.user.id, date: new Date(dateStr), ...logData } })
  }

  revalidatePath('/manager')
  revalidatePath('/coach/logs')
  return { success: true }
}
