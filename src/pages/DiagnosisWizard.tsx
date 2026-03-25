import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { rubricData, type RubricCategory } from '../utils/buildRubric'
import { points } from '../data/points'
import { flattenIndications, type Point } from '../types'

type Step = 'categories' | 'symptoms' | 'results'

interface ScoredPoint {
  point: Point
  score: number
  matchedSymptoms: string[]
}

export default function DiagnosisWizard() {
  const [step, setStep] = useState<Step>('categories')
  const [activeCategory, setActiveCategory] = useState<RubricCategory | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set())

  // ── Scored results ──
  // Uses broad substring matching: if a symptom like "סיאטיקה" is selected,
  // ANY point whose indications contain "סיאטיקה" is included (not just exact matches).
  const scoredPoints = useMemo(() => {
    if (selectedSymptoms.size === 0) return []

    // Extract core search term from each symptom (strip common suffixes/prefixes for broader matching)
    const symptomKeywords = Array.from(selectedSymptoms).map(s => {
      // Use the main keyword — first word or the whole thing if short
      return s.trim()
    })

    // Score each point by checking all its indications against selected symptoms
    const pointScores = new Map<string, { score: number; matched: string[] }>()

    for (const point of points) {
      const allIndications = flattenIndications(point.indications).join(' ')

      for (let i = 0; i < symptomKeywords.length; i++) {
        const symptom = symptomKeywords[i]
        // Extract core keyword from the symptom for substring matching
        // e.g. "סיאטיקה (חוסר ריאה)" → match any indication containing "סיאטיקה"
        const coreKeyword = symptom.split(/[,(\/—]/)[0].trim()

        if (coreKeyword && allIndications.includes(coreKeyword)) {
          const existing = pointScores.get(point.id) ?? { score: 0, matched: [] }
          const originalSymptom = Array.from(selectedSymptoms)[i]
          if (!existing.matched.includes(originalSymptom)) {
            existing.score++
            existing.matched.push(originalSymptom)
          }
          pointScores.set(point.id, existing)
        }
      }
    }

    // Build scored array
    const results: ScoredPoint[] = []
    for (const [pid, { score, matched }] of pointScores) {
      const point = points.find(p => p.id === pid)
      if (point) results.push({ point, score, matchedSymptoms: matched })
    }

    // Sort: highest score first, then by point ID
    results.sort((a, b) => b.score - a.score || a.point.id.localeCompare(b.point.id))
    return results
  }, [selectedSymptoms])

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms(prev => {
      const next = new Set(prev)
      if (next.has(symptom)) next.delete(symptom)
      else next.add(symptom)
      return next
    })
  }

  function removeSymptom(symptom: string) {
    setSelectedSymptoms(prev => {
      const next = new Set(prev)
      next.delete(symptom)
      return next
    })
  }

  function openCategory(cat: RubricCategory) {
    setActiveCategory(cat)
    setStep('symptoms')
  }

  function goBackToCategories() {
    setActiveCategory(null)
    setStep('categories')
  }

  function showResults() {
    setStep('results')
  }

  function resetAll() {
    setSelectedSymptoms(new Set())
    setActiveCategory(null)
    setStep('categories')
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="text-left">
            <h1 className="text-2xl font-bold">אבחון קליני</h1>
            <p className="text-teal-100 text-sm">בחר סימפטומים → קבל המלצת נקודות</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Selected symptoms bar (always visible when > 0) */}
        {selectedSymptoms.size > 0 && (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <button onClick={resetAll} className="text-xs text-red-500 hover:underline">נקה הכל</button>
              <div className="text-sm font-bold text-gray-700 dark:text-dark-text">
                {selectedSymptoms.size} סימפטומים נבחרו
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {Array.from(selectedSymptoms).map(s => (
                <button
                  key={s}
                  onClick={() => removeSymptom(s)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-primary/20 text-teal-primary border border-teal-200 dark:border-teal-primary/30"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {s.length > 30 ? s.slice(0, 30) + '…' : s}
                </button>
              ))}
            </div>
            {step !== 'results' && (
              <button
                onClick={showResults}
                className="w-full mt-3 py-2.5 rounded-xl bg-teal-primary text-white font-bold text-sm hover:bg-teal-dark transition-colors"
              >
                הצג תוצאות ({selectedSymptoms.size})
              </button>
            )}
          </div>
        )}

        {/* Step 1: Categories */}
        {step === 'categories' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-dark-muted text-right px-1">
              בחר קטגוריה כדי לבחור סימפטומים
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {rubricData.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => openCategory(cat)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-right transition-colors
                    ${cat.color.bg} ${cat.color.border} ${cat.color.darkBg}
                    hover:opacity-80 active:opacity-70`}
                >
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${cat.color.text} ${cat.color.darkText}`}>{cat.name}</div>
                    <div className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{cat.entries.length} סימפטומים</div>
                  </div>
                  <span className="text-2xl">{cat.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Symptom selection */}
        {step === 'symptoms' && activeCategory && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={goBackToCategories}
                className="text-sm text-teal-primary hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                הוסף מקטגוריה נוספת
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${activeCategory.color.text} ${activeCategory.color.darkText}`}>
                  {activeCategory.name}
                </span>
                <span className="text-xl">{activeCategory.icon}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {activeCategory.entries.map(entry => {
                const isSelected = selectedSymptoms.has(entry.indication)
                return (
                  <button
                    key={entry.indication}
                    onClick={() => toggleSymptom(entry.indication)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-colors
                      ${isSelected
                        ? 'bg-teal-50 dark:bg-teal-primary/20 border-teal-300 dark:border-teal-primary/40'
                        : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-dark-border'
                      }`}
                  >
                    <span className="text-xs text-gray-400 dark:text-dark-muted shrink-0">
                      {entry.pointIds.length} נק׳
                    </span>
                    <span className="flex-1 text-sm text-gray-800 dark:text-dark-text">{entry.indication}</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isSelected
                        ? 'bg-teal-primary border-teal-primary'
                        : 'border-gray-300 dark:border-dark-border'
                      }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={goBackToCategories}
                className="text-sm text-teal-primary hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                הוסף סימפטומים
              </button>
              <h2 className="text-sm font-bold text-gray-500 dark:text-dark-muted">
                {scoredPoints.length} נקודות מתאימות
              </h2>
            </div>

            {scoredPoints.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-dark-muted py-12">
                לא נמצאו נקודות מתאימות
              </div>
            ) : (
              <div className="space-y-2">
                {scoredPoints.map(({ point, score, matchedSymptoms }) => (
                  <Link
                    key={point.id}
                    to={`/point/${point.id}`}
                    className="block bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 hover:border-teal-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Score badge */}
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-teal-primary/10 dark:bg-teal-primary/20 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-teal-primary">{score}</span>
                        <span className="text-[9px] text-teal-primary/70">מתוך {selectedSymptoms.size}</span>
                      </div>

                      {/* Point info */}
                      <div className="flex-1 text-right min-w-0">
                        <div className="flex items-center gap-2 justify-end">
                          {point.absoluteNeedle === '72' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">🥇</span>
                          )}
                          {point.absoluteNeedle === '32' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">🥈</span>
                          )}
                          <span className="font-bold text-gray-900 dark:text-dark-text">{point.hebrewName || point.pinyinName}</span>
                          <span className="text-xs font-mono text-teal-primary bg-teal-50 dark:bg-teal-primary/20 px-1.5 py-0.5 rounded">
                            {point.id}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                          אזור {point.zone} · {point.pinyinName}
                        </div>
                        {/* Matched symptoms */}
                        <div className="flex flex-wrap gap-1 mt-2 justify-end">
                          {matchedSymptoms.map(s => (
                            <span
                              key={s}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-primary/10 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-primary/20"
                            >
                              {s.length > 25 ? s.slice(0, 25) + '…' : s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
