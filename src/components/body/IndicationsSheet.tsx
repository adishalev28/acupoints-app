import { useEffect } from 'react'
import { points as allPoints } from '../../data/points'
import type { TungGroup } from '../../data/bodyModel/tungGroups'
import { isHiddenFromPatients } from '../../data/bodyModel/patientFilter'
import { flattenIndications, isGroupedIndications, type Point } from '../../types'

/** קבוצת דונג, או נקודה בודדת (למשל נקודת אצבע) באותה צורה */
type SheetGroup = Pick<TungGroup, 'id' | 'hebrewName' | 'chineseName' | 'pointIds'>

interface Props {
  group: SheetGroup
  onClose: () => void
}

interface LaterSection {
  category: string | null
  items: string[]
}

/** מפצל פריט שמכיל כמה התוויות מופרדות בפסיקים או בלוכסן עם רווחים, בלי לפצל בתוך סוגריים */
function splitItems(text: string): string[] {
  if (text.includes(' / ')) return text.split(' / ').flatMap(splitItems)
  const out: string[] = []
  let depth = 0
  let current = ''
  for (const ch of text) {
    if (ch === '(') depth++
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      if (current.trim()) out.push(current.trim())
      current = ''
    } else current += ch
  }
  if (current.trim()) out.push(current.trim())
  return out
}

/** השוואה סלחנית: בלי רווחים, מקפים וסימני פיסוק, ובלי תוכן בסוגריים */
const normalize = (text: string) => text.replace(/\([^)]*\)/g, '').replace(/[\s\-–/,.·]+/g, '').replace(/או/g, '')

/** רשומות הנתונים של הקבוצה: רשומה אחת לכל הקבוצה, או רשומה לכל נקודה */
function groupRecords(group: SheetGroup): Point[] {
  const whole = allPoints.find(p => p.id === group.id)
  if (whole) return [whole]
  return group.pointIds.map(id => allPoints.find(p => p.id === id)).filter((p): p is Point => Boolean(p))
}

function buildLists(group: SheetGroup) {
  const records = groupRecords(group)
  const dong: string[] = []
  const seen = new Set<string>()
  const add = (list: string[], item: string) => {
    const key = normalize(item)
    if (!key || seen.has(key) || isHiddenFromPatients(item)) return
    seen.add(key)
    list.push(item)
  }
  for (const record of records) {
    for (const entry of record.dongIndications ?? []) splitItems(entry).forEach(item => add(dong, item))
  }

  const later: LaterSection[] = []
  for (const record of records) {
    const sections: LaterSection[] = isGroupedIndications(record.indications)
      ? record.indications.map(g => ({ category: g.category, items: g.items }))
      : [{ category: null, items: flattenIndications(record.indications) }]
    for (const section of sections) {
      const items: string[] = []
      section.items.flatMap(splitItems).forEach(item => add(items, item))
      if (!items.length) continue
      const existing = later.find(l => l.category === section.category)
      if (existing) existing.items.push(...items)
      else later.push({ category: section.category, items })
    }
  }
  const verified = records.every(r => r.dongIndications?.length)
  return { dong, later, verified }
}

export default function IndicationsSheet({ group, onClose }: Props) {
  const { dong, later, verified } = buildLists(group)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="absolute inset-0 z-20 bg-[#0b1415]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`במה עוזרות הנקודות ${group.hebrewName}`}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#f7f4ee] text-[#1d2b2c] shadow-2xl select-text"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#1d2b2c]/10">
          <div>
            <p className="text-sm text-[#5f7473]">
              במה הנקודות עוזרות · <span dir="ltr" className="tabular-nums">{group.id}</span> · {group.chineseName}
            </p>
            <h2 className="text-2xl font-bold mt-0.5 text-balance">{group.hebrewName}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full grid place-items-center bg-[#1d2b2c]/5 hover:bg-[#1d2b2c]/10"
            aria-label="סגירה"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-5 space-y-7 touch-pan-y overscroll-contain">
          {dong.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#0d7377]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e0a93b]" aria-hidden="true" />
                במה השתמש מאסטר דונג
              </h3>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {dong.map(item => (
                  <li key={item} className="flex gap-3 text-[18px] leading-snug font-medium">
                    <span className="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-[#e0a93b]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {later.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-[#5f7473]">
                {dong.length ? 'מה הוסיפו המטפלים שבאו אחריו' : 'התוויות'}
              </h3>
              <div className="mt-3 space-y-4">
                {later.map(section => (
                  <div key={section.category ?? 'all'}>
                    {section.category && <p className="text-sm font-medium text-[#5f7473] mb-1.5">{section.category}</p>}
                    <ul className="flex flex-wrap gap-2">
                      {section.items.map(item => (
                        <li key={item} className="rounded-full bg-[#1d2b2c]/[0.06] px-3 py-1 text-[15px] text-[#34494a]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!verified && dong.length > 0 && (
            <p className="text-xs text-[#5f7473]">חלק מהנקודות בקבוצה עוד לא אומתו מול המקור של דונג.</p>
          )}
        </div>
      </div>
    </div>
  )
}
