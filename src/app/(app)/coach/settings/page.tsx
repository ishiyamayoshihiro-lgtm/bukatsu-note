import { prisma } from '@/lib/prisma'
import { FormFieldsSection } from '@/components/coach/FormFieldsSection'
import { StampManager } from '@/components/coach/StampManager'
import { ensureBaseFields, ensureManagerBaseFields } from '@/lib/fieldDefaults'

export default async function CoachSettingsPage() {
  await Promise.all([ensureBaseFields(), ensureManagerBaseFields()])

  const [fields, stamps] = await Promise.all([
    prisma.formField.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.stamp.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>

      <section className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">日誌フォームの項目</h2>
          <p className="text-sm text-gray-500 mt-1">
            日誌フォームの項目を管理します
          </p>
        </div>
        <FormFieldsSection fields={fields} />
      </section>

      <section className="card">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">スタンプ</h2>
          <p className="text-sm text-gray-500 mt-1">
            日誌詳細画面でワンタップで付与できます。部員にも表示されます
          </p>
        </div>
        <StampManager stamps={stamps} />
      </section>
    </div>
  )
}
