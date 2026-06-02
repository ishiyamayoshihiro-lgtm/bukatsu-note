import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

const SHEET_NAME = '提出状況'

function getAuth(): JWT {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!clientEmail || !privateKey) {
    throw new Error('Google Cloud 認証情報が設定されていません: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY')
  }

  return new JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheets() {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

export async function getSheetValues(range: string): Promise<any[][]> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID が設定されていません')
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!${range}`,
  })

  return response.data.values || []
}

export async function writeValues(range: string, values: any[][]): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID が設定されていません')
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!${range}`,
    valueInputOption: 'RAW',
    requestBody: { values },
  })
}

export async function insertColumn(colIndex: number): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID が設定されていません')
  }

  // シート ID を取得
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === SHEET_NAME)
  const sheetId = sheet?.properties?.sheetId

  if (sheetId === undefined) {
    throw new Error(`シート「${SHEET_NAME}」が見つかりません`)
  }

  // 列挿入リクエスト
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: colIndex,
              endIndex: colIndex + 1,
            },
          },
        },
      ],
    },
  })
}

export async function insertColumnWithFormat(colIndex: number, sourceColIndex: number): Promise<void> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID が設定されていません')
  }

  // シート ID を取得
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === SHEET_NAME)
  const sheetId = sheet?.properties?.sheetId

  if (sheetId === undefined) {
    throw new Error(`シート「${SHEET_NAME}」が見つかりません`)
  }

  // 列挿入 + 書式コピー
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: colIndex,
              endIndex: colIndex + 1,
            },
          },
        },
        {
          copyPaste: {
            source: {
              sheetId,
              rowIndex: 0,
              columnIndex: sourceColIndex,
              rowSpan: 1000,
              columnSpan: 1,
            },
            destination: {
              sheetId,
              rowIndex: 0,
              columnIndex: colIndex,
            },
            pasteType: 'FORMATS',
          },
        },
      ],
    },
  })
}

export async function getSheetId(): Promise<number> {
  const sheets = getSheets()
  const spreadsheetId = process.env.SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID が設定されていません')
  }

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === SHEET_NAME)
  const sheetId = sheet?.properties?.sheetId

  if (sheetId === undefined) {
    throw new Error(`シート「${SHEET_NAME}」が見つかりません`)
  }

  return sheetId
}
