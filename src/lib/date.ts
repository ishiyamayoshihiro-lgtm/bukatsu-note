/** JST の今日の日付を UTC 午前0時の Date で返す（DBの日付型と一致させるため） */
export function todayJST(): Date {
  const str = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
  return new Date(str) // "YYYY-MM-DD" → UTC 00:00:00
}
