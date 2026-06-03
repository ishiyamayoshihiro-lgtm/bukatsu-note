import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const ALLOWED_DOMAIN = 'haguroko.ed.jp'

function determineRole(email: string): Role {
  const localPart = email.split('@')[0]
  return /\d/.test(localPart) ? Role.MEMBER : Role.STAFF
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email
      if (!email) return false

      // 1. ドメイン検証
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) return false

      // 2. 招待ホワイトリスト検証（STAFF は不要）
      const role = determineRole(email)
      if (role === Role.STAFF) {
        return true
      }

      const invited = await prisma.invitedUser.findUnique({ where: { email } })
      if (!invited) return false

      return true
    },

    async jwt({ token, account }) {
      try {
        // account が存在する = 新規ログイン or トークン再発行
        if (account && token.email) {
          const email = token.email
          const role = determineRole(email)

          // ロールをDBに反映（Prisma Adapter がユーザーを作成した後）
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: { role },
            create: { email, role },
            select: { id: true, role: true },
          })

          token.userId = dbUser.id
          token.role = dbUser.role
        } else if (!token.userId && token.email) {
          // トークンリフレッシュ時: DBから取得
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true },
          })
          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
          }
        }
      } catch (error) {
        console.error('JWT callback error:', error)
      }
      return token
    },

    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId
      if (token.role) session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
}
