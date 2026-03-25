import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import PointCard from '../components/PointCard'
import {
  ORGAN_DEFS,
  HIERARCHY_LEVELS,
  getPointsByOrgans,
  getOrganPointCount,
  type PointWithHierarchy,
  type HierarchyLevel,
} from '../utils/reactionAreaNormalization'

export default function OrganFinder() {
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedOrgans = useMemo(() => {
    const raw = searchParams.get('organs')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])

  const selectedLevel = useMemo(() => {
    const raw = searchParams.get('level')
    return raw ? (Number(raw) as HierarchyLevel) : null
  }, [searchParams])

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

  // Get points for selected organs
  const allPoints = useMemo(() => {
    if (selectedOrgans.length === 0) return []
    return getPointsByOrgans(selectedOrgans)
  }, [selectedOrgans])

  // Filter by level if selected
  const filteredPoints = useMemo(() => {
    if (selectedLevel === null) return allPoints
    return allPoints.filter(p => p.level === selectedLevel)
  }, [allPoints, selectedLevel])

  // Group by level
  const groupedByLevel = useMemo(() => {
    const groups = new Map<HierarchyLevel | 'none', PointWithHierarchy[]>()

    for (const p of filteredPoints) {
      const key = p.level ?? 'none'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(p)
    }

    // Sort: levels 1-6, then 'none'
    const sorted: { level: HierarchyLevel | null; points: PointWithHierarchy[] }[] = []
    for (const lvl of [1, 2, 3, 4, 5, 6] as HierarchyLevel[]) {
      const key = lvl
      if (groups.has(key)) {
        // Deduplicate points by ID within each level
        const seen = new Set<string>()
        const unique = groups.get(key)!.filter(p => {
          if (seen.has(p.point.id)) return false
          seen.add(p.point.id)
          return true
        })
        sorted.push({ level: lvl, points: unique })
      }
    }
    if (groups.has('none')) {
      const seen = new Set<string>()
      const unique = groups.get('none')!.filter(p => {
        if (seen.has(p.point.id)) return false
        seen.add(p.point.id)
        return true
      })
      sorted.push({ level: null, points: unique })
    }

    return sorted
  }, [filteredPoints])

  // Count unique points
  const uniquePointCount = useMemo(() => {
    const ids = new Set(filteredPoints.map(p => p.point.id))
    return ids.size
  }, [filteredPoints])

  // Available levels for filter pills
  const availableLevels = useMemo(() => {
    const levels = new Set<HierarchyLevel>()
    for (const p of allPoints) {
      if (p.level) levels.add(p.level)
    }
    return [...levels].sort()
  }, [allPoints])

  // ─── Organ Selection Toggle ───
  const toggleOrgan = useCallback((organ: string) => {
    const current = new Set(selectedOrgans)
    if (current.has(organ)) {
      current.delete(organ)
    } else {
      current.add(organ)
    }
    const newOrgans = [...current].join(',')
    updateParams({ organs: newOrgans || null, level: null })
  }, [selectedOrgans, updateParams])

  const goBack = useCallback(() => {
    updateParams({ organs: null, level: null })
  }, [updateParams])

  // ─── STATE A: Organ Selection ───
  if (selectedOrgans.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 mb-6 text-white text-center shadow-lg">
          <div className="text-3xl mb-2">🫀</div>
          <h1 className="text-xl font-bold mb-1">חיפוש לפי איבר</h1>
          <p className="text-teal-100 text-sm">בחרו איבר אחד או יותר לצפייה בנקודות</p>
        </div>

        {/* Zang organs */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-dark-muted mb-2 px-1">איברי זאנג (יין)</h2>
          <div className="grid grid-cols-2 gap-3">
            {ORGAN_DEFS.filter(o => o.group === 'זאנג').map(organ => {
              const count = getOrganPointCount(organ.name)
              return (
                <button
                  key={organ.name}
                  onClick={() => toggleOrgan(organ.name)}
                  className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 text-center hover:border-teal-400 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-1">{organ.icon}</div>
                  <div className="font-bold text-gray-800 dark:text-dark-text">{organ.name}</div>
                  <div className="text-xs text-gray-400 dark:text-dark-muted mt-1">{count} נקודות</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Fu organs */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-dark-muted mb-2 px-1">איברי פו (יאנג)</h2>
          <div className="grid grid-cols-2 gap-3">
            {ORGAN_DEFS.filter(o => o.group === 'פו').map(organ => {
              const count = getOrganPointCount(organ.name)
              return (
                <button
                  key={organ.name}
                  onClick={() => toggleOrgan(organ.name)}
                  className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 text-center hover:border-teal-400 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-1">{organ.icon}</div>
                  <div className="font-bold text-gray-800 dark:text-dark-text">{organ.name}</div>
                  <div className="text-xs text-gray-400 dark:text-dark-muted mt-1">{count} נקודות</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Special */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-dark-muted mb-2 px-1">מיוחד</h2>
          <div className="grid grid-cols-2 gap-3">
            {ORGAN_DEFS.filter(o => o.group === 'מיוחד').map(organ => {
              const count = getOrganPointCount(organ.name)
              return (
                <button
                  key={organ.name}
                  onClick={() => toggleOrgan(organ.name)}
                  className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 text-center hover:border-teal-400 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-1">{organ.icon}</div>
                  <div className="font-bold text-gray-800 dark:text-dark-text">{organ.name}</div>
                  <div className="text-xs text-gray-400 dark:text-dark-muted mt-1">{count} נקודות</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─── STATE B/C: Points List ───
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Back button + Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-card flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
          aria-label="חזרה"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-dark-text">
            {selectedOrgans.join(' + ')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            {uniquePointCount} נקודות
          </p>
        </div>
      </div>

      {/* Multi-select: add more organs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedOrgans.map(organ => (
          <button
            key={organ}
            onClick={() => toggleOrgan(organ)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-primary/20 text-teal-700 dark:text-teal-300 text-sm font-medium border border-teal-200 dark:border-teal-primary/30"
          >
            {organ}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ))}
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-dark-muted text-sm border border-gray-200 dark:border-dark-border hover:bg-gray-200 transition-colors"
        >
          + הוסף איבר
        </button>
      </div>

      {/* Level filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => updateParams({ level: null })}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            selectedLevel === null
              ? 'bg-teal-primary text-white border-teal-primary'
              : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-teal-400'
          }`}
        >
          הכל
        </button>
        {availableLevels.map(lvl => {
          const info = HIERARCHY_LEVELS[lvl]
          return (
            <button
              key={lvl}
              onClick={() => updateParams({ level: selectedLevel === lvl ? null : String(lvl) })}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedLevel === lvl
                  ? 'bg-teal-primary text-white border-teal-primary'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-teal-400'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${info.dot}`} />
              {info.label}
            </button>
          )
        })}
      </div>

      {/* Points grouped by level */}
      <div className="space-y-6">
        {groupedByLevel.map(({ level, points }) => {
          const info = level ? HIERARCHY_LEVELS[level] : null
          return (
            <div key={level ?? 'none'}>
              {/* Level header */}
              <div className={`flex items-center gap-2 mb-3 px-1`}>
                {info ? (
                  <>
                    <span className={`w-3 h-3 rounded-full ${info.dot}`} />
                    <span className={`text-sm font-bold ${info.text} ${info.darkText}`}>
                      {info.label}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-gray-500 dark:text-dark-muted">
                    כללי
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-dark-muted">
                  ({points.length} נקודות)
                </span>
              </div>

              {/* Point cards */}
              <div className="space-y-3">
                {points.map(({ point }) => (
                  <PointCard key={point.id} point={point} />
                ))}
              </div>
            </div>
          )
        })}

        {filteredPoints.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-dark-muted">
            <div className="text-4xl mb-3">🔍</div>
            <p>לא נמצאו נקודות</p>
          </div>
        )}
      </div>
    </div>
  )
}
