import { useState } from 'react'
import { zones } from '../data/zones'

interface ZoneFilterProps {
  selected: string | null
  onSelect: (zoneId: string | null) => void
}

export default function ZoneFilter({ selected, onSelect }: ZoneFilterProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm"
        aria-label="סנן לפי אזור"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-gray-800 dark:text-dark-text">
            {selected ? zones.find(z => z.id === selected)?.name : 'אזור'}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 dark:text-dark-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <div className="grid grid-cols-2 gap-2">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => {
                  onSelect(selected === zone.id ? null : zone.id)
                  setOpen(false)
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-right transition-colors ${
                  selected === zone.id
                    ? 'bg-teal-primary text-white'
                    : 'bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                <span className="font-bold">{zone.id}</span>
                <span>{zone.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
