import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { points } from '../data/points'
import { type Point } from '../types'
import { organProfiles, tissueOrganMap, getOrganProfile, type OrganProfile } from '../data/organTherapy'
import { daoMaClinicalGroups, organToDaoMa } from '../data/daoMaGroups'
import { getPointsByOrgan } from '../utils/reactionAreaNormalization'
import { getSideBadge } from '../utils/treatmentPrinciples'
import { rubricData } from '../utils/buildRubric'

// ── Types ──

type Path = 'choose' | 'direct' | 'guided'

// Direct path steps
type DirectStep = 'organs' | 'results'

// Guided path steps
type GuidedStep = 'symptom' | 'tissue' | 'location' | 'palm' | 'results'

interface LocationChoice {
  vertical: 'upper' | 'lower' | null
  side: 'right' | 'left' | 'bilateral' | null
}

interface PointResult {
  point: Point
  reasons: { icon: string; text: string; priority: number }[]
  totalPriority: number
}

// ── Main Component ──

export default function SmartDiagnosis() {
  const navigate = useNavigate()

  // ── Restore state from sessionStorage on mount ──
  const restored = useRef(() => {
    try {
      const raw = sessionStorage.getItem('smart_diag_state')
      if (raw) {
        const s = JSON.parse(raw)
        if (s.path && s.path !== 'choose') return s
      }
    } catch {}
    return null
  }).current()

  // Path selection
  const [path, setPath] = useState<Path>(restored?.path ?? 'choose')

  // Direct path state
  const [directStep, setDirectStep] = useState<DirectStep>(restored?.directStep ?? 'organs')
  const [selectedOrgan, setSelectedOrgan] = useState<OrganProfile | null>(
    restored?.selectedOrganId ? getOrganProfile(restored.selectedOrganId) ?? null : null
  )
  const [conditionType, setConditionType] = useState<'deficiency' | 'excess' | 'stagnation' | null>(restored?.conditionType ?? null)

  // Guided path state
  const [guidedStep, setGuidedStep] = useState<GuidedStep>(restored?.guidedStep ?? 'symptom')
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set(restored?.symptoms ?? []))
  const [selectedTissue, setSelectedTissue] = useState<string | null>(restored?.selectedTissue ?? null)
  const [location, setLocation] = useState<LocationChoice>(restored?.location ?? { vertical: null, side: null })
  const [palmFindings, setPalmFindings] = useState<Set<string>>(new Set(restored?.palmFindings ?? []))
  const [symptomSearch, setSymptomSearch] = useState('')

  // Shared
  const [showNourishing, setShowNourishing] = useState(false)

  // ── Browser history sync ──
  const isPopRef = useRef(false)

  // Compute initial history state key from restored state
  function getHistoryKey(p: Path, ds: DirectStep, gs: GuidedStep): string {
    if (p === 'choose') return 'choose'
    if (p === 'direct') return ds === 'results' ? 'direct-results' : 'direct-organs'
    return `guided-${gs}`
  }

  useEffect(() => {
    // Use restored state for initial history entry
    const initialKey = getHistoryKey(
      restored?.path ?? 'choose',
      restored?.directStep ?? 'organs',
      restored?.guidedStep ?? 'symptom'
    )
    window.history.replaceState({ smartDiag: initialKey }, '')

    const onPopState = (e: PopStateEvent) => {
      const state = e.state?.smartDiag
      if (!state) {
        sessionStorage.removeItem('smart_diag_state')
        navigate('/', { replace: true })
        return
      }
      isPopRef.current = true
      if (state === 'choose') {
        setPath('choose')
      } else if (state === 'direct-organs') {
        setPath('direct')
        setDirectStep('organs')
      } else if (state === 'direct-results') {
        setPath('direct')
        setDirectStep('organs')
      } else if (state.startsWith('guided-')) {
        setPath('guided')
        const step = state.replace('guided-', '') as GuidedStep
        setGuidedStep(step)
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [navigate])

  function pushHistory(state: string) {
    if (!isPopRef.current) {
      window.history.pushState({ smartDiag: state }, '')
    }
    isPopRef.current = false
  }

  // ── Persist state to sessionStorage ──
  useEffect(() => {
    try {
      sessionStorage.setItem('smart_diag_state', JSON.stringify({
        path, directStep, selectedOrganId: selectedOrgan?.id ?? null,
        conditionType, guidedStep, symptoms: Array.from(selectedSymptoms),
        selectedTissue, location, palmFindings: Array.from(palmFindings),
      }))
    } catch {}
  }, [path, directStep, selectedOrgan, conditionType, guidedStep, selectedSymptoms, selectedTissue, location, palmFindings])

  // ── Compute results for direct path ──
  const directResults = useMemo((): PointResult[] => {
    if (!selectedOrgan) return []

    const resultMap = new Map<string, PointResult>()

    function addPoint(point: Point, icon: string, text: string, priority: number) {
      const existing = resultMap.get(point.id)
      if (existing) {
        existing.reasons.push({ icon, text, priority })
        existing.totalPriority = Math.max(existing.totalPriority, priority)
      } else {
        resultMap.set(point.id, {
          point,
          reasons: [{ icon, text, priority }],
          totalPriority: priority,
        })
      }
    }

    // 1. Dao Ma groups (priority 100)
    const daoMaIds = organToDaoMa[selectedOrgan.id] ?? []
    for (const groupId of daoMaIds) {
      const group = daoMaClinicalGroups.find(g => g.id === groupId)
      if (!group) continue
      for (const pid of group.pointIds) {
        const point = points.find(p => p.id === pid)
        if (point) {
          addPoint(point, '🐴', `דאו-מא: ${group.nameHebrew}`, 100)
        }
      }
    }

    // 2. Points by reactionAreas hierarchy
    const organPoints = getPointsByOrgan(selectedOrgan.hebrew)
    for (const op of organPoints) {
      const point = op.point
      if (!point) continue
      const level = op.level
      let priority = 50
      let levelName = ''
      if (level === 1) { priority = 90; levelName = 'ראשי' }
      else if (level === 2) { priority = 70; levelName = 'עצב' }
      else if (level === 3) { priority = 50; levelName = 'מסייע' }
      else if (level === 4) { priority = 40; levelName = 'ענף' }
      else if (level === 5) { priority = 30; levelName = 'תת-ענף' }
      else if (level === 6) { priority = 20; levelName = 'הצטלבות' }
      addPoint(point, '🔬', `עצבוב ${levelName}: ${selectedOrgan.hebrew}`, priority)
    }

    // 3. Named points (priority 85)
    for (const np of selectedOrgan.namedPoints) {
      const point = points.find(p => p.id === np.id)
      if (point) {
        addPoint(point, '📛', np.reason, 85)
      }
    }

    // 4. Nourishing cycle — mother's Dao Ma (priority 60)
    if (showNourishing) {
      for (const groupId of selectedOrgan.motherDaoMa) {
        const group = daoMaClinicalGroups.find(g => g.id === groupId)
        if (!group) continue
        for (const pid of group.pointIds) {
          const point = points.find(p => p.id === pid)
          if (point) {
            addPoint(point, '🔄', `מעגל הזנה: ${group.nameHebrew} (${selectedOrgan.motherNote.split('.')[0]})`, 60)
          }
        }
      }
    }

    // Sort: highest priority first, then by absolute needle, then by ID
    const results = Array.from(resultMap.values())
    results.sort((a, b) => {
      if (b.totalPriority !== a.totalPriority) return b.totalPriority - a.totalPriority
      // Absolute needles first
      const aAbs = a.point.absoluteNeedle === '72' ? 2 : a.point.absoluteNeedle === '32' ? 1 : 0
      const bAbs = b.point.absoluteNeedle === '72' ? 2 : b.point.absoluteNeedle === '32' ? 1 : 0
      if (bAbs !== aAbs) return bAbs - aAbs
      return a.point.id.localeCompare(b.point.id)
    })

    return results
  }, [selectedOrgan, showNourishing])

  // ── Guided path: detect organ from tissue ──
  const guidedOrgan = useMemo(() => {
    if (selectedTissue) {
      const tissue = tissueOrganMap.find(t => t.id === selectedTissue)
      if (tissue) return getOrganProfile(tissue.organId) ?? null
    }
    return null
  }, [selectedTissue])

  // ── Guided search results ──
  const searchResults = useMemo(() => {
    if (!symptomSearch || symptomSearch.length < 2) return null
    const results: { catName: string; icon: string; matches: { indication: string; pointCount: number }[] }[] = []
    for (const cat of rubricData) {
      const matches = cat.entries
        .filter(e => e.indication.includes(symptomSearch))
        .map(e => ({ indication: e.indication, pointCount: e.pointIds.length }))
      if (matches.length > 0) {
        results.push({ catName: cat.name, icon: cat.icon, matches })
      }
    }
    return results
  }, [symptomSearch])

  // ── Navigation helpers ──
  function choosePath(p: 'direct' | 'guided') {
    setPath(p)
    pushHistory(p === 'direct' ? 'direct-organs' : 'guided-symptom')
  }

  function selectOrgan(organ: OrganProfile) {
    setSelectedOrgan(organ)
    setDirectStep('results')
    pushHistory('direct-results')
  }

  function goGuidedNext(from: GuidedStep) {
    const steps: GuidedStep[] = ['symptom', 'tissue', 'location', 'palm', 'results']
    const idx = steps.indexOf(from)
    if (idx < steps.length - 1) {
      const next = steps[idx + 1]
      setGuidedStep(next)
      pushHistory(`guided-${next}`)
    }
  }

  function goGuidedBack(from: GuidedStep) {
    const steps: GuidedStep[] = ['symptom', 'tissue', 'location', 'palm', 'results']
    const idx = steps.indexOf(from)
    if (idx > 0) {
      const prev = steps[idx - 1]
      setGuidedStep(prev)
    } else {
      setPath('choose')
    }
  }

  function resetAll() {
    setPath('choose')
    setDirectStep('organs')
    setSelectedOrgan(null)
    setConditionType(null)
    setGuidedStep('symptom')
    setSelectedSymptoms(new Set())
    setSelectedTissue(null)
    setLocation({ vertical: null, side: null })
    setPalmFindings(new Set())
    setSymptomSearch('')
    setShowNourishing(false)
    sessionStorage.removeItem('smart_diag_state')
  }

  function toggleSymptom(s: string) {
    setSelectedSymptoms(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

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
            <h1 className="text-2xl font-bold">אבחון חכם</h1>
            <p className="text-teal-100 text-sm">
              {path === 'choose' && 'בחר מסלול אבחון'}
              {path === 'direct' && 'בחירת איבר ישירה'}
              {path === 'guided' && 'שאלון מודרך'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">

        {/* ════════════════════════════════════════════════════════════ */}
        {/* PATH SELECTION                                              */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => choosePath('direct')}
              className="w-full flex items-center gap-4 p-5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover:border-teal-primary/40 transition-colors text-right"
            >
              <div className="w-14 h-14 rounded-xl bg-teal-50 dark:bg-teal-primary/20 flex items-center justify-center shrink-0">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-dark-text text-lg">אני יודע מה האיבר</div>
                <div className="text-sm text-gray-500 dark:text-dark-muted mt-1">
                  בחר איבר (לב, כבד, טחול, ריאות, כליות) וקבל נקודות מומלצות בהיררכיה
                </div>
              </div>
            </button>

            <button
              onClick={() => choosePath('guided')}
              className="w-full flex items-center gap-4 p-5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover:border-teal-primary/40 transition-colors text-right"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-3xl">🔍</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-dark-text text-lg">עזור לי לזהות</div>
                <div className="text-sm text-gray-500 dark:text-dark-muted mt-1">
                  שאלון מודרך: סימפטום → רקמה → מיקום → אבחון כף יד → נקודות
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* DIRECT PATH — Organ Selection                               */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'direct' && directStep === 'organs' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-dark-muted text-right">בחר את האיבר הפגוע:</p>
            <div className="space-y-2.5">
              {organProfiles.map(organ => (
                <button
                  key={organ.id}
                  onClick={() => selectOrgan(organ)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-right transition-colors
                    ${organ.color.bg} ${organ.color.border} ${organ.color.darkBg} hover:opacity-80`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/60 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{organ.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-lg ${organ.color.text} ${organ.color.darkText}`}>
                      {organ.hebrew}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-dark-muted mt-0.5">
                      {organ.phaseHebrew} · {organ.tissue} · {organ.emotion}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-dark-muted shrink-0">
                    {organ.phaseHebrew}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* DIRECT PATH — Results                                       */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'direct' && directStep === 'results' && selectedOrgan && (
          <div className="space-y-3">
            {/* Organ summary card */}
            <div className={`p-4 rounded-2xl border ${selectedOrgan.color.bg} ${selectedOrgan.color.border} ${selectedOrgan.color.darkBg} text-right`}>
              <div className="flex items-center gap-3 justify-end">
                <div className="flex-1">
                  <div className={`text-xl font-bold ${selectedOrgan.color.text} ${selectedOrgan.color.darkText}`}>
                    {selectedOrgan.icon} {selectedOrgan.hebrew} — {selectedOrgan.phaseHebrew}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-dark-muted mt-1">
                    {selectedOrgan.tissueDescription}
                  </div>
                </div>
              </div>

              {/* Side rule */}
              <div className="mt-3 p-2.5 bg-white/50 dark:bg-white/5 rounded-xl text-xs text-gray-700 dark:text-dark-muted">
                <div className="font-bold mb-1">📐 צד דיקור:</div>
                <div>יד: {selectedOrgan.sideRule.hand === 'bilateral' ? 'דו-צדדי' : selectedOrgan.sideRule.hand === 'left' ? 'שמאל' : 'ימין'} · רגל: {selectedOrgan.sideRule.leg === 'bilateral' ? 'דו-צדדי' : selectedOrgan.sideRule.leg === 'left' ? 'שמאל' : 'ימין'}</div>
                <div className="text-[10px] mt-0.5 opacity-70">{selectedOrgan.sideRule.note}</div>
              </div>

              {/* Condition type selector */}
              <div className="mt-3 flex gap-2">
                {(['deficiency', 'excess', 'stagnation'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setConditionType(conditionType === type ? null : type)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border
                      ${conditionType === type
                        ? 'bg-teal-primary text-white border-teal-primary'
                        : 'bg-white/50 dark:bg-white/5 text-gray-600 dark:text-dark-muted border-transparent hover:border-gray-200'
                      }`}
                  >
                    {type === 'deficiency' ? '🔽 חוסר' : type === 'excess' ? '🔼 עודף' : '⏸️ סטגנציה'}
                  </button>
                ))}
              </div>

              {/* Technique recommendation */}
              {conditionType && (
                <div className="mt-2 p-2 bg-white/70 dark:bg-white/10 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-bold">טכניקה: </span>
                  {selectedOrgan.technique[conditionType]}
                </div>
              )}
            </div>

            {/* Nourishing cycle toggle */}
            <button
              onClick={() => setShowNourishing(!showNourishing)}
              className={`w-full p-3 rounded-xl border text-sm text-right transition-colors flex items-center justify-between
                ${showNourishing
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted'
                }`}
            >
              <span className="text-xs">{showNourishing ? 'מוצג' : 'לחץ להצגה'}</span>
              <span>🔄 הצג נקודות מעגל הזנה ({selectedOrgan.motherNote.split('.')[0]})</span>
            </button>

            {/* Clinical notes */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-right">
              <div className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-1.5">💡 דגשים קליניים</div>
              {selectedOrgan.clinicalNotes.map((note, i) => (
                <div key={i} className="text-[11px] text-blue-700 dark:text-blue-300 mb-1 leading-relaxed">• {note}</div>
              ))}
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setDirectStep('organs'); setSelectedOrgan(null) }}
                className="text-sm text-teal-primary hover:underline"
              >
                ← החלף איבר
              </button>
              <h2 className="text-sm font-bold text-gray-500 dark:text-dark-muted">
                {directResults.length} נקודות מומלצות
              </h2>
            </div>

            {/* Point results */}
            {renderPointResults(directResults)}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GUIDED PATH — Step 1: Symptom                               */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'guided' && guidedStep === 'symptom' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-dark-muted text-right">מה הבעיה של המטופל?</p>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={symptomSearch}
                onChange={e => setSymptomSearch(e.target.value)}
                placeholder="חפש סימפטום... (למשל: כאב ראש, סיאטיקה)"
                className="w-full py-3 px-4 pr-10 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-800 dark:text-dark-text text-right placeholder:text-gray-400 focus:outline-none focus:border-teal-primary"
              />
              <svg className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 right-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {symptomSearch && (
                <button onClick={() => setSymptomSearch('')} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results */}
            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 text-right">
                  {searchResults.reduce((s, r) => s + r.matches.length, 0)} תוצאות
                </p>
                {searchResults.map(cat => (
                  <div key={cat.catName} className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 text-right">
                      {cat.icon} {cat.catName}
                    </div>
                    {cat.matches.slice(0, 4).map(m => {
                      const sel = selectedSymptoms.has(m.indication)
                      return (
                        <button
                          key={m.indication}
                          onClick={() => toggleSymptom(m.indication)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-right border-t border-gray-50 dark:border-dark-border transition-colors
                            ${sel ? 'bg-teal-50 dark:bg-teal-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <span className="text-[10px] text-gray-400 shrink-0">{m.pointCount} נק׳</span>
                          <span className="flex-1 text-sm text-gray-800 dark:text-dark-text">{m.indication}</span>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0
                            ${sel ? 'bg-teal-primary border-teal-primary' : 'border-gray-300 dark:border-dark-border'}`}>
                            {sel && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}

            {searchResults && searchResults.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-sm">לא נמצאו תוצאות עבור "{symptomSearch}"</div>
            )}

            {/* Selected symptoms bar */}
            {selectedSymptoms.size > 0 && (
              <div className="p-3 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border">
                <div className="text-xs font-bold text-gray-600 dark:text-dark-muted text-right mb-2">
                  {selectedSymptoms.size} סימפטומים נבחרו
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {Array.from(selectedSymptoms).map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className="text-[11px] px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-primary/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      {s.length > 30 ? s.slice(0, 30) + '…' : s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goGuidedNext('symptom')}
                  className="w-full mt-3 py-2.5 rounded-xl bg-teal-primary text-white font-bold text-sm hover:bg-teal-dark transition-colors"
                >
                  המשך →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GUIDED PATH — Step 2: Tissue                                */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'guided' && guidedStep === 'tissue' && (
          <div className="space-y-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700 dark:text-dark-text">באיזו רקמה הבעיה?</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">חמשת הפאזות — כל רקמה קשורה לאיבר</p>
            </div>
            <div className="space-y-2">
              {tissueOrganMap.map(t => {
                const organ = getOrganProfile(t.organId)
                const sel = selectedTissue === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTissue(sel ? null : t.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-right transition-colors
                      ${sel
                        ? `${organ?.color.bg} ${organ?.color.border} ${organ?.color.darkBg}`
                        : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border hover:border-gray-200'
                      }`}
                  >
                    <span className="text-2xl shrink-0">{t.icon}</span>
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${sel ? organ?.color.text + ' ' + organ?.color.darkText : 'text-gray-900 dark:text-dark-text'}`}>
                        {t.hebrew}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{t.description}</div>
                    </div>
                    {organ && (
                      <div className="text-xs text-gray-400 dark:text-dark-muted shrink-0 text-left">
                        → {organ.icon} {organ.hebrew}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button onClick={() => goGuidedBack('tissue')} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 text-sm">
                ← חזרה
              </button>
              <button
                onClick={() => goGuidedNext('tissue')}
                className="flex-1 py-2.5 rounded-xl bg-teal-primary text-white font-bold text-sm hover:bg-teal-dark transition-colors"
              >
                {selectedTissue ? 'המשך →' : 'דלג →'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GUIDED PATH — Step 3: Location                              */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'guided' && guidedStep === 'location' && (
          <div className="space-y-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700 dark:text-dark-text">איפה הכאב?</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">לקביעת אזור דיקור והדמיה</p>
            </div>

            {/* Vertical */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 text-right">
              <div className="text-xs font-bold text-gray-600 dark:text-dark-muted mb-2">↕️ גובה</div>
              <div className="flex gap-2">
                {[
                  { val: 'upper' as const, label: 'מעל הטבור', sub: '→ דקור ברגליים (55-88)' },
                  { val: 'lower' as const, label: 'מתחת לטבור', sub: '→ דקור בידיים (11-44)' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setLocation(prev => ({ ...prev, vertical: prev.vertical === opt.val ? null : opt.val }))}
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors
                      ${location.vertical === opt.val
                        ? 'bg-teal-50 dark:bg-teal-primary/20 border-teal-300 dark:border-teal-600'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-dark-text">{opt.label}</div>
                    <div className="text-[10px] text-gray-500 dark:text-dark-muted mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Side */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 text-right">
              <div className="text-xs font-bold text-gray-600 dark:text-dark-muted mb-2">↔️ צד</div>
              <div className="flex gap-2">
                {[
                  { val: 'right' as const, label: 'ימין', sub: '→ דקור שמאל' },
                  { val: 'left' as const, label: 'שמאל', sub: '→ דקור ימין' },
                  { val: 'bilateral' as const, label: 'דו-צדדי', sub: '→ דקור דו-צדדי' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setLocation(prev => ({ ...prev, side: prev.side === opt.val ? null : opt.val }))}
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors
                      ${location.side === opt.val
                        ? 'bg-teal-50 dark:bg-teal-primary/20 border-teal-300 dark:border-teal-600'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-800 dark:text-dark-text">{opt.label}</div>
                    <div className="text-[10px] text-gray-500 dark:text-dark-muted mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button onClick={() => goGuidedBack('location')} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 text-sm">
                ← חזרה
              </button>
              <button
                onClick={() => goGuidedNext('location')}
                className="flex-1 py-2.5 rounded-xl bg-teal-primary text-white font-bold text-sm"
              >
                המשך →
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GUIDED PATH — Step 4: Palm Diagnosis (Optional)             */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'guided' && guidedStep === 'palm' && (
          <div className="space-y-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700 dark:text-dark-text">🖐️ אבחון כף יד (אופציונלי)</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">סמן ממצאים שאתה רואה — אם לא רואים כלום, דלג</p>
            </div>

            <div className="space-y-2">
              {organProfiles.map(organ => (
                <div key={organ.id} className={`rounded-xl border overflow-hidden ${organ.color.border} ${organ.color.darkBg}`}>
                  <div className={`px-3 py-2 ${organ.color.bg} flex items-center gap-2 justify-end`}>
                    <span className={`text-xs font-bold ${organ.color.text} ${organ.color.darkText}`}>
                      {organ.icon} {organ.hebrew} — {organ.palmDiagnosis.fingerName}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-dark-card divide-y divide-gray-50 dark:divide-dark-border">
                    {organ.palmDiagnosis.signs.map(sign => {
                      const key = `${organ.id}:${sign.sign}`
                      const sel = palmFindings.has(key)
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setPalmFindings(prev => {
                              const next = new Set(prev)
                              if (next.has(key)) next.delete(key)
                              else next.add(key)
                              return next
                            })
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-right transition-colors
                            ${sel ? 'bg-teal-50 dark:bg-teal-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0
                            ${sel ? 'bg-teal-primary border-teal-primary' : 'border-gray-300 dark:border-dark-border'}`}>
                            {sel && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-800 dark:text-dark-text">{sign.sign}</div>
                            <div className="text-[10px] text-gray-500 dark:text-dark-muted">{sign.meaning}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button onClick={() => goGuidedBack('palm')} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 text-sm">
                ← חזרה
              </button>
              <button
                onClick={() => goGuidedNext('palm')}
                className="flex-1 py-2.5 rounded-xl bg-teal-primary text-white font-bold text-sm"
              >
                {palmFindings.size > 0 ? `הצג תוצאות (${palmFindings.size} ממצאים)` : 'דלג — הצג תוצאות'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GUIDED PATH — Step 5: Results                               */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'guided' && guidedStep === 'results' && (
          <GuidedResults
            guidedOrgan={guidedOrgan}
            selectedSymptoms={selectedSymptoms}
            location={location}
            palmFindings={palmFindings}
            onBack={() => goGuidedBack('results')}
            onReset={resetAll}
          />
        )}
      </div>
    </div>
  )

  // ── Shared point results renderer ──
  function renderPointResults(results: PointResult[]) {
    if (results.length === 0) {
      return <div className="text-center text-gray-400 py-12">לא נמצאו נקודות מתאימות</div>
    }
    return (
      <div className="space-y-2">
        {results.slice(0, 30).map(({ point, reasons, totalPriority }) => (
          <Link
            key={point.id}
            to={`/point/${point.id}`}
            className="block bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-3.5 hover:border-teal-primary/30 transition-colors"
          >
            <div className="flex items-start gap-3 flex-row-reverse">
              {/* Priority badge */}
              <div className="shrink-0 w-10 h-10 rounded-lg bg-teal-primary/10 dark:bg-teal-primary/20 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-teal-primary">
                  {totalPriority >= 90 ? '⭐' : totalPriority >= 70 ? '🔵' : '◽'}
                </span>
              </div>

              {/* Point info */}
              <div className="flex-1 text-right min-w-0">
                <div className="flex items-center gap-2 justify-end flex-wrap">
                  {point.absoluteNeedle === '72' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">🥇 72</span>
                  )}
                  {point.absoluteNeedle === '32' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">🥈 32</span>
                  )}
                  <span className="font-bold text-gray-900 dark:text-dark-text text-sm">{point.hebrewName || point.pinyinName}</span>
                  <span className="text-xs font-mono text-teal-primary bg-teal-50 dark:bg-teal-primary/20 px-1.5 py-0.5 rounded">
                    {point.id}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-dark-muted mt-1 flex items-center gap-2 justify-end">
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

                {/* Reasons */}
                <div className="flex flex-wrap gap-1 mt-1.5 justify-end">
                  {reasons.map((r, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                    >
                      {r.icon} {r.text.length > 30 ? r.text.slice(0, 30) + '…' : r.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }
}

// ══════════════════════════════════════════════════════════════════════════
// GUIDED RESULTS COMPONENT
// ══════════════════════════════════════════════════════════════════════════

function GuidedResults({
  guidedOrgan,
  selectedSymptoms,
  location,
  palmFindings,
  onBack,
  onReset,
}: {
  guidedOrgan: OrganProfile | null
  selectedSymptoms: Set<string>
  location: LocationChoice
  palmFindings: Set<string>
  onBack: () => void
  onReset: () => void
}) {
  // Determine which organs are implicated by palm findings
  const palmOrgans = useMemo(() => {
    const organs = new Set<string>()
    for (const finding of palmFindings) {
      const organId = finding.split(':')[0]
      organs.add(organId)
    }
    return organs
  }, [palmFindings])

  // Build summary
  const summary: string[] = []
  if (guidedOrgan) summary.push(`רקמה → ${guidedOrgan.icon} ${guidedOrgan.hebrew}`)
  if (location.vertical) summary.push(location.vertical === 'upper' ? '↕️ מעל הטבור' : '↕️ מתחת לטבור')
  if (location.side) summary.push(location.side === 'bilateral' ? '↔️ דו-צדדי' : `↔️ ${location.side === 'right' ? 'ימין' : 'שמאל'}`)
  if (palmOrgans.size > 0) summary.push(`🖐️ ${palmOrgans.size} ממצאי כף יד`)

  // Determine the primary organ (tissue takes precedence, then palm findings)
  const primaryOrgan = guidedOrgan ??
    (palmOrgans.size === 1 ? getOrganProfile(Array.from(palmOrgans)[0]) : null)

  // Needling zone recommendation
  const zoneRec = location.vertical === 'upper'
    ? 'כאב מעל הטבור → דקור ברגליים (אזורים 55-88)'
    : location.vertical === 'lower'
    ? 'כאב מתחת לטבור → דקור בידיים (אזורים 11-44)'
    : null

  const sideRec = location.side === 'right'
    ? 'כאב בימין → דקור בשמאל (צד נגדי)'
    : location.side === 'left'
    ? 'כאב בשמאל → דקור בימין (צד נגדי)'
    : location.side === 'bilateral'
    ? 'כאב דו-צדדי → דקור דו-צדדי'
    : null

  return (
    <div className="space-y-3">
      {/* Summary card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-700 text-right">
        <div className="text-sm font-bold text-teal-900 dark:text-teal-100 mb-2">📋 סיכום האבחון</div>
        {summary.map((s, i) => (
          <div key={i} className="text-xs text-teal-700 dark:text-teal-300 mb-0.5">{s}</div>
        ))}
        {selectedSymptoms.size > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 justify-end">
            {Array.from(selectedSymptoms).slice(0, 5).map(s => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300">
                {s.length > 20 ? s.slice(0, 20) + '…' : s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Location/side recommendation */}
      {(zoneRec || sideRec) && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-right text-xs space-y-1">
          <div className="font-bold text-blue-800 dark:text-blue-200">📐 עקרונות הדמיה</div>
          {zoneRec && <div className="text-blue-700 dark:text-blue-300">{zoneRec}</div>}
          {sideRec && <div className="text-blue-700 dark:text-blue-300">{sideRec}</div>}
          <div className="text-blue-600 dark:text-blue-400 text-[10px]">⚠️ ביטוי חיצוני גובר על כל הכללים</div>
        </div>
      )}

      {/* Organ recommendation */}
      {primaryOrgan && (
        <div className={`p-4 rounded-2xl border ${primaryOrgan.color.bg} ${primaryOrgan.color.border} ${primaryOrgan.color.darkBg} text-right`}>
          <div className={`text-lg font-bold ${primaryOrgan.color.text} ${primaryOrgan.color.darkText}`}>
            {primaryOrgan.icon} איבר מוביל: {primaryOrgan.hebrew} ({primaryOrgan.phaseHebrew})
          </div>
          <div className="text-xs text-gray-600 dark:text-dark-muted mt-1">{primaryOrgan.tissueDescription}</div>
          <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
            <span className="font-bold">📐 צד: </span>
            {primaryOrgan.sideRule.note}
          </div>
        </div>
      )}

      {/* Palm findings detail */}
      {palmOrgans.size > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-right">
          <div className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">🖐️ ממצאי כף יד</div>
          {Array.from(palmFindings).map(f => {
            const [organId, ...signParts] = f.split(':')
            const organ = getOrganProfile(organId)
            return (
              <div key={f} className="text-[11px] text-amber-700 dark:text-amber-300 mb-0.5">
                {organ?.icon} {organ?.hebrew}: {signParts.join(':')}
              </div>
            )
          })}
        </div>
      )}

      {/* Recommended Dao Ma groups */}
      {primaryOrgan && (
        <div className="p-3 rounded-xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border text-right">
          <div className="text-xs font-bold text-gray-700 dark:text-dark-text mb-2">🐴 קומבינציות דאו-מא מומלצות</div>
          {(organToDaoMa[primaryOrgan.id] ?? []).map(groupId => {
            const group = daoMaClinicalGroups.find(g => g.id === groupId)
            if (!group) return null
            return (
              <div key={groupId} className="mb-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-bold text-sm text-gray-800 dark:text-dark-text">
                  {group.nameHebrew} ({group.namePinyin})
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {group.pointIds.map(pid => (
                    <Link
                      key={pid}
                      to={`/point/${pid}`}
                      className="text-xs px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-primary/20 text-teal-700 dark:text-teal-300 font-mono font-bold hover:bg-teal-100 transition-colors"
                    >
                      {pid}
                    </Link>
                  ))}
                </div>
                {group.keyNotes && (
                  <div className="text-[10px] text-gray-500 dark:text-dark-muted mt-1">{group.keyNotes.slice(0, 100)}...</div>
                )}
              </div>
            )
          })}

          {/* Mother nourishing */}
          <div className="mt-2 p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
              🔄 מעגל הזנה: {primaryOrgan.motherNote}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 text-sm">
          ← חזרה
        </button>
        <button onClick={onReset} className="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm">
          🔄 אבחון חדש
        </button>
      </div>
    </div>
  )
}
