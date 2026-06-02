import { NextResponse } from 'next/server'
import { syncSubmissionStatusCore } from '@/lib/actions/submission.actions'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret) {
      console.error('CRON_SECRET が設定されていません')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Bearer トークン認証
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      console.warn('Cron リクエスト認証失敗')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await syncSubmissionStatusCore()

    if (result.success) {
      console.log('Cron 実行成功:', result.message)
      return NextResponse.json({ success: true, message: result.message }, { status: 200 })
    } else {
      console.error('Cron 実行失敗:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Cron エンドポイント エラー:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
