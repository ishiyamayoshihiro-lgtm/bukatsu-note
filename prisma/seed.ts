import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 最初のコーチユーザーを InvitedUser に登録（実際のメールアドレスに変更してください）
  const coachEmail = 'ishiyamayo@haguroko.ed.jp'

  // 仮のコーチユーザーを User テーブルに作成（NextAuth初回ログイン前の準備）
  const coach = await prisma.user.upsert({
    where: { email: coachEmail },
    update: {},
    create: {
      email: coachEmail,
      name: '顧問先生',
      role: Role.STAFF,
    },
  })

  // 自分自身を招待済みに登録（初回ログイン用）
  await prisma.invitedUser.upsert({
    where: { email: coachEmail },
    update: {},
    create: {
      email: coachEmail,
      invitedById: coach.id,
    },
  })

  // サンプルスケジュール
  await prisma.schedule.createMany({
    data: [
      {
        date: new Date('2025-06-01'),
        title: '春季大会',
        description: '場所: 市営体育館 / 集合時間: 8:00',
      },
      {
        date: new Date('2025-06-15'),
        title: '練習試合（vs 〇〇高校）',
        description: '相手校グラウンドにて / 集合: 9:30',
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seed completed.')
  console.log(`Coach email registered: ${coachEmail}`)
  console.log('ログイン前に .env の DATABASE_URL と Google OAuth 情報を設定してください。')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
