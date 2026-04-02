import { useMemo, useCallback, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { points } from '../data/points'
import { zones } from '../data/zones'
import SearchBar from '../components/SearchBar'
import FilterTabs, { type FilterTab } from '../components/FilterTabs'
import ZoneFilter from '../components/ZoneFilter'
import PointCard from '../components/PointCard'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { scorePoint } from '../utils/searchScoring'

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { history, addSearch, clearHistory } = useSearchHistory()
  const [visibleCount, setVisibleCount] = useState(10)

  const search = searchParams.get('q') ?? ''
  const activeTab = (searchParams.get('tab') as FilterTab) || 'all'
  const selectedZone = searchParams.get('zone')
  const absoluteFilter = searchParams.get('filter') as '72' | '32' | null

  // Reset visible count when search/filter changes
  useEffect(() => {
    setVisibleCount(10)
  }, [search, activeTab, selectedZone])

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
    }, { replace: true })
  }, [setSearchParams])

  const setSearch = useCallback((v: string) => updateParams({ q: v }), [updateParams])
  const setActiveTab = useCallback((v: FilterTab) => updateParams({ tab: v === 'all' ? null : v }), [updateParams])
  const setSelectedZone = useCallback((v: string | null) => updateParams({ zone: v }), [updateParams])

  const placeholder = activeTab === 'indications'
    ? 'חיפוש לפי התוויות...'
    : activeTab === 'reactionAreas'
    ? 'חיפוש לפי אזורי תגובה...'
    : 'חיפוש לפי שם, התוויה או אזור...'

  const filtered = useMemo(() => {
    let result = points

    // Filter by absolute needle type
    if (absoluteFilter === '72' || absoluteFilter === '32') {
      result = result.filter(p => p.absoluteNeedle === absoluteFilter)
    }

    // Filter by zone
    if (selectedZone) {
      result = result.filter(p => p.zone === selectedZone)
    }

    // Filter & rank by search
    if (search.trim()) {
      const scored = result
        .map(point => ({ point, score: scorePoint(point, search, activeTab) }))
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)

      return scored.map(s => s.point)
    }

    return result
  }, [search, activeTab, selectedZone])

  // Search suggestions (top 20 matching points by id/name)
  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q || q.length < 1) return []
    return points
      .filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.zone.includes(q) ||
        p.pinyinName.toLowerCase().includes(q) ||
        p.chineseName.includes(q)
      )
      .slice(0, 20)
      .map(p => ({
        id: p.id,
        label: /^\d/.test(p.id) ? `${p.id} ${p.pinyinName.toLowerCase()}` : p.pinyinName.toLowerCase(),
        highlight: q,
      }))
  }, [search])

  // Group by zone
  const grouped = useMemo(() => {
    const groups: Record<string, typeof points> = {}
    for (const point of filtered) {
      if (!groups[point.zone]) groups[point.zone] = []
      groups[point.zone].push(point)
    }
    return groups
  }, [filtered])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-4 pt-4 pb-3">
        <h1 className="text-center text-lg font-bold tracking-wide uppercase mb-3">MASTER TUNG&#39;S POINTS</h1>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={placeholder}
          suggestions={suggestions}
          onSuggestionSelect={(id) => { addSearch(id); navigate(`/point/${id}`) }}
          searchHistory={history}
          onHistorySelect={(q) => { setSearch(q) }}
          onClearHistory={clearHistory}
        />
      </div>

      <div className="px-4 py-2 space-y-2">
        {/* Search Results — above zone grid for quick access */}
        {search.trim() && filtered.length > 0 && (
          <div className="space-y-1.5 pb-1">
            {filtered.slice(0, visibleCount).map(point => (
              <PointCard key={point.id} point={point} />
            ))}
            {filtered.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="w-full py-2.5 rounded-lg bg-teal-primary/10 dark:bg-teal-primary/20 text-teal-primary text-sm font-medium hover:bg-teal-primary/20 dark:hover:bg-teal-primary/30 transition-colors"
              >
                הצג עוד ({filtered.length - visibleCount} נקודות נוספות)
              </button>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <FilterTabs active={activeTab} onChange={setActiveTab} />

        {/* Zone Filter */}
        <ZoneFilter selected={selectedZone} onSelect={setSelectedZone} />

        {/* Results count + clear */}
        <div className="flex items-center justify-between">
          {selectedZone && (
            <button
              onClick={() => setSelectedZone(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-primary text-white text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              נקה סינון
            </button>
          )}
          <span className="text-sm text-gray-500 dark:text-dark-muted mr-auto">
            {filtered.length} נקודות נמצאו
          </span>
        </div>
      </div>

      {/* Points List */}
      <div className="px-4 pb-6 space-y-3">
        {Object.entries(grouped).map(([zoneId, zonePoints]) => {
          const zone = zones.find(z => z.id === zoneId)
          return (
            <div key={zoneId}>
              <h2 className="text-sm font-bold text-gray-500 dark:text-dark-muted mb-2">
                אזור {zoneId} — {zone?.name}
              </h2>
              <div className="space-y-2">
                {zonePoints.map(point => (
                  <PointCard key={point.id} point={point} />
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-dark-muted">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>לא נמצאו נקודות</p>
          </div>
        )}
      </div>
    </div>
  )
}
