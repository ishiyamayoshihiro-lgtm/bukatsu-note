import { prisma } from '@/lib/prisma'

export type FieldGroup = 'common' | 'practice' | 'expedition' | 'manager_practice' | 'manager_expedition'

export interface BaseFieldDef {
  fieldKey: string
  group: FieldGroup
  inputType: string
  label: string
  hint?: string
  required: boolean
  canDelete: boolean
  sortOrder: number
}

export const BASE_FIELDS: BaseFieldDef[] = [
  // 共通
  { fieldKey: 'sleepTime',               group: 'common',     inputType: 'number',    label: '睡眠時間 (時間)',               required: true,  canDelete: false, sortOrder: 0 },
  { fieldKey: 'injury',                  group: 'common',     inputType: 'checkbox',  label: '怪我',                          required: false, canDelete: true,  sortOrder: 1 },
  { fieldKey: 'fatigue',                 group: 'common',     inputType: 'rating5',   label: '疲労度',                        required: true,  canDelete: false, sortOrder: 2 },
  { fieldKey: 'mental',                  group: 'common',     inputType: 'rating5m',  label: 'メンタル',                      required: true,  canDelete: false, sortOrder: 3 },
  { fieldKey: 'selfScore',               group: 'common',     inputType: 'score10',   label: '今回の自己評価',  hint: '10点満点で今日の自分を採点してください', required: false, canDelete: true, sortOrder: 4 },
  // 練習
  { fieldKey: 'trainingContent_practice', group: 'practice',  inputType: 'textarea',  label: '練習内容',                      required: true,  canDelete: false, sortOrder: 0 },
  { fieldKey: 'reflection_practice',      group: 'practice',  inputType: 'textarea',  label: '反省',                          required: true,  canDelete: false, sortOrder: 1 },
  { fieldKey: 'task_practice',            group: 'practice',  inputType: 'textarea',  label: '明日への課題',                  required: true,  canDelete: false, sortOrder: 2 },
  // 遠征・大会
  { fieldKey: 'opponent',                group: 'expedition', inputType: 'text',      label: '対戦相手',                      required: true,  canDelete: true,  sortOrder: 0 },
  { fieldKey: 'trainingContent_expedition', group: 'expedition', inputType: 'textarea', label: '今回の遠征の目標',             required: true,  canDelete: false, sortOrder: 1 },
  { fieldKey: 'goodPoints',              group: 'expedition', inputType: 'textarea',  label: '良かった・頑張れた点',          required: true,  canDelete: false, sortOrder: 2 },
  { fieldKey: 'reflection_expedition',   group: 'expedition', inputType: 'textarea',  label: '反省',                          required: true,  canDelete: false, sortOrder: 3 },
  { fieldKey: 'task_expedition',         group: 'expedition', inputType: 'textarea',  label: '次の遠征までの課題',            required: true,  canDelete: false, sortOrder: 4 },
]

export const MANAGER_BASE_FIELDS: BaseFieldDef[] = [
  // マネージャ練習用
  { fieldKey: 'mgr_observationNote',  group: 'manager_practice', inputType: 'textarea', label: '練習観察メモ',      hint: '今日の練習全体の様子・気になった点', required: true, canDelete: false, sortOrder: 0 },
  { fieldKey: 'mgr_improvement',      group: 'manager_practice', inputType: 'textarea', label: '気づき・改善提案',  hint: '練習を通じて気づいたこと', required: true, canDelete: false, sortOrder: 1 },
  { fieldKey: 'mgr_nextAction',       group: 'manager_practice', inputType: 'textarea', label: '明日への申し送り',  hint: '次回の練習までに準備・確認すること', required: true, canDelete: false, sortOrder: 2 },
  // マネージャ遠征用
  { fieldKey: 'mgr_exp_observationNote', group: 'manager_expedition', inputType: 'textarea', label: '遠征・試合の記録', hint: '試合経過・スコア・出場選手メモなど', required: true, canDelete: false, sortOrder: 0 },
  { fieldKey: 'mgr_exp_support',      group: 'manager_expedition', inputType: 'textarea', label: 'サポート内容・反省',  hint: 'サポート面での良かった点・反省点', required: true, canDelete: false, sortOrder: 1 },
  { fieldKey: 'mgr_exp_nextAction',   group: 'manager_expedition', inputType: 'textarea', label: '次回への申し送り',   hint: '次の遠征・大会に向けて準備すること', required: true, canDelete: false, sortOrder: 2 },
]

export const INPUT_TYPE_LABELS: Record<string, string> = {
  textarea:  'テキスト',
  score10:   '10段階評価',
  text:      'テキスト（1行）',
  number:    '数値',
  checkbox:  'チェック',
  rating5:   '5段階評価',
  rating5m:  '5段階評価',
}

export const CUSTOM_INPUT_TYPES = [
  { value: 'textarea', label: 'テキスト（複数行）' },
  { value: 'score10',  label: '10段階評価' },
]

export async function ensureBaseFields() {
  const existing = await prisma.formField.findMany({ where: { fieldKey: { not: null } }, select: { fieldKey: true } })
  const existingKeys = new Set(existing.map((f) => f.fieldKey))
  const missing = BASE_FIELDS.filter((f) => !existingKeys.has(f.fieldKey))
  if (missing.length === 0) return
  await prisma.formField.createMany({
    data: missing.map((f) => ({
      fieldKey:  f.fieldKey,
      group:     f.group,
      inputType: f.inputType,
      label:     f.label,
      hint:      f.hint ?? null,
      required:  f.required,
      canDelete: f.canDelete,
      sortOrder: f.sortOrder,
      isVisible: true,
    })),
    skipDuplicates: true,
  })
}

export async function ensureManagerBaseFields() {
  const existing = await prisma.formField.findMany({ where: { fieldKey: { not: null } }, select: { fieldKey: true } })
  const existingKeys = new Set(existing.map((f) => f.fieldKey))
  const missing = MANAGER_BASE_FIELDS.filter((f) => !existingKeys.has(f.fieldKey))
  if (missing.length === 0) return
  await prisma.formField.createMany({
    data: missing.map((f) => ({
      fieldKey:  f.fieldKey,
      group:     f.group,
      inputType: f.inputType,
      label:     f.label,
      hint:      f.hint ?? null,
      required:  f.required,
      canDelete: f.canDelete,
      sortOrder: f.sortOrder,
      isVisible: true,
    })),
    skipDuplicates: true,
  })
}
