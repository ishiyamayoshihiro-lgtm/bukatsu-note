'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

async function requireStaff() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) throw new Error('権限がありません')
}

function parseLen(val: FormDataEntryValue | null | string): number | null {
  const n = parseInt(val?.toString() ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

function revalidateAll() {
  revalidatePath('/coach/settings')
  revalidatePath('/student')
}

// ── FormField CRUD ────────────────────────────────────────────────────────────

export type FieldFormState = { error?: string; success?: boolean }

export async function addFormField(_prev: FieldFormState, formData: FormData): Promise<FieldFormState> {
  await requireStaff()
  const label = formData.get('label')?.toString().trim()
  if (!label) return { error: 'ラベルを入力してください' }
  const group = formData.get('group')?.toString()
  if (!['common', 'practice', 'expedition', 'manager_practice', 'manager_expedition'].includes(group ?? '')) return { error: 'グループが不正です' }
  const inputType = formData.get('inputType')?.toString() || 'textarea'
  const hint = formData.get('hint')?.toString().trim() || null
  const required = formData.get('required') === 'on'
  const hasLimit = formData.get('hasLimit') === 'on'
  const minLength = hasLimit ? parseLen(formData.get('minLength')) : null
  const maxLength = hasLimit ? parseLen(formData.get('maxLength')) : null

  const agg = await prisma.formField.aggregate({ where: { group: group! }, _max: { sortOrder: true } })
  const sortOrder = (agg._max.sortOrder ?? -1) + 1

  await prisma.formField.create({
    data: { group: group!, inputType, label, hint, required, minLength, maxLength, sortOrder, canDelete: true },
  })
  revalidateAll()
  return { success: true }
}

export async function editFormField(
  id: string,
  label: string,
  hint: string | null,
  required: boolean,
  minLength: number | null,
  maxLength: number | null,
) {
  await requireStaff()
  if (!label.trim()) throw new Error('ラベルを入力してください')
  await prisma.formField.update({ where: { id }, data: { label: label.trim(), hint, required, minLength, maxLength } })
  revalidateAll()
}

export async function moveFormField(id: string, direction: 'up' | 'down') {
  await requireStaff()
  const field = await prisma.formField.findUnique({ where: { id } })
  if (!field) return
  const all = await prisma.formField.findMany({ where: { group: field.group }, orderBy: { sortOrder: 'asc' } })
  const idx = all.findIndex((f) => f.id === id)
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= all.length) return
  await prisma.$transaction([
    prisma.formField.update({ where: { id: all[idx].id },    data: { sortOrder: all[swapIdx].sortOrder } }),
    prisma.formField.update({ where: { id: all[swapIdx].id }, data: { sortOrder: all[idx].sortOrder } }),
  ])
  revalidatePath('/coach/settings')
}

export async function deleteFormField(id: string) {
  await requireStaff()
  const field = await prisma.formField.findUnique({ where: { id } })
  if (!field) return
  if (field.fieldKey) {
    // 基本項目: 非表示化のみ（実際には削除しない）
    await prisma.formField.update({ where: { id }, data: { isVisible: false } })
  } else {
    await prisma.formField.delete({ where: { id } })
  }
  revalidateAll()
}

export async function restoreFormField(id: string) {
  await requireStaff()
  await prisma.formField.update({ where: { id }, data: { isVisible: true } })
  revalidateAll()
}

// ── Stamps ────────────────────────────────────────────────────────────────────

export type StampFormState = { error?: string; success?: boolean }

export async function addStamp(_prev: StampFormState, formData: FormData): Promise<StampFormState> {
  await requireStaff()
  const label = formData.get('label')?.toString().trim()
  if (!label) return { error: 'スタンプのラベルを入力してください' }
  const count = await prisma.stamp.count()
  await prisma.stamp.create({ data: { label, sortOrder: count } })
  revalidatePath('/coach/settings')
  return { success: true }
}

export async function editStamp(id: string, label: string) {
  await requireStaff()
  if (!label.trim()) throw new Error('スタンプのラベルを入力してください')
  await prisma.stamp.update({ where: { id }, data: { label: label.trim() } })
  revalidatePath('/coach/settings')
}

export async function moveStamp(id: string, direction: 'up' | 'down') {
  await requireStaff()
  const all = await prisma.stamp.findMany({ orderBy: { sortOrder: 'asc' } })
  const idx = all.findIndex((s) => s.id === id)
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= all.length) return
  await prisma.$transaction([
    prisma.stamp.update({ where: { id: all[idx].id },     data: { sortOrder: all[swapIdx].sortOrder } }),
    prisma.stamp.update({ where: { id: all[swapIdx].id }, data: { sortOrder: all[idx].sortOrder } }),
  ])
  revalidatePath('/coach/settings')
}

export async function deleteStamp(id: string) {
  await requireStaff()
  await prisma.stamp.delete({ where: { id } })
  revalidatePath('/coach/settings')
}

// ── Log Stamps ────────────────────────────────────────────────────────────────

export async function toggleLogStamp(logId: string, stampId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== Role.STAFF) throw new Error('権限がありません')
  const existing = await prisma.logStamp.findUnique({ where: { logId_stampId: { logId, stampId } } })
  if (existing) {
    await prisma.logStamp.delete({ where: { logId_stampId: { logId, stampId } } })
  } else {
    await prisma.logStamp.create({ data: { logId, stampId } })
  }
  revalidatePath(`/coach/logs/${logId}`)
  revalidatePath(`/student/logs/${logId}`)
}
