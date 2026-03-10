export type FilterTab = 'all' | 'indications' | 'reactionAreas'

interface FilterTabsProps {
  active: FilterTab
  onChange: (tab: FilterTab) => void
}

const tabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'indications', label: 'התוויות' },
  { id: 'reactionAreas', label: 'אזורי תגובה' },
]

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === tab.id
              ? 'bg-teal-primary text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
