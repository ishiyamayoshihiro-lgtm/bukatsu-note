'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export type MenuFormState = {
  error?: string
  success?: boolean
}

export async function savePracticeMenu(
  _prev: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.MANAGER) {
    return { error: 'マネージャのみ練習メニューを登録できます' }
  }

  const date = formData.get('date')?.toString()
  const content = formData.get('content')?.toString()

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: '日付が正しくありません' }
  if (!content || content.trim().length === 0) return { error: '練習メニューを入力してください' }
  if (content.length > 3000) return { error: '3000文字以内で入力してください' }

  await prisma.practiceMenu.upsert({
    where: { date: new Date(date) },
    update: { content: content.trim(), createdById: session.user.id },
    create: { date: new Date(date), content: content.trim(), createdById: session.user.id },
  })

  revalidatePath('/manager/menu')
  revalidatePath('/student')
  return { success: true }
}
