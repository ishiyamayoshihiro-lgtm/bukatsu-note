'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { z } from 'zod'

const ScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'),
  title: z.string().min(1, 'タイトルを入力してください').max(200),
  description: z.string().max(2000).optional(),
})

export type ScheduleFormState = {
  error?: string
  success?: boolean
}

export async function createSchedule(
  _prev: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    return { error: '教員アカウントのみスケジュールを作成できます' }
  }

  const parsed = ScheduleSchema.safeParse({
    date: formData.get('date'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { date, ...rest } = parsed.data
  await prisma.schedule.create({
    data: { date: new Date(date), ...rest },
  })

  revalidatePath('/student/schedule')
  revalidatePath('/board')
  return { success: true }
}

export async function deleteSchedule(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    throw new Error('権限がありません')
  }

  await prisma.schedule.delete({ where: { id } })
  revalidatePath('/student/schedule')
  revalidatePath('/board')
}
