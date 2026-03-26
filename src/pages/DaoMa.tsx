import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { points } from '../data/points'
import { daoMaClinicalGroups, fivePhasesNourishing, type DaoMaClinicalGroup } from '../data/daoMaGroups'

const ORGAN_ORDER = ['heart', 'spleen', 'lungs', 'kidneys', 'liver'] as const

const ORGAN_META: Record<string, { emoji: string; hebrew: string; phase: string; phaseEmoji: string; color: string; bgColor: string; borderColor: string }> = {
  heart:   { emoji: '❤️', hebrew: 'לב',    phase: 'אש',    phaseEmoji: '🔥', color: 'text-red-700 dark:text-red-300',    bgColor: 'bg-red-50 dark:bg-red-900/20',    borderColor: 'border-red-200 dark:border-red-800' },
  spleen:  { emoji: '🟡', hebrew: 'טחול',   phase: 'אדמה',  phaseEmoji: '🌍', color: 'text-amber-700 dark:text-amber-300',  bgColor: 'bg-amber-50 dark:bg-amber-900/20',  borderColor: 'border-amber-200 dark:border-amber-800' },
  lungs:   { emoji: '🫁', hebrew: 'ריאות',  phase: 'מתכת',  phaseEmoji: '⚪', color: 'text-slate-700 dark:text-slate-300',  bgColor: 'bg-slate-50 dark:bg-slate-800/40',  borderColor: 'border-slate-200 dark:border-slate-700' },
  kidneys: { emoji: '💧', hebrew: 'כליות',  phase: 'מים',   phaseEmoji: '💧', color: 'text-blue-700 dark:text-blue-300',   bgColor: 'bg-blue-50 dark:bg-blue-900/20',   borderColor: 'border-blue-200 dark:border-blue-800' },
  liver:   { emoji: '🌿', hebrew: 'כבד',    phase: 'עץ',    phaseEmoji: '🌿', color: 'text-green-700 dark:text-green-300',  bgColor: 'bg-green-50 dark:bg-green-900/20',  borderColor: 'border-green-200 dark:border-green-800' },
  gynecology: { emoji: '🩷', hebrew: 'גינקולוגיה', phase: 'מים', phaseEmoji: '💧', color: 'text-pink-700 dark:text-pink-300', bgColor: 'bg-pink-50 dark:bg-pink-900/20', borderColor: 'border-pink-200 dark:border-pink-800' },
}

