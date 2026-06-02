import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'

export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  if (session.user.role === Role.STAFF) redirect('/coach')
  if (session.user.role === Role.MANAGER) redirect('/manager/menu')
  if (session.user.role === Role.MEMBER) redirect('/student')

  redirect('/login')
}
