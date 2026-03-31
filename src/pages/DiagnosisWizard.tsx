import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { rubricData, type RubricCategory } from '../utils/buildRubric'
import { points } from '../data/points'
import { flattenIndications, type Point } from '../types'
import { getSideBadge } from '../utils/treatmentPrinciples'
import { getRootCause, getPathogenesisForSymptom, type PathogenesisMap } from '../data/pathogenesis'

type Step = 'categories' | 'symptoms' | 'rootCause' | 'results'

interface ScoredPoint {
  point: Point
  score: number
  matchedSymptoms: string[]
}

interface SelectedRoot {
  map: PathogenesisMap
  rootId: string
}

export default function DiagnosisWizard() {
  const navigate = useNavigate()

  // ── Restore state from sessionStorage (survives navigation to point pages) ──
  const savedState = useRef(() => {
    try {
      const raw = sessionStorage.getItem('diagnosis_wizard_state')
      if (raw) return JSON.parse(raw) as {
        step: Step
        categoryName: string | null
        symptoms: string[]
        rootMapSymptom: string | null
        rootId: string | null
      }
    } catch {}
    return null
  })

  const restored = savedState.current()
  const restoredCategory = restored?.categoryName
    ? rubricData.find(c => c.name === restored.categoryName) ?? null
    : null

  const [step, setStepRaw] = useState<Step>(restored?.step ?? 'categories')
  const [activeCategory, setActiveCategory] = useState<RubricCategory | null>(restoredCategory)
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(
    new Set(restored?.symptoms ?? [])
  )
  const [selectedRoot, setSelectedRoot] = useState<SelectedRoot | null>(null)
  const [symptomSearch, setSymptomSearch] = useState('')
  const [globalSearch, setGlobalSearch] = useState('')

  // ── Persist wizard state to sessionStorage ──
  const saveState = useCallback((s: Step, cat: RubricCategory | null, syms: Set<string>, root: SelectedRoot | null) => {
    try {
      sessionStorage.setItem('diagnosis_wizard_state', JSON.stringify({
        step: s,
        categoryName: cat?.name ?? null,
        symptoms: Array.from(syms),
        rootMapSymptom: root?.map.symptom ?? null,
        rootId: root?.rootId ?? null,
      }))
    } catch {}
  }, [])

  // ── Browser history sync ──
  const isPopRef = useRef(false)

  const setStep = useCallback((newStep: Step) => {
    setStepRaw(prev => {
      if (!isPopRef.current && newStep !== prev) {
        window.history.pushState({ wizardStep: newStep }, '')
      }
      isPopRef.current = false
      return newStep
    })
  }, [])

  // Save state on every change
  useEffect(() => {
    saveState(step, activeCategory, selectedSymptoms, selectedRoot)
  }, [step, activeCategory, selectedSymptoms, selectedRoot, saveState])

  useEffect(() => {
    // Push initial state
    window.history.replaceState({ wizardStep: step }, '')

    const onPopState = (e: PopStateEvent) => {
      const wizardStep = e.state?.wizardStep as Step | undefined
      if (wizardStep) {
        isPopRef.current = true
        setStepRaw(wizardStep)
        if (wizardStep === 'categories') {
          setActiveCategory(null)
          setSymptomSearch('')
          setGlobalSearch('')
        }
      } else {
        // Clear saved state when leaving the wizard
        sessionStorage.removeItem('diagnosis_wizard_state')
        navigate('/', { replace: true })
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [navigate, step])

  // ── Global search across all categories ──
  const globalSearchResults = useMemo(() => {
    if (!globalSearch || globalSearch.length < 2) return null
    const results: { category: RubricCategory; matches: typeof rubricData[0]['entries'] }[] = []
    for (const cat of rubricData) {
      const matches = cat.entries.filter(e => e.indication.includes(globalSearch))
      if (matches.length > 0) {
        results.push({ category: cat, matches })
      }
    }
    return results
  }, [globalSearch])

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
    setSymptomSearch('')
    setGlobalSearch('')
    setStep('symptoms')
  }

  function goBackToCategories() {
    setActiveCategory(null)
    setStep('categories')
  }

  function showResults() {
    // Check if any selected symptom has a pathogenesis map
    const symptoms = Array.from(selectedSymptoms)
    for (const s of symptoms) {
      const coreKeyword = s.split(/[,(\/—-]/)[0].trim()
      const map = getPathogenesisForSymptom(coreKeyword)
      if (map) {
        setSelectedRoot(null)
        setStep('rootCause')
        return
      }
    }
    setStep('results')
  }

  function selectRoot(map: PathogenesisMap, rootId: string) {
    setSelectedRoot({ map, rootId })
    setStep('results')
  }

  function skipRootCause() {
    setSelectedRoot(null)
    setStep('results')
  }

  function resetAll() {
    setSelectedSymptoms(new Set())
    setActiveCategory(null)
    setSelectedRoot(null)
    setGlobalSearch('')
    setSymptomSearch('')
    sessionStorage.removeItem('diagnosis_wizard_state')
    setStep('categories')
  }

  // Get the matching pathogenesis map for display
  const activePathMap = useMemo(() => {
    const symptoms = Array.from(selectedSymptoms)
    for (const s of symptoms) {
      const coreKeyword = s.split(/[,(\/—-]/)[0].trim()
      const map = getPathogenesisForSymptom(coreKeyword)
      if (map) return map
    }
    return null
  }, [selectedSymptoms])

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
            {/* Global search */}
            <div className="relative">
              <input
                type="text"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder="חפש בעיה... (למשל: מיגרנה, סיאטיקה, עצירות)"
                className="w-full py-3 px-4 pr-10 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-800 dark:text-dark-text text-right placeholder:text-gray-400 dark:placeholder:text-dark-muted focus:outline-none focus:border-teal-primary"
              />
              <svg className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 right-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results */}
            {globalSearchResults ? (
              globalSearchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 dark:text-dark-muted text-right">
                    נמצאו {globalSearchResults.reduce((sum, r) => sum + r.matches.length, 0)} תוצאות ב-{globalSearchResults.length} קטגוריות
                  </p>
                  {globalSearchResults.map(({ category, matches }) => (
                    <div key={category.name} className={`rounded-xl border overflow-hidden ${category.color.border} ${category.color.darkBg}`}>
                      <div className={`flex items-center gap-2 px-4 py-2.5 ${category.color.bg}`}>
                        <span className="text-lg">{category.icon}</span>
                        <span className={`text-sm font-bold ${category.color.text} ${category.color.darkText}`}>{category.name}</span>
                        <span className="text-xs text-gray-500 dark:text-dark-muted mr-auto">{matches.length} תוצאות</span>
                      </div>
                      <div className="bg-white dark:bg-dark-card divide-y divide-gray-50 dark:divide-dark-border">
                        {matches.slice(0, 5).map(entry => {
                          const isSelected = selectedSymptoms.has(entry.indication)
                          return (
                            <button
                              key={entry.indication}
                              onClick={() => toggleSymptom(entry.indication)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-right transition-colors
                                ${isSelected ? 'bg-teal-50 dark:bg-teal-primary/20' : 'hover:bg-gray-50 dark:hover:bg-dark-card'}`}
                            >
                              <span className="text-xs text-gray-400 dark:text-dark-muted shrink-0">{entry.pointIds.length} נק׳</span>
                              <span className="flex-1 text-sm text-gray-800 dark:text-dark-text">{entry.indication}</span>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                                ${isSelected ? 'bg-teal-primary border-teal-primary' : 'border-gray-300 dark:border-dark-border'}`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          )
                        })}
                        {matches.length > 5 && (
                          <button
                            onClick={() => { setActiveCategory(category); setSymptomSearch(globalSearch); setGlobalSearch(''); setStep('symptoms') }}
                            className={`w-full py-2 text-center text-xs font-medium ${category.color.text} ${category.color.darkText} hover:opacity-70`}
                          >
                            הצג עוד {matches.length - 5} תוצאות ב{category.name} ←
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 dark:text-dark-muted py-8 text-sm">
                  לא נמצאו סימפטומים עבור "{globalSearch}"
                </div>
              )
            ) : (
              /* Default: category grid */
              <>
                <p className="text-sm text-gray-500 dark:text-dark-muted text-right px-1">
                  או בחר קטגוריה:
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
              </>
            )}
          </div>
        )}

        {/* Step 2: Symptom selection */}
        {step === 'symptoms' && activeCategory && (() => {
          const filteredEntries = symptomSearch
            ? activeCategory.entries.filter(e => e.indication.includes(symptomSearch))
            : activeCategory.entries
          return (
          <div className="space-y-3">
            {/* Category tabs - horizontal scroll */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {rubricData.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { setActiveCategory(cat); setSymptomSearch('') }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-colors
                    ${cat.name === activeCategory.name
                      ? `${cat.color.bg} ${cat.color.text} ${cat.color.border} ${cat.color.darkBg} ${cat.color.darkText}`
                      : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:border-gray-300'
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Search field */}
            <div className="relative">
              <input
                type="text"
                value={symptomSearch}
                onChange={e => setSymptomSearch(e.target.value)}
                placeholder="חפש סימפטום..."
                className="w-full py-2.5 px-4 pr-10 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-800 dark:text-dark-text text-right placeholder:text-gray-400 dark:placeholder:text-dark-muted focus:outline-none focus:border-teal-primary"
              />
              <svg className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 right-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {symptomSearch && (
                <button
                  onClick={() => setSymptomSearch('')}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Symptom count */}
            <div className="text-xs text-gray-400 dark:text-dark-muted text-right">
              {filteredEntries.length} סימפטומים{symptomSearch ? ` (מסונן מתוך ${activeCategory.entries.length})` : ''}
            </div>

            <div className="space-y-1.5">
              {filteredEntries.map(entry => {
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
              {filteredEntries.length === 0 && (
                <div className="text-center text-gray-400 dark:text-dark-muted py-8 text-sm">
                  לא נמצאו סימפטומים עבור "{symptomSearch}"
                </div>
              )}
            </div>
          </div>
          )
        })()}

        {/* Step 2.5: Root Cause Selection */}
        {step === 'rootCause' && activePathMap && (
          <div className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3 justify-end">
                <div>
                  <h2 className="font-bold text-amber-900 dark:text-amber-100 text-lg">🌳 אבחון שורש המחלה</h2>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {activePathMap.icon} {activePathMap.symptom} - {activePathMap.question}
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3 text-right">
                אותו סימפטום יכול לנבוע משורשים שונים. בחר את השורש לפי הסימנים של המטופל:
              </p>

              <div className="space-y-2">
                {activePathMap.roots.map(root => {
                  const rootInfo = getRootCause(root.rootId)
                  if (!rootInfo) return null
                  return (
                    <button
                      key={root.rootId}
                      onClick={() => selectRoot(activePathMap, root.rootId)}
                      className="w-full text-right p-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-dark-card hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
                    >
                      <div className="flex items-start gap-2 justify-end">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 dark:text-dark-text text-sm flex items-center gap-1.5 justify-end">
                            {rootInfo.name}
                            {rootInfo.phase && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                {rootInfo.phase}
                              </span>
                            )}
                            {root.priority === 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                נפוץ
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-dark-muted mt-0.5">{rootInfo.description.slice(0, 80)}...</p>
                          {rootInfo.signs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 justify-end">
                              {rootInfo.signs.slice(0, 4).map(s => (
                                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {root.daoMa && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                              🐴 {root.daoMa} • {root.pointIds.length} נקודות
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={skipRootCause}
                className="w-full mt-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted text-sm hover:bg-gray-50 dark:hover:bg-dark-card transition-colors"
              >
                דלג - הצג את כל הנקודות
              </button>
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

            {/* Root cause protocol card */}
            {selectedRoot && (() => {
              const rootInfo = getRootCause(selectedRoot.rootId)
              const rootData = selectedRoot.map.roots.find(r => r.rootId === selectedRoot.rootId)
              if (!rootInfo || !rootData) return null
              return (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 space-y-2 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <h3 className="font-bold text-amber-900 dark:text-amber-100">
                      🎯 פרוטוקול: {selectedRoot.map.symptom} - {rootInfo.name}
                    </h3>
                  </div>
                  {rootInfo.phase && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 text-right">
                      פאזה: {rootInfo.phase} | איבר: {rootInfo.organ || 'כללי'}
                    </div>
                  )}
                  <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed text-right">{rootData.protocol}</p>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {rootData.pointIds.map(pid => (
                      <Link
                        key={pid}
                        to={`/point/${pid}`}
                        className="text-xs px-2 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-800/40 text-amber-900 dark:text-amber-100 font-mono font-bold hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
                      >
                        {pid}
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-amber-600 dark:text-amber-400 pt-1 justify-end">
                    {rootData.needleSide && (
                      <span>↔️ {rootData.needleSide === 'contralateral' ? 'צד נגדי' : rootData.needleSide === 'bilateral' ? 'דו-צדדי' : 'אותו צד'}</span>
                    )}
                    {rootData.daoMa && <span>🐴 {rootData.daoMa}</span>}
                  </div>
                </div>
              )
            })()}

            {/* Treatment principles banner */}
            {scoredPoints.length > 0 && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 space-y-1 text-right">
                <div className="font-bold flex items-center gap-1.5 justify-end">
                  עקרונות בחירת צד <span>📐</span>
                </div>
                <div>↔️ <strong>צד נגדי:</strong> כאב בימין → דקור בשמאל (ולהפך)</div>
                <div>↕️ <strong>למעלה↔למטה:</strong> כאב מעל הטבור → דקור ברגליים | כאב מתחת → דקור בידיים</div>
                <div>⚠️ <strong>ביטוי חיצוני גובר</strong> על כל הכללים — תמיד דקור במקום שבו מופיע הביטוי</div>
              </div>
            )}

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
                    <div className="flex items-start gap-3 flex-row-reverse">
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
                        <div className="text-xs text-gray-500 dark:text-dark-muted mt-1 flex items-center gap-2 justify-end flex-wrap">
                          <span>אזור {point.zone} · {point.pinyinName}</span>
                          {(() => {
                            const badge = getSideBadge(point)
                            return (
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${badge.color}`}>
                                {badge.emoji} {badge.text}
                              </span>
                            )
                          })()}
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
