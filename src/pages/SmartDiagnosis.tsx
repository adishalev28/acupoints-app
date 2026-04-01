import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { points } from '../data/points'
import { flattenIndications, type Point } from '../types'
import { organProfiles, tissueOrganMap, getOrganProfile, type OrganProfile } from '../data/organTherapy'
import { daoMaClinicalGroups, organToDaoMa } from '../data/daoMaGroups'
import { getPointsByOrgan } from '../utils/reactionAreaNormalization'
import { getSideBadge } from '../utils/treatmentPrinciples'

// ── Types ──

type Path = 'choose' | 'direct' | 'guided'

// Direct path steps
type DirectStep = 'organs' | 'results'

// Guided path steps
type GuidedStep = 'symptom' | 'character' | 'triggers' | 'associated' | 'location' | 'palm' | 'results'

interface LocationChoice {
  vertical: 'upper' | 'lower' | null
  side: 'right' | 'left' | 'bilateral' | null
}

// ── Diagnostic questions that help identify the organ ──
// Each answer adds weight to specific organs

interface DiagnosticOption {
  id: string
  text: string
  description: string
  icon: string
  organWeights: Record<string, number> // organId → weight (1-3)
}

interface DiagnosticQuestion {
  step: 'character' | 'triggers' | 'associated'
  title: string
  subtitle: string
  multiSelect: boolean
  options: DiagnosticOption[]
}

