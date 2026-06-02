'use client'

import { useState } from 'react'
import { FieldManager } from './FieldManager'
import { ManagerFieldManager } from './ManagerFieldManager'

interface Field {
  id: string
  fieldKey: string | null
  group: string
  inputType: string
  label: string
  hint: string | null
  required: boolean
  minLength: number | null
  maxLength: number | null
  isVisible: boolean
  canDelete: boolean
}

interface Props {
  fields: Field[]
}

const TABS = [
  { key: 'common', label: '共通項目' },
  { key: 'practice', label: '練習' },
  { key: 'expedition', label: '遠征・大会' },
  { key: 'manager', label: 'マネージャ用' },
]

export function FormFieldsSection({ fields }: Props) {
  const [activeTab, setActiveTab] = useState('common')

  const renderContent = () => {
    if (activeTab === 'manager') {
      return <ManagerFieldManager fields={fields} />
    }
    return <FieldManager fields={fields} activeTab={activeTab as 'common' | 'practice' | 'expedition'} />
  }

  return (
    <div>
      {/* タブ */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6 -mx-6 px-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {renderContent()}
    </div>
  )
}
