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
  searchHistory?: string[]
  onHistorySelect?: (query: string) => void
  onClearHistory?: () => void
}

export default function SearchBar({
  value, onChange, placeholder = 'חיפוש...',
  suggestions = [], onSuggestionSelect,
  searchHistory = [], onHistorySelect, onClearHistory
}: SearchBarProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
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

  const hasSuggestions = suggestions.length > 0
  const showHistory = !hasSuggestions && !value.trim() && searchHistory.length > 0

  return (
    <div className="relative" ref={wrapperRef}>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted z-10"
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
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-dark-muted dark:hover:text-dark-text z-10"
          aria-label="נקה חיפוש"
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
          setShowDropdown(true)
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text text-sm placeholder-gray-400 dark:placeholder-dark-muted focus:outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/30"
      />

      {/* Suggestions dropdown */}
      {showDropdown && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border z-50 overflow-y-auto max-h-48">
          {suggestions.map((s) => (
            <button
              key={s.id}
              className="w-full text-right px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text hover:bg-teal-50 dark:hover:bg-teal-primary/10 border-b border-gray-100 dark:border-dark-border last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(s.id)
                setShowDropdown(false)
                onSuggestionSelect?.(s.id)
              }}
            >
              {highlightMatch(s.label, s.highlight)}
            </button>
          ))}
        </div>
      )}

      {/* Search history dropdown */}
      {showDropdown && showHistory && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border z-50 overflow-y-auto max-h-48">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-dark-border">
            <span className="text-xs text-gray-400 dark:text-dark-muted">חיפושים אחרונים</span>
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                onClearHistory?.()
              }}
              className="text-xs text-teal-primary hover:text-teal-dark"
            >
              נקה הכל
            </button>
          </div>
          {searchHistory.map((q, i) => (
            <button
              key={i}
              className="w-full text-right px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text hover:bg-teal-50 dark:hover:bg-teal-primary/10 border-b border-gray-100 dark:border-dark-border last:border-b-0 flex items-center gap-2"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(q)
                setShowDropdown(false)
                onHistorySelect?.(q)
              }}
            >
              <svg className="w-4 h-4 text-gray-400 dark:text-dark-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{q}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
