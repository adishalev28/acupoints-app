import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { rubricData, getPointsForIndication, getTotalIndications } from '../utils/buildRubric'
import type { RubricCategory, RubricEntry } from '../utils/buildRubric'
import PointCard from '../components/PointCard'

export default function Rubric() {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryName = searchParams.get('cat')
  const selectedIndication = searchParams.get('ind')
  const search = searchParams.get('q') ?? ''

  const selectedCategory = useMemo(() => {
    if (!categoryName) return null
    return rubricData.find(c => c.name === categoryName) ?? null
  }, [categoryName])

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      return next
    })
  }, [setSearchParams])

  const setCategory = useCallback((cat: RubricCategory | null) => {
    updateParams({ cat: cat?.name ?? null, ind: null, q: null })
  }, [updateParams])

  const setIndication = useCallback((ind: string | null) => {
    updateParams({ ind })
  }, [updateParams])

  const setSearch = useCallback((q: string) => {
    updateParams({ q: q || null })
  }, [updateParams])

  // Filter indications across all categories when searching
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null

    const results: { category: RubricCategory; entries: RubricEntry[] }[] = []
    for (const cat of rubricData) {
      const matched = cat.entries.filter(e => e.indication.toLowerCase().includes(q))
      if (matched.length > 0) {
        results.push({ category: cat, entries: matched })
      }
    }
    return results
  }, [search])

  // Points for selected indication
  const indicationPoints = useMemo(() => {
    if (!selectedIndication) return []
    return getPointsForIndication(selectedIndication)
  }, [selectedIndication])

  // --- STATE C: Points for a specific indication ---
  if (selectedIndication) {
    return (
      <div className="min-h-screen">
        <div className="bg-teal-primary text-white px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setIndication(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="חזרה"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold">רובריקה</h1>
              <p className="text-sm text-white/70 truncate">{selectedIndication}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 dark:text-dark-text flex-1 min-w-0">{selectedIndication}</h2>
            <span className="text-xs text-gray-500 dark:text-dark-muted bg-gray-100 dark:bg-dark-card px-2 py-1 rounded-full flex-shrink-0 mr-2">
              {indicationPoints.length} נקודות
            </span>
          </div>
          <div className="space-y-2">
            {indicationPoints.map(point => (
              <PointCard key={point.id} point={point} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- STATE B: Indications within a category ---
  if (selectedCategory && !search.trim()) {
    return (
      <div className="min-h-screen">
        <div className="bg-teal-primary text-white px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setCategory(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="חזרה"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">רובריקה</h1>
              <p className="text-sm text-white/70">{selectedCategory.icon} {selectedCategory.name}</p>
            </div>
          </div>
          {/* Search within category */}
          <div className="relative">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="חיפוש התוויה..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text text-sm placeholder-gray-400 dark:placeholder-dark-muted focus:outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/30"
            />
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
            {selectedCategory.entries.length} התוויות בקטגוריה
          </p>
          <div className="space-y-1">
            {selectedCategory.entries.map(entry => (
              <button
                key={entry.indication}
                onClick={() => setIndication(entry.indication)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors text-right"
              >
                <span className="text-sm text-gray-800 dark:text-dark-text flex-1">{entry.indication}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mr-2 ${selectedCategory.color.bg} ${selectedCategory.color.text} ${selectedCategory.color.darkBg} ${selectedCategory.color.darkText}`}>
                  {entry.pointIds.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- STATE A: Category list (initial) + search results ---
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-4 pt-4 pb-3">
        <h1 className="text-center text-lg font-bold tracking-wide mb-1">רובריקה</h1>
        <p className="text-center text-xs text-white/70 mb-3">
          חיפוש נקודות לפי תסמין או בעיה
        </p>
        {/* Search */}
        <div className="relative">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-dark-muted z-10"
              aria-label="נקה חיפוש"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש תסמין, כאב, בעיה..."
            className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text text-sm placeholder-gray-400 dark:placeholder-dark-muted focus:outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/30"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        {/* Search Results */}
        {searchResults ? (
          searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(({ category, entries }) => (
                <div key={category.name}>
                  <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${category.color.text} ${category.color.darkText}`}>
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className="text-xs font-normal text-gray-400">({entries.length})</span>
                  </h3>
                  <div className="space-y-1">
                    {entries.map(entry => (
                      <button
                        key={entry.indication}
                        onClick={() => setIndication(entry.indication)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors text-right"
                      >
                        <span className="text-sm text-gray-800 dark:text-dark-text flex-1">
                          {highlightText(entry.indication, search)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mr-2 ${category.color.bg} ${category.color.text} ${category.color.darkBg} ${category.color.darkText}`}>
                          {entry.pointIds.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-dark-muted">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>לא נמצאו התוויות עבור "{search}"</p>
            </div>
          )
        ) : (
          /* Category Grid */
          <>
            <p className="text-xs text-gray-500 dark:text-dark-muted mb-3 text-center">
              {getTotalIndications()} התוויות ב-{rubricData.length} קטגוריות
            </p>
            <div className="grid grid-cols-2 gap-3">
              {rubricData.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-xl border ${cat.color.border} ${cat.color.bg} ${cat.color.darkBg} hover:shadow-md transition-all text-right`}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <h3 className={`text-sm font-bold ${cat.color.text} ${cat.color.darkText}`}>{cat.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                    {cat.entries.length} התוויות
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Highlight matching text in search results */
function highlightText(text: string, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-teal-primary font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  )
}
