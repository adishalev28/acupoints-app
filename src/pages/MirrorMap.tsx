import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BODY_AREAS, getMirrorResults, DIRECTIONAL_RULES, type BodyArea, type MirrorResult } from '../data/mirrorMap'

const GROUP_LABELS: Record<string, { name: string; icon: string }> = {
  upper: { name: 'גפה עליונה', icon: '💪' },
  lower: { name: 'גפה תחתונה', icon: '🦵' },
  torso: { name: 'גזע וראש', icon: '🧠' },
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; darkBg: string; darkBorder: string; darkText: string }> = {
  contralateral: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/20', darkBorder: 'dark:border-blue-800', darkText: 'dark:text-blue-300' },
  upperLower:    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/20', darkBorder: 'dark:border-purple-800', darkText: 'dark:text-purple-300' },
  torso:         { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', darkBg: 'dark:bg-amber-900/20', darkBorder: 'dark:border-amber-800', darkText: 'dark:text-amber-300' },
}

export default function MirrorMap() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('area')
  const [showDirectional, setShowDirectional] = useState(false)

  const selectedArea = useMemo(
    () => BODY_AREAS.find(a => a.id === selectedId) ?? null,
    [selectedId]
  )

  const results = useMemo(
    () => selectedId ? getMirrorResults(selectedId) : [],
    [selectedId]
  )

  const grouped = useMemo(() => {
    const groups: Record<string, BodyArea[]> = { upper: [], lower: [], torso: [] }
    for (const area of BODY_AREAS) {
      groups[area.group].push(area)
    }
    return groups
  }, [])

  function selectArea(id: string) {
    setSearchParams({ area: id })
  }

  function clearSelection() {
    setSearchParams({})
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="text-left">
            <h1 className="text-2xl font-bold">מפת הדמיה</h1>
            <p className="text-teal-100 text-sm">הולוגרפיה &bull; מאסטר דונג</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Selection state */}
        {selectedArea ? (
          <>
            {/* Selected area pill */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-4 mb-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={clearSelection}
                  className="text-sm text-teal-primary hover:underline"
                >
                  שנה בחירה
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedArea.emoji}</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-dark-text">{selectedArea.name}</div>
                    <div className="text-xs text-gray-500 dark:text-dark-muted">
                      {selectedArea.group === 'upper' ? 'גפה עליונה' : selectedArea.group === 'lower' ? 'גפה תחתונה' : 'גזע'}
                      {' · '}
                      אזורים: {selectedArea.zones.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-500 dark:text-dark-muted px-1">
                  אפשרויות הדמיה ({results.length})
                </h2>
                {results.map((r, i) => (
                  <MirrorResultCard key={i} result={r} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 dark:text-dark-muted py-12">
                אין הדמיות זמינות לאזור זה
              </div>
            )}

            {/* Directional rules */}
            <div className="mt-6">
              <button
                onClick={() => setShowDirectional(!showDirectional)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"
              >
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${showDirectional ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-dark-text">כללי כיוון</span>
                  <span>🧭</span>
                </div>
              </button>
              {showDirectional && (
                <div className="mt-2 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-dark-muted text-right mb-3">
                    הצד של אזור הבעיה קובע את הצד שבו נדקור:
                  </p>
                  {DIRECTIONAL_RULES.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 text-right">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800 dark:text-dark-text">
                          {rule.direction} {rule.arrow} {rule.mirror}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                          {rule.example}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-teal-light dark:bg-teal-primary/20 flex items-center justify-center text-teal-primary text-sm font-bold shrink-0">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Area selection grid */
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-4">
              <p className="text-sm text-gray-600 dark:text-dark-muted text-right">
                בחר את האזור הבעייתי — ותקבל את כל אפשרויות ההדמיה לדיקור
              </p>
            </div>

            {(['upper', 'lower', 'torso'] as const).map(group => (
              <div key={group}>
                <h2 className="text-sm font-bold text-gray-500 dark:text-dark-muted mb-2 px-1 flex items-center justify-end gap-1.5">
                  {GROUP_LABELS[group].name}
                  <span>{GROUP_LABELS[group].icon}</span>
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {grouped[group].map(area => (
                    <button
                      key={area.id}
                      onClick={() => selectArea(area.id)}
                      className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border hover:border-teal-primary/40 hover:bg-teal-50/30 dark:hover:bg-teal-primary/10 active:bg-teal-50 transition-colors"
                    >
                      <span className="text-xl">{area.emoji}</span>
                      <span className="text-xs font-medium text-gray-800 dark:text-dark-text">{area.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ───────────────────────────────────────
// Mirror Result Card
// ───────────────────────────────────────

function MirrorResultCard({ result }: { result: MirrorResult }) {
  const colors = TYPE_COLORS[result.type] ?? TYPE_COLORS.contralateral

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.darkBorder} ${colors.bg} ${colors.darkBg} overflow-hidden`}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-end gap-2 mb-1">
          <span className={`font-bold ${colors.text} ${colors.darkText}`}>{result.typeName}</span>
          <span className="text-lg">{result.typeIcon}</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-dark-muted text-right">{result.description}</p>
      </div>

      {/* Standard mirror */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-end gap-2">
          <div className="text-right flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
              {result.standard.target.emoji} {result.standard.target.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-dark-muted">{result.standard.note}</div>
          </div>
          <div className="w-6 h-6 rounded-full bg-white dark:bg-dark-card flex items-center justify-center text-xs font-bold text-teal-primary border border-gray-200 dark:border-dark-border">
            ✓
          </div>
        </div>
        {result.standard.target.zones.length > 0 && (
          <div className="flex gap-1.5 mt-2 justify-end">
            {result.standard.target.zones.map(z => (
              <Link
                key={z}
                to={`/explore?zone=${z}`}
                className="text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-teal-primary hover:bg-white dark:hover:bg-dark-border transition-colors"
              >
                אזור {z}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Inverse mirror */}
      {result.inverse && (
        <div className="px-4 py-2 border-t border-gray-200/50 dark:border-dark-border/50">
          <div className="flex items-center justify-end gap-2">
            <div className="text-right flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                {result.inverse.target.emoji} {result.inverse.target.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-dark-muted">{result.inverse.note}</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white dark:bg-dark-card flex items-center justify-center text-xs text-gray-400 border border-gray-200 dark:border-dark-border">
              ↻
            </div>
          </div>
          {result.inverse.target.zones.length > 0 && (
            <div className="flex gap-1.5 mt-2 justify-end">
              {result.inverse.target.zones.map(z => (
                <Link
                  key={z}
                  to={`/explore?zone=${z}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-teal-primary hover:bg-white dark:hover:bg-dark-border transition-colors"
                >
                  אזור {z}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
