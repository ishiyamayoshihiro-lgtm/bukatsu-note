'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { z } from 'zod'

const ALLOWED_DOMAIN = 'haguroko.ed.jp'

const InviteSchema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .endsWith(`@${ALLOWED_DOMAIN}`, `@${ALLOWED_DOMAIN} のアドレスのみ招待できます`),
})

export type InviteFormState = {
  error?: string
  success?: boolean
}

export async function inviteUser(_prev: InviteFormState, formData: FormData): Promise<InviteFormState> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    return { error: 'スタッフアカウントのみ招待できます' }
  }

  const parsed = InviteSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { email } = parsed.data

  const existing = await prisma.invitedUser.findUnique({ where: { email } })
  if (existing) return { error: 'このメールアドレスはすでに招待済みです' }

  await prisma.invitedUser.create({
    data: { email, invitedById: session.user.id },
  })

  revalidatePath('/coach/invite')
  return { success: true }
}

export async function revokeInvite(email: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    throw new Error('権限がありません')
  }

  await prisma.invitedUser.delete({ where: { email } })
  revalidatePath('/coach/invite')
}

export async function changeUserRole(userId: string, newRole: Role) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    throw new Error('権限がありません')
  }
  await prisma.user.update({ where: { id: userId }, data: { role: newRole } })
  revalidatePath('/coach/invite')
}