const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    step: 'character',
    title: 'מה אופי הבעיה?',
    subtitle: 'איך הכאב/הסימפטום מרגיש?',
    multiSelect: true,
    options: [
      { id: 'sharp-fixed', text: 'כאב דוקר / קבוע במקום', description: 'כאב חד שלא זז, מחמיר בלילה', icon: '📌', organWeights: { heart: 3 } },
      { id: 'heavy-dull', text: 'כבדות / כאב עמום', description: 'תחושת כבדות, נפיחות, מלאות', icon: '🪨', organWeights: { spleen: 3 } },
      { id: 'wandering', text: 'כאב נודד / משתנה', description: 'כאב שמשנה מקום, עוויתות, רעד', icon: '💨', organWeights: { liver: 3 } },
      { id: 'burning', text: 'חום / צריבה / אדמומיות', description: 'תחושת חום באזור, דלקתיות', icon: '🔥', organWeights: { heart: 2, liver: 2 } },
      { id: 'cold-stiff', text: 'קור / נוקשות / התכווצות', description: 'מחמיר בקור, נוקשות בבוקר', icon: '❄️', organWeights: { kidneys: 3 } },
      { id: 'dry', text: 'יובש / צמאון / יובש בעור', description: 'עור יבש, פה יבש, שתייה מרובה', icon: '🏜️', organWeights: { lungs: 2, kidneys: 2 } },
    ],
  },
  {
    step: 'triggers',
    title: 'מה מחמיר את הבעיה?',
    subtitle: 'מתי או ממה זה מחמיר?',
    multiSelect: true,
    options: [
      { id: 'stress-anger', text: 'מתח / כעס / תסכול', description: 'מחמיר בלחץ רגשי', icon: '😤', organWeights: { liver: 3 } },
      { id: 'after-eating', text: 'אחרי אכילה / שתייה', description: 'נפיחות, עייפות אחרי אוכל', icon: '🍽️', organWeights: { spleen: 3 } },
      { id: 'cold-weather', text: 'קור / מזג אוויר לח', description: 'מחמיר בחורף, בגשם', icon: '🌧️', organWeights: { kidneys: 2, spleen: 1 } },
      { id: 'night', text: 'מחמיר בלילה', description: 'גרוע יותר בשעות הלילה', icon: '🌙', organWeights: { heart: 2, kidneys: 1 } },
      { id: 'exertion', text: 'מאמץ פיזי / עייפות', description: 'מחמיר מתנועה או עבודה', icon: '🏃', organWeights: { spleen: 2, kidneys: 1 } },
      { id: 'wind-season', text: 'רוח / שינוי עונה', description: 'מחמיר ברוח או בין עונות', icon: '🍂', organWeights: { lungs: 3, liver: 1 } },
    ],
  },
  {
    step: 'associated',
    title: 'סימפטומים נלווים?',
    subtitle: 'מה עוד קורה מלבד הבעיה העיקרית?',
    multiSelect: true,
    options: [
      { id: 'eye-vision', text: 'בעיות עיניים / ראייה מטושטשת', description: 'עיניים אדומות, יבשות, ראייה מטושטשת', icon: '👁️', organWeights: { liver: 3 } },
      { id: 'digestive', text: 'בעיות עיכול / נפיחות', description: 'בחילה, שלשול, נפיחות, תיאבון ירוד', icon: '🫃', organWeights: { spleen: 3 } },
      { id: 'skin-breathing', text: 'בעיות עור / נשימה', description: 'אקזמה, גרד, קוצר נשימה, אלרגיות', icon: '🫁', organWeights: { lungs: 3 } },
      { id: 'back-urinary', text: 'כאב גב תחתון / שתן תכוף', description: 'חולשת ברכיים, טינטון, עייפות כרונית', icon: '💧', organWeights: { kidneys: 3 } },
      { id: 'anxiety-sleep', text: 'חרדה / נדודי שינה / דפיקות', description: 'קושי להירדם, דפיקות לב, חרדה', icon: '💓', organWeights: { heart: 3 } },
      { id: 'irritability-pms', text: 'עצבנות / PMS / כאב צלעות', description: 'עצבנות, מתח רגשי, כאב בצלעות', icon: '😠', organWeights: { liver: 3 } },
    ],
  },
]

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
  const [freeTextSymptom, setFreeTextSymptom] = useState(restored?.freeTextSymptom ?? '')
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set(restored?.symptoms ?? []))
  const [selectedTissue, setSelectedTissue] = useState<string | null>(restored?.selectedTissue ?? null)
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Set<string>>(new Set(restored?.diagnosticAnswers ?? []))
  const [location, setLocation] = useState<LocationChoice>(restored?.location ?? { vertical: null, side: null })
  const [palmFindings, setPalmFindings] = useState<Set<string>>(new Set(restored?.palmFindings ?? []))
  // symptomSearch removed — guided path now uses freeTextSymptom

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
        conditionType, guidedStep, freeTextSymptom, symptoms: Array.from(selectedSymptoms),
        selectedTissue, diagnosticAnswers: Array.from(diagnosticAnswers),
        location, palmFindings: Array.from(palmFindings),
      }))
    } catch {}
  }, [path, directStep, selectedOrgan, conditionType, guidedStep, freeTextSymptom, selectedSymptoms, selectedTissue, diagnosticAnswers, location, palmFindings])

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

  // ── Guided path: detect organ from diagnostic answers ──
  const guidedOrganScores = useMemo(() => {
    const scores: Record<string, number> = {}
    for (const answerId of diagnosticAnswers) {
      // Find which option this answer belongs to
      for (const q of diagnosticQuestions) {
        const opt = q.options.find(o => o.id === answerId)
        if (opt) {
          for (const [organId, weight] of Object.entries(opt.organWeights)) {
            scores[organId] = (scores[organId] ?? 0) + weight
          }
        }
      }
    }
    // Also factor in tissue if selected
    if (selectedTissue) {
      const tissue = tissueOrganMap.find(t => t.id === selectedTissue)
      if (tissue) {
        scores[tissue.organId] = (scores[tissue.organId] ?? 0) + 5 // tissue is strong signal
      }
    }
    return scores
  }, [diagnosticAnswers, selectedTissue])

  const guidedOrgan = useMemo(() => {
    const entries = Object.entries(guidedOrganScores)
    if (entries.length === 0) return null
    entries.sort((a, b) => b[1] - a[1])
    return getOrganProfile(entries[0][0]) ?? null
  }, [guidedOrganScores])

  // All organs with scores > 0, sorted
  const guidedOrganRanking = useMemo(() => {
    return Object.entries(guidedOrganScores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ organ: getOrganProfile(id)!, score }))
      .filter(r => r.organ)
  }, [guidedOrganScores])

  // (search results removed — guided path now uses free text)

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

  const guidedSteps: GuidedStep[] = ['symptom', 'character', 'triggers', 'associated', 'location', 'palm', 'results']

  function goGuidedNext(from: GuidedStep) {
    const idx = guidedSteps.indexOf(from)
    if (idx < guidedSteps.length - 1) {
      const next = guidedSteps[idx + 1]
      setGuidedStep(next)
      pushHistory(`guided-${next}`)
    }
  }

  function goGuidedBack(from: GuidedStep) {
    const idx = guidedSteps.indexOf(from)
    if (idx > 0) {
      const prev = guidedSteps[idx - 1]
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
    setFreeTextSymptom('')
    setSelectedSymptoms(new Set())
    setSelectedTissue(null)
    setDiagnosticAnswers(new Set())
    setLocation({ vertical: null, side: null })
    setPalmFindings(new Set())
    setShowNourishing(false)
    sessionStorage.removeItem('smart_diag_state')
  }

  // toggleSymptom kept for future use if needed

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
          <div className="text-right flex-1">
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
        {/* GUIDED PATH — Step 1: Symptom (free text + continue)         */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'guided' && guidedStep === 'symptom' && (
          <div className="space-y-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700 dark:text-dark-text">מה הבעיה של המטופל?</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                הקלד את הסימפטום — השאלון יעזור לך לזהות מאיפה הוא מגיע
              </p>
            </div>

            {/* Free text input */}
            <div className="relative">
              <input
                type="text"
                value={freeTextSymptom}
                onChange={e => setFreeTextSymptom(e.target.value)}
                placeholder="למשל: מיגרנה, כאב גב, סיאטיקה, אקזמה..."
                className="w-full py-3.5 px-4 pr-10 rounded-xl border-2 border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-base text-gray-800 dark:text-dark-text text-right placeholder:text-gray-400 focus:outline-none focus:border-teal-primary"
              />
              <svg className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 right-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Quick suggestions */}
            {!freeTextSymptom && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400 dark:text-dark-muted text-right">או בחר בעיה נפוצה:</p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {['מיגרנה', 'סיאטיקה', 'כאב גב תחתון', 'כאב כתף', 'נדודי שינה', 'כאב ברכיים', 'בעיות עיכול', 'אסתמה', 'בעיות עור'].map(s => (
                    <button
                      key={s}
                      onClick={() => setFreeTextSymptom(s)}
                      className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text hover:border-teal-primary/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview: how many points match */}
            {freeTextSymptom.length >= 2 && (() => {
              const count = points.filter(p =>
                flattenIndications(p.indications).some(ind => ind.includes(freeTextSymptom))
              ).length
              return (
                <div className="p-3 bg-teal-50 dark:bg-teal-primary/10 rounded-xl border border-teal-200 dark:border-teal-700 text-right">
                  <div className="text-sm text-teal-700 dark:text-teal-300">
                    <span className="font-bold">{count}</span> נקודות קשורות ל"{freeTextSymptom}"
                  </div>
                  <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                    השאלות הבאות יעזרו לזהות מאיפה הבעיה מגיעה ולמיין את הנקודות
                  </div>
                </div>
              )
            })()}

            {/* Continue button */}
            <button
              onClick={() => {
                if (!freeTextSymptom) return
                goGuidedNext('symptom')
              }}
              disabled={!freeTextSymptom}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-colors
                ${freeTextSymptom
                  ? 'bg-teal-primary text-white hover:bg-teal-dark'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
            >
              המשך לשאלון →
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* GUIDED PATH — Diagnostic Questions (character/triggers/associated) */}
        {/* ════════════════════════════════════════════════════════════ */}
        {path === 'guided' && (guidedStep === 'character' || guidedStep === 'triggers' || guidedStep === 'associated') && (() => {
          const question = diagnosticQuestions.find(q => q.step === guidedStep)!
          const stepIdx = guidedSteps.indexOf(guidedStep)
          const totalDiagSteps = 3
          const diagStepNum = stepIdx - guidedSteps.indexOf('character') + 1
          return (
            <div className="space-y-3">
              {/* Progress indicator */}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-gray-400 dark:text-dark-muted">שאלה {diagStepNum}/{totalDiagSteps}</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(n => (
                    <div key={n} className={`w-8 h-1.5 rounded-full ${n <= diagStepNum ? 'bg-teal-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  ))}
                </div>
              </div>

              {/* Organ scores preview (after first answer) */}
              {diagnosticAnswers.size > 0 && guidedOrganRanking.length > 0 && (
                <div className="flex gap-1.5 justify-end flex-wrap">
                  {guidedOrganRanking.slice(0, 3).map(({ organ, score }) => (
                    <span key={organ.id} className={`text-[11px] px-2 py-1 rounded-full ${organ.color.bg} ${organ.color.text} ${organ.color.border} border font-medium`}>
                      {organ.icon} {organ.hebrew} ({score})
                    </span>
                  ))}
                </div>
              )}

              <div className="text-right">
                <p className="text-sm font-bold text-gray-700 dark:text-dark-text">{question.title}</p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">{question.subtitle} (ניתן לבחור יותר מאחד)</p>
              </div>

              <div className="space-y-2">
                {question.options.map(opt => {
                  const sel = diagnosticAnswers.has(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setDiagnosticAnswers(prev => {
                          const next = new Set(prev)
                          if (next.has(opt.id)) next.delete(opt.id)
                          else next.add(opt.id)
                          return next
                        })
                      }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-right transition-colors
                        ${sel
                          ? 'bg-teal-50 dark:bg-teal-primary/20 border-teal-300 dark:border-teal-600'
                          : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border hover:border-gray-200'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                        ${sel ? 'bg-teal-primary border-teal-primary' : 'border-gray-300 dark:border-dark-border'}`}>
                        {sel && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-dark-text">{opt.text}</div>
                        <div className="text-[11px] text-gray-500 dark:text-dark-muted mt-0.5">{opt.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                <button onClick={() => goGuidedBack(guidedStep)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 text-sm">
                  ← חזרה
                </button>
                <button
                  onClick={() => goGuidedNext(guidedStep)}
                  className="flex-1 py-2.5 rounded-xl bg-teal-primary text-white font-bold text-sm"
                >
                  המשך →
                </button>
              </div>
            </div>
          )
        })()}

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
            guidedOrganRanking={guidedOrganRanking}
            freeTextSymptom={freeTextSymptom}
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
  guidedOrganRanking,
  freeTextSymptom,
  selectedSymptoms,
  location,
  palmFindings,
  onBack,
  onReset,
}: {
  guidedOrgan: OrganProfile | null
  guidedOrganRanking: { organ: OrganProfile; score: number }[]
  freeTextSymptom: string
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

  // Determine the primary organ (tissue takes precedence, then palm findings)
  const primaryOrgan = guidedOrgan ??
    (palmOrgans.size === 1 ? getOrganProfile(Array.from(palmOrgans)[0]) : null)

  // Find matching points by symptom keyword
  const matchingPoints = useMemo(() => {
    if (!freeTextSymptom || freeTextSymptom.length < 2) return []
    return points.filter(p =>
      flattenIndications(p.indications).some(ind => ind.includes(freeTextSymptom))
    )
  }, [freeTextSymptom])

  // Prioritize points that match BOTH symptom AND organ
  const organMatchedPoints = useMemo(() => {
    if (!primaryOrgan || matchingPoints.length === 0) return matchingPoints
    const organPoints = getPointsByOrgan(primaryOrgan.hebrew)
    const organPointIds = new Set(organPoints.map(op => op.point.id))

    // Sort: organ-matched first (with badge), then rest
    const matched = matchingPoints.filter(p => organPointIds.has(p.id))
    const rest = matchingPoints.filter(p => !organPointIds.has(p.id))
    return [...matched, ...rest]
  }, [matchingPoints, primaryOrgan])

  // Build summary
  const summary: string[] = []
  if (freeTextSymptom) summary.push(`🔍 "${freeTextSymptom}" — ${matchingPoints.length} נקודות`)
  if (guidedOrgan) summary.push(`רקמה → ${guidedOrgan.icon} ${guidedOrgan.hebrew}`)
  if (location.vertical) summary.push(location.vertical === 'upper' ? '↕️ מעל הטבור' : '↕️ מתחת לטבור')
  if (location.side) summary.push(location.side === 'bilateral' ? '↔️ דו-צדדי' : `↔️ ${location.side === 'right' ? 'ימין' : 'שמאל'}`)
  if (palmOrgans.size > 0) summary.push(`🖐️ ${palmOrgans.size} ממצאי כף יד`)

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

      {/* Organ ranking */}
      {guidedOrganRanking.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-600 dark:text-dark-muted text-right">🎯 איברים מעורבים (לפי ניקוד):</div>
          {guidedOrganRanking.map(({ organ, score }, i) => (
            <div key={organ.id} className={`p-3 rounded-xl border text-right ${i === 0
              ? `${organ.color.bg} ${organ.color.border} ${organ.color.darkBg}`
              : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${i === 0 ? 'bg-teal-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {score} נק׳
                </span>
                <div className={`font-bold ${i === 0 ? organ.color.text + ' ' + organ.color.darkText + ' text-base' : 'text-gray-700 dark:text-dark-text text-sm'}`}>
                  {organ.icon} {organ.hebrew} ({organ.phaseHebrew})
                </div>
              </div>
              {i === 0 && (
                <>
                  <div className="text-xs text-gray-600 dark:text-dark-muted mt-1">{organ.tissueDescription}</div>
                  <div className="mt-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-bold">📐 צד: </span>
                    {organ.sideRule.note}
                  </div>
                </>
              )}
            </div>
          ))}
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

      {/* Matching points list */}
      {organMatchedPoints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-600 dark:text-dark-muted text-right">
            📍 {organMatchedPoints.length} נקודות ל"{freeTextSymptom}"
            {primaryOrgan ? ` (ממויינות לפי ${primaryOrgan.hebrew})` : ''}
          </h3>
          {organMatchedPoints.slice(0, 20).map((point) => {
            const isOrganMatch = primaryOrgan
              ? getPointsByOrgan(primaryOrgan.hebrew).some(op => op.point.id === point.id)
              : false
            return (
              <Link
                key={point.id}
                to={`/point/${point.id}`}
                className={`block rounded-xl border p-3 hover:border-teal-primary/30 transition-colors
                  ${isOrganMatch
                    ? 'bg-teal-50/50 dark:bg-teal-primary/10 border-teal-200 dark:border-teal-700'
                    : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border'
                  }`}
              >
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="flex-1 text-right min-w-0">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      {isOrganMatch && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 font-bold">
                          {primaryOrgan!.icon} {primaryOrgan!.hebrew}
                        </span>
                      )}
                      {point.absoluteNeedle === '72' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">🥇</span>
                      )}
                      {point.absoluteNeedle === '32' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">🥈</span>
                      )}
                      <span className="font-bold text-sm text-gray-900 dark:text-dark-text">{point.hebrewName || point.pinyinName}</span>
                      <span className="text-xs font-mono text-teal-primary bg-teal-50 dark:bg-teal-primary/20 px-1.5 py-0.5 rounded">{point.id}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-dark-muted mt-0.5">
                      אזור {point.zone} · {point.pinyinName}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {organMatchedPoints.length > 20 && (
            <div className="text-center text-xs text-gray-400 py-2">
              + עוד {organMatchedPoints.length - 20} נקודות
            </div>
          )}
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
