'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { getSheetValues, writeValues, insertColumn, insertColumnWithFormat } from '@/lib/sheets'

function toJST(date: Date) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

export type SyncResult = {
  success?: boolean
  error?: string
  message?: string
}

async function syncSubmissionStatusCore(): Promise<SyncResult> {
  try {
    const today = new Date()
    const todayJST = toJST(today)
    todayJST.setHours(0, 0, 0, 0)

    const todayStr = formatDate(todayJST)

    // 1行目を取得
    const headerRows = await getSheetValues('1:1')
    if (!headerRows || headerRows.length === 0) {
      return { error: 'Spreadsheet の 1 行目が見つかりません' }
    }

    const header = headerRows[0]
    const MARKER_COL_INDEX = 5 // F列のインデックス

    // マーカー列から右に走査して、最初の空白 = マーカー列位置を確認
    let markerColIndex = MARKER_COL_INDEX
    while (
      markerColIndex < header.length &&
      header[markerColIndex] &&
      header[markerColIndex].trim() !== ''
    ) {
      markerColIndex++
    }

    // マーカー列の右隣 = 日付を挿入する列
    const insertAtIndex = markerColIndex + 1

    // 既に今日の日付があるか確認
    let needsInsertColumn = true
    if (insertAtIndex < header.length && header[insertAtIndex] === todayStr) {
      needsInsertColumn = false
    }

    // 列挿入が必要な場合、新規列を挿入（既存の日付列があれば書式をコピー）
    if (needsInsertColumn) {
      // insertAtIndex > 6 = 既に日付列が存在する場合、前列の書式をコピー
      if (insertAtIndex > 6) {
        await insertColumnWithFormat(insertAtIndex, insertAtIndex - 1)
      } else {
        // insertAtIndex == 6 = 最初の日付列の場合、書式はコピーしない
        await insertColumn(insertAtIndex)
      }
    }

    // 日付をセルに書き込み（1行目）
    const colLetter = String.fromCharCode(65 + insertAtIndex) // A=65, B=66, ...
    await writeValues(`${colLetter}1`, [[todayStr]])

    // E列（Googleアカウント）のメールアドレス一覧を取得（2行目以降）
    const emailRows = await getSheetValues('E2:E1000')
    const emails = (emailRows || []).map((row) => row[0] || '').filter((email) => email.trim() !== '')

    // 本日の提出ログを取得
    const todayLogs = await prisma.log.findMany({
      where: { date: todayJST },
      select: { student: { select: { email: true } } },
    })

    const submittedEmails = new Set(todayLogs.map((log) => log.student.email).filter(Boolean))

    // 提出状況の配列を作成
    const submissionData = emails.map((email) => {
      return submittedEmails.has(email) ? ['1'] : ['']
    })

    // データを列に書き込み（2行目以降）
    if (submissionData.length > 0) {
      await writeValues(`${colLetter}2:${colLetter}${submissionData.length + 1}`, submissionData)
    }

    return {
      success: true,
      message: `提出状況を「${todayStr}」で同期しました（${submittedEmails.size}名提出）`,
    }
  } catch (error) {
    console.error('提出状況同期エラー:', error)
    return {
      error: error instanceof Error ? error.message : '同期に失敗しました',
    }
  }
}

export async function syncSubmissionStatus(): Promise<SyncResult> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) {
    return { error: '権限がありません' }
  }

  const result = await syncSubmissionStatusCore()

  if (result.success) {
    revalidatePath('/coach')
  }

  return result
}

export { syncSubmissionStatusCore }
