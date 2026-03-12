import { useState, useMemo } from 'react'
import { points } from '../data/points'
import { zones } from '../data/zones'
import { flattenIndications } from '../types'
import SearchBar from '../components/SearchBar'
import FilterTabs, { type FilterTab } from '../components/FilterTabs'
import ZoneFilter from '../components/ZoneFilter'
import PointCard from '../components/PointCard'

export default function Explore() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const placeholder = activeTab === 'indications'
    ? 'חיפוש לפי התוויות...'
    : activeTab === 'reactionAreas'
    ? 'חיפוש לפי אזורי תגובה...'
    : 'חיפוש לפי שם, התוויה או אזור...'

  const filtered = useMemo(() => {
    let result = points

    // Filter by zone
    if (selectedZone) {
      result = result.filter(p => p.zone === selectedZone)
    }

    // Filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(p => {
        if (activeTab === 'indications') {
          return flattenIndications(p.indications).some(ind => ind.toLowerCase().includes(q))
        }
        if (activeTab === 'reactionAreas') {
          return p.reactionAreas.some(ra => ra.toLowerCase().includes(q))
        }
        // "all" tab — search everything
        return (
          p.id.includes(q) ||
          p.zone.includes(q) ||
          p.pinyinName.toLowerCase().includes(q) ||
          p.chineseName.includes(q) ||
          p.hebrewName.includes(q) ||
          p.englishName.toLowerCase().includes(q) ||
          flattenIndications(p.indications).some(ind => ind.toLowerCase().includes(q)) ||
          p.reactionAreas.some(ra => ra.toLowerCase().includes(q))
        )
      })
    }

    return result
  }, [search, activeTab, selectedZone])

  // Search suggestions (top 5 matching points by id/name)
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
      .slice(0, 5)
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
        <h1 className="text-lg font-bold mb-2">חקור</h1>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={placeholder}
          suggestions={suggestions}
          onSuggestionSelect={(id) => setSearch(id)}
        />
      </div>

      <div className="px-4 py-2 space-y-2">
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
          <span className="text-sm text-gray-500 mr-auto">
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
              <h2 className="text-sm font-bold text-gray-500 mb-2">
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
          <div className="text-center py-12 text-gray-400">
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
