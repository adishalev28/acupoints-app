import { useState, useRef, useEffect } from 'react'

export interface SearchSuggestion {
  id: string
  label: string
  highlight: string
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestions?: SearchSuggestion[]
  onSuggestionSelect?: (id: string) => void
}

export default function SearchBar({ value, onChange, placeholder = 'חיפוש...', suggestions = [], onSuggestionSelect }: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const highlightMatch = (text: string, query: string) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-teal-600 font-semibold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 z-10"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <input
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-y-auto max-h-48">
          {suggestions.map((s) => (
            <button
              key={s.id}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 border-b border-gray-100 last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(s.id)
                setShowSuggestions(false)
                onSuggestionSelect?.(s.id)
              }}
            >
              {highlightMatch(s.label, s.highlight)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