function GroupCard({ group }: { group: DaoMaClinicalGroup }) {
  const [expanded, setExpanded] = useState(false)
  const meta = ORGAN_META[group.organ] || ORGAN_META.heart

  // Find actual points for this group
  const groupPoints = useMemo(() => {
    return points.filter(p => group.pointIds.includes(p.id) || p.daoMaGroup === group.id)
  }, [group])

  const nourishing = fivePhasesNourishing[group.phase]

  return (
    <div className={`rounded-2xl border ${meta.borderColor} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-right p-4 ${meta.bgColor} flex items-start gap-3 transition-colors`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900 dark:text-dark-text">
              {group.nameHebrew}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.color} border ${meta.borderColor} font-medium`}>
              {meta.phaseEmoji} {group.organHebrew}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            {group.namePinyin} · {group.nameChinese}
          </div>
          {/* Point IDs */}
          <div className="flex flex-wrap gap-1 mt-2">
            {groupPoints.map(p => (
              <Link
                key={p.id}
                to={`/point/${encodeURIComponent(p.id)}`}
                onClick={e => e.stopPropagation()}
                className="text-xs bg-white dark:bg-dark-card px-2 py-0.5 rounded-full border border-gray-200 dark:border-dark-border text-teal-primary font-medium hover:bg-teal-50 dark:hover:bg-teal-primary/10 transition-colors"
              >
                {p.id} {p.hebrewName}
              </Link>
            ))}
            {/* Show IDs that aren't individual points (merged like 88.01-03) */}
            {group.pointIds.filter(id => !groupPoints.find(p => p.id === id) && !groupPoints.find(p => p.daoMaGroup === group.id)).map(id => (
              <Link
                key={id}
                to={`/point/${encodeURIComponent(id)}`}
                onClick={e => e.stopPropagation()}
                className="text-xs bg-white dark:bg-dark-card px-2 py-0.5 rounded-full border border-gray-200 dark:border-dark-border text-teal-primary font-medium hover:bg-teal-50 dark:hover:bg-teal-primary/10 transition-colors"
              >
                {id}
              </Link>
            ))}
          </div>
          {/* Clinical focus pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {group.clinicalFocus.map(f => (
              <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-1 text-gray-400 dark:text-dark-muted transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 bg-white dark:bg-dark-card space-y-4">
          {/* Root indications */}
          {group.rootIndications.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-1.5 flex items-center gap-1.5">
                <span className="text-base">🌳</span> טיפול בשורש
              </h4>
              <ul className="space-y-1">
                {group.rootIndications.map((ind, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-teal-primary mt-0.5">●</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Branch indications */}
          {group.branchIndications.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-1.5 flex items-center gap-1.5">
                <span className="text-base">🌿</span> טיפול בענף (סימפטומים)
              </h4>
              <div className="flex flex-wrap gap-1">
                {group.branchIndications.map((ind, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Five Phases strategy */}
          {group.fivePhasesStrategy && (
            <div className={`p-3 rounded-xl ${meta.bgColor} border ${meta.borderColor}`}>
              <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-1 flex items-center gap-1.5">
                <span className="text-base">☯️</span> אסטרטגיית חמש הפאזות
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{group.fivePhasesStrategy}</p>
              {nourishing && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  אימא: {nourishing.motherHebrew} → בן: {nourishing.childHebrew}
                </div>
              )}
            </div>
          )}

          {/* Triple Warmer */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-500 dark:text-gray-400">שלושת המחממים:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.bgColor} ${meta.color}`}>
              {group.tripleWarmerHebrew}
            </span>
          </div>

          {/* Key notes */}
          {group.keyNotes && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <span className="text-base">💡</span> הערה קלינית
              </h4>
              <p className="text-sm text-amber-900 dark:text-amber-200">{group.keyNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DaoMa() {
  const [filterOrgan, setFilterOrgan] = useState<string | null>(null)

  const filteredGroups = useMemo(() => {
    if (!filterOrgan) return daoMaClinicalGroups
    return daoMaClinicalGroups.filter(g => g.organ === filterOrgan)
  }, [filterOrgan])

  // Group by organ for the organized view
  const groupedByOrgan = useMemo(() => {
    const result: Record<string, DaoMaClinicalGroup[]> = {}
    for (const organ of ORGAN_ORDER) {
      const groups = filteredGroups.filter(g => g.organ === organ)
      if (groups.length > 0) result[organ] = groups
    }
    // Add any remaining organs (like gynecology)
    const covered = new Set(ORGAN_ORDER as unknown as string[])
    for (const g of filteredGroups) {
      if (!covered.has(g.organ)) {
        if (!result[g.organ]) result[g.organ] = []
        result[g.organ].push(g)
      }
    }
    return result
  }, [filteredGroups])

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="p-1 -mr-1 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">שילובי דאו-מא 倒馬</h1>
            <p className="text-teal-100 text-sm mt-0.5">שילובי נקודות לפי איברים וחמש הפאזות</p>
          </div>
        </div>
        <div className="text-xs text-teal-200 mt-2">
          {daoMaClinicalGroups.length} קבוצות · טכניקת דיקור של 2-6 מחטים על אותו קו
        </div>
      </div>

      {/* Organ Filter */}
      <div className="px-4 -mt-3">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterOrgan(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !filterOrgan
                  ? 'bg-teal-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              הכל
            </button>
            {ORGAN_ORDER.map(organ => {
              const meta = ORGAN_META[organ]
              return (
                <button
                  key={organ}
                  onClick={() => setFilterOrgan(filterOrgan === organ ? null : organ)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterOrgan === organ
                      ? 'bg-teal-primary text-white'
                      : `${meta.bgColor} ${meta.color} hover:opacity-80`
                  }`}
                >
                  {meta.emoji} {meta.hebrew}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Clinical Principle Banner */}
      <div className="px-4 mt-4">
        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-primary/10 border border-teal-100 dark:border-teal-800 text-sm text-teal-800 dark:text-teal-200">
          <strong>עקרון:</strong> טיפול בשורש תחילה ולאחר מכן בענף. במחלות כרוניות — נקודות ראשיות לפי מנגנון המחלה (5 איברים), במצבים אקוטיים — ניתן לטפל ישירות בסימפטומים.
        </div>
      </div>

      {/* Groups by Organ */}
      <div className="px-4 mt-4 space-y-6">
        {Object.entries(groupedByOrgan).map(([organ, groups]) => {
          const meta = ORGAN_META[organ] || ORGAN_META.heart
          return (
            <div key={organ}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{meta.emoji}</span>
                <h2 className="text-base font-bold text-gray-900 dark:text-dark-text">
                  {meta.hebrew}
                </h2>
                <span className="text-xs text-gray-400 dark:text-dark-muted">
                  {meta.phaseEmoji} {meta.phase}
                </span>
                <span className="text-xs text-gray-400 dark:text-dark-muted">
                  · {groups.length} {groups.length === 1 ? 'קבוצה' : 'קבוצות'}
                </span>
              </div>
              <div className="space-y-3">
                {groups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Five Phases Diagram */}
      <div className="px-4 mt-8 mb-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border">
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-3 flex items-center gap-2">
            <span>☯️</span> מעגל ההזנה — חמש הפאזות
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">
              "במצב של חוסר — לחזק את האימא, במצב של עודף — לנקז את הבן"
            </p>
            {Object.entries(fivePhasesNourishing).map(([phase, { motherHebrew, childHebrew }]) => {
              const meta = {
                wood: ORGAN_META.liver,
                fire: ORGAN_META.heart,
                earth: ORGAN_META.spleen,
                metal: ORGAN_META.lungs,
                water: ORGAN_META.kidneys,
              }[phase] || ORGAN_META.heart
              return (
                <div key={phase} className="flex items-center gap-2 text-xs">
                  <span className={`w-16 text-center px-1.5 py-0.5 rounded-full ${meta.bgColor} ${meta.color} font-medium`}>
                    {meta.phaseEmoji} {meta.phase}
                  </span>
                  <span className="text-gray-400">←</span>
                  <span className="text-gray-500 dark:text-gray-400">אימא: {motherHebrew}</span>
                  <span className="text-gray-400 mx-1">|</span>
                  <span className="text-gray-500 dark:text-gray-400">בן: {childHebrew}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
