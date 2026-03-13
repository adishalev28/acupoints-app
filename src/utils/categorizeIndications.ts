import type { IndicationGroup } from '../types'

interface CategoryDef {
  name: string
  keywords: string[]
}

const categories: CategoryDef[] = [
  {
    name: 'כאב ושלד-שריר',
    keywords: [
      'כאב', 'כאבי', 'לומבגו', 'צרוויקלגיה', 'עמוד שדרה', 'ברכי', 'ברכיים',
      'כתף', 'מפרק', 'גיד', 'דרבן', 'פשיטיס', 'שוק', 'מותן', 'עקב',
      'פריצת דיסק', 'דרבנות', 'נוקשות', 'שגרון', 'ארתריטיס', 'פיברומיאלגיה',
      'קרפלית', 'CTS', 'אכילס', 'קוקסידיניה', 'וויפלש', 'נקע', 'מרפק',
      'שכמה', 'סיאטיקה', 'ירך', 'קרסול', 'אצבע', 'שורש כף',
    ],
  },
  {
    name: 'נוירולוגי ומוח',
    keywords: [
      'אפילפסיה', 'שיתוק', 'מוח', 'זעזוע', 'נוירלגיה', 'הידרוצפלוס',
      'טרמור', 'רעד', 'פרקינסון', 'טורטיקוליס', 'פנים מעוותים', 'המיפלגיה',
      'נוירופתיה', 'קרום המוח', 'גידולי מוח', 'חוסר תחושה', 'נימול',
      'עצב', 'פציאליס', 'טריגמינלי',
    ],
  },
  {
    name: 'לב וכלי דם',
    keywords: [
      'לב', 'לבבי', 'דפיקות', 'אנגינה', 'תעוקת חזה', 'לחץ דם',
      'אנדוקרדיטיס', 'אנמיה', 'ראומטי', 'הפרעות קצב', 'מיוקרדיטיס',
      'פריקרדיטיס', 'טכיקרדיה',
    ],
  },
  {
    name: 'נשימה',
    keywords: [
      'ריאות', 'שיעול', 'אסתמה', 'ברונכיטיס', 'דלקת ריאות', 'כיח',
      'פלאוריטיס', 'שחפת', 'לרינגיטיס', 'שקדים', 'גרון', 'קול',
      'אפוניה', 'צרידות', 'קוצר נשימה', 'טונסיליטיס',
    ],
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
  },
  {
    name: 'גינקולוגיה',
    keywords: [
      'רחם', 'וסת', 'לידה', 'שחלות', 'מחזור', 'מנורגיה', 'דיסמנוריאה',
      'הריון', 'שד', 'לויקוריאה', 'נרתיק', 'שליה', 'PMS', 'קדם-וסתית',
      'אנדומטר', 'שרירנים', 'ציסטות', 'אופוריטיס', 'מסטיטיס',
      'פוריות', 'עקרות', 'דימום רחמי',
    ],
  },
  {
    name: 'עיניים ואוזניים',
    keywords: [
      'עיני', 'עין', 'ראייה', 'טרכומה', 'עפעפ', 'דמע', 'קטרקט', 'גלאוקומה',
      'טינטון', 'חירשות', 'אוזן', 'שמיעה', 'קרנית', 'לחץ תוך עיני',
      'מקולרי', 'קוצר ראייה', 'אסטיגמציה', 'עיוורון', 'לבירינתיטיס',
      'קונג\'נקטיביטיס', 'בלפריטיס',
    ],
  },
  {
    name: 'כליות ושתן',
    keywords: [
      'כליות', 'שתן', 'שלפוחית', 'ערמונית', 'הרטבה', 'נפריטיס',
      'UTI', 'דרכי שתן', 'חלבון בשתן', 'אוליגוספרמיה', 'זרע',
      'אשכים', 'אורולוגי',
    ],
  },
  {
    name: 'עור',
    keywords: [
      'עור', 'אקנה', 'אקזמה', 'פסוריאזיס', 'ויטיליגו', 'הרפס',
      'דרמטיטיס', 'גרד', 'אורטיקריה', 'אלרגיות עור', 'פטרת',
    ],
  },
]

export function categorizeIndications(indications: string[]): IndicationGroup[] {
  const grouped: Record<string, string[]> = {}
  const uncategorized: string[] = []

  for (const indication of indications) {
    let matched = false
    for (const cat of categories) {
      if (cat.keywords.some(kw => indication.includes(kw))) {
        if (!grouped[cat.name]) grouped[cat.name] = []
        grouped[cat.name].push(indication)
        matched = true
        break
      }
    }
    if (!matched) {
      uncategorized.push(indication)
    }
  }

  // Build result in category order, skip empty
  const result: IndicationGroup[] = []
  for (const cat of categories) {
    if (grouped[cat.name]?.length) {
      result.push({ category: cat.name, items: grouped[cat.name] })
    }
  }
  if (uncategorized.length) {
    result.push({ category: 'כללי', items: uncategorized })
  }

  return result
}

/** Color classes per category for tag styling */
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'כאב ושלד-שריר': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  'נוירולוגי ומוח': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  'לב וכלי דם': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
  'נשימה': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
  'עיכול וכבד': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  'גינקולוגיה': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
  'עיניים ואוזניים': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  'כליות ושתן': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  'עור': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  'כללי': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
}
