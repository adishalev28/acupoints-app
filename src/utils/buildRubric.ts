import { points } from '../data/points'
import { flattenIndications } from '../types'
import type { Point } from '../types'

export interface RubricEntry {
  indication: string
  pointIds: string[]
}

export interface RubricCategory {
  name: string
  color: { bg: string; text: string; border: string; darkBg: string; darkText: string }
  icon: string
  entries: RubricEntry[]
}

interface CategoryDef {
  name: string
  keywords: string[]
  color: { bg: string; text: string; border: string; darkBg: string; darkText: string }
  icon: string
}

const categoryDefs: CategoryDef[] = [
  {
    name: 'כאב ושלד-שריר',
    keywords: [
      'כאב', 'כאבי', 'לומבגו', 'צרוויקלגיה', 'עמוד שדרה', 'ברכי', 'ברכיים',
      'כתף', 'מפרק', 'גיד', 'דרבן', 'פשיטיס', 'שוק', 'מותן', 'עקב',
      'פריצת דיסק', 'דרבנות', 'נוקשות', 'שגרון', 'ארתריטיס', 'פיברומיאלגיה',
      'קרפלית', 'CTS', 'אכילס', 'קוקסידיניה', 'וויפלש', 'נקע', 'מרפק',
      'שכמה', 'סיאטיקה', 'ירך', 'קרסול', 'אצבע', 'שורש כף',
    ],
    color: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-300' },
    icon: '🦴',
  },
  {
    name: 'נוירולוגי ומוח',
    keywords: [
      'אפילפסיה', 'שיתוק', 'מוח', 'זעזוע', 'נוירלגיה', 'הידרוצפלוס',
      'טרמור', 'רעד', 'פרקינסון', 'טורטיקוליס', 'פנים מעוותים', 'המיפלגיה',
      'נוירופתיה', 'קרום המוח', 'גידולי מוח', 'חוסר תחושה', 'נימול',
      'עצב', 'פציאליס', 'טריגמינלי',
    ],
    color: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-300' },
    icon: '🧠',
  },
  {
    name: 'לב וכלי דם',
    keywords: [
      'לב', 'לבבי', 'דפיקות', 'אנגינה', 'תעוקת חזה', 'לחץ דם',
      'אנדוקרדיטיס', 'אנמיה', 'ראומטי', 'הפרעות קצב', 'מיוקרדיטיס',
      'פריקרדיטיס', 'טכיקרדיה',
    ],
    color: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-300' },
    icon: '❤️',
  },
  {
    name: 'נשימה',
    keywords: [
      'ריאות', 'שיעול', 'אסתמה', 'ברונכיטיס', 'דלקת ריאות', 'כיח',
      'פלאוריטיס', 'שחפת', 'לרינגיטיס', 'שקדים', 'גרון', 'קול',
      'אפוניה', 'צרידות', 'קוצר נשימה', 'טונסיליטיס',
    ],
    color: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', darkBg: 'dark:bg-cyan-900/30', darkText: 'dark:text-cyan-300' },
    icon: '🫁',
  },
  {
    name: 'עיכול וכבד',
    keywords: [
      'קיבה', 'מעי', 'כבד', 'בטן', 'שלשול', 'עצירות', 'בחילה', 'הקאה',
      'גסטריטיס', 'טחול', 'IBS', 'מעי הרגיז', 'דיזנטריה', 'כולרה',
      'טחורים', 'שחמת', 'כולסטרול', 'הצטברות מזון', 'דלקת מעיים',
      'חומצה', 'רפלוקס', 'GERD', 'כיס מרה', 'פיסורה', 'פרוקטיטיס',
      'נפיחות', 'גזים',
    ],
    color: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-300' },
    icon: '🫃',
  },
  {
    name: 'גינקולוגיה',
    keywords: [
      'רחם', 'וסת', 'לידה', 'שחלות', 'מחזור', 'מנורגיה', 'דיסמנוריאה',
      'הריון', 'שד', 'לויקוריאה', 'נרתיק', 'שליה', 'PMS', 'קדם-וסתית',
      'אנדומטר', 'שרירנים', 'ציסטות', 'אופוריטיס', 'מסטיטיס',
      'פוריות', 'עקרות', 'דימום רחמי',
    ],
    color: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', darkBg: 'dark:bg-pink-900/30', darkText: 'dark:text-pink-300' },
    icon: '🌸',
  },
  {
    name: 'עיניים ואוזניים',
    keywords: [
      'עיני', 'עין', 'ראייה', 'טרכומה', 'עפעפ', 'דמע', 'קטרקט', 'גלאוקומה',
      'טינטון', 'חירשות', 'אוזן', 'שמיעה', 'קרנית', 'לחץ תוך עיני',
      'מקולרי', 'קוצר ראייה', 'אסטיגמציה', 'עיוורון', 'לבירינתיטיס',
      'קונג\'נקטיביטיס', 'בלפריטיס',
    ],
    color: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-300' },
    icon: '👁️',
  },
  {
    name: 'כליות ושתן',
    keywords: [
      'כליות', 'שתן', 'שלפוחית', 'ערמונית', 'הרטבה', 'נפריטיס',
      'UTI', 'דרכי שתן', 'חלבון בשתן', 'אוליגוספרמיה', 'זרע',
      'אשכים', 'אורולוגי',
    ],
    color: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300' },
    icon: '💧',
  },
  {
    name: 'עור',
    keywords: [
      'עור', 'אקנה', 'אקזמה', 'פסוריאזיס', 'ויטיליגו', 'הרפס',
      'דרמטיטיס', 'גרד', 'אורטיקריה', 'אלרגיות עור', 'פטרת',
    ],
    color: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-300' },
    icon: '🩹',
  },
]

function categorizeIndication(indication: string): string {
  for (const cat of categoryDefs) {
    if (cat.keywords.some(kw => indication.includes(kw))) {
      return cat.name
    }
  }
  return 'כללי'
}

function buildRubricData(): RubricCategory[] {
  // Map: indication → Set<pointId>
  // Keep indications as-is from the data (no splitting on commas)
  const indicationToPoints = new Map<string, Set<string>>()

  for (const point of points) {
    const indications = flattenIndications(point.indications)
    for (const rawInd of indications) {
      const trimmed = rawInd.trim()
      if (!trimmed) continue
      if (!indicationToPoints.has(trimmed)) {
        indicationToPoints.set(trimmed, new Set())
      }
      indicationToPoints.get(trimmed)!.add(point.id)
    }
  }

  // Group by category
  const categoryMap = new Map<string, RubricEntry[]>()

  for (const [indication, pointIdSet] of indicationToPoints) {
    const catName = categorizeIndication(indication)
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, [])
    }
    categoryMap.get(catName)!.push({
      indication,
      pointIds: Array.from(pointIdSet),
    })
  }

  // Sort entries within each category: by number of points (desc), then alphabetically
  for (const entries of categoryMap.values()) {
    entries.sort((a, b) => b.pointIds.length - a.pointIds.length || a.indication.localeCompare(b.indication, 'he'))
  }

  // Build result in category order
  const result: RubricCategory[] = []
  for (const def of categoryDefs) {
    const entries = categoryMap.get(def.name)
    if (entries?.length) {
      result.push({
        name: def.name,
        color: def.color,
        icon: def.icon,
        entries,
      })
    }
  }

  // Add uncategorized
  const general = categoryMap.get('כללי')
  if (general?.length) {
    result.push({
      name: 'כללי',
      color: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', darkBg: 'dark:bg-gray-800', darkText: 'dark:text-gray-400' },
      icon: '📋',
      entries: general,
    })
  }

  return result
}

// Pre-compute once at module load
export const rubricData = buildRubricData()

// Helper: get all points for a given indication
export function getPointsForIndication(indication: string): Point[] {
  const entry = rubricData
    .flatMap(cat => cat.entries)
    .find(e => e.indication === indication)
  if (!entry) return []
  return entry.pointIds
    .map(id => points.find(p => p.id === id))
    .filter((p): p is Point => !!p)
}

// Helper: total unique indications
export function getTotalIndications(): number {
  return rubricData.reduce((sum, cat) => sum + cat.entries.length, 0)
}
