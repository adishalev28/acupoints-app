// התוויות שלא מוצגות במסך למטופל: מיניות ואיברי מין, ומחלות מפחידות.
// הנתונים עצמם לא משתנים - רק התצוגה במודל הגוף. עדי מחליט מה נכנס לכאן.

const HIDDEN_PATTERNS: { reason: 'intimate' | 'frightening'; pattern: RegExp }[] = [
  {
    reason: 'intimate',
    pattern: /זיקפ|זקפ|קיום יחסים|אין[\s-]?אונות|אימפוטנ|שפיכ|זרע|ספרמ|נרתיק|וגינ|וולוו|(^|[\s(])פות([\s),]|$)|(^|[\s(])[בה]?פין([\s),]|$)|אשכ|יחסי מין|מחלות מין|אזור המין|עגבת|זיבה|גניטל|דיספרוניה|ליבידו|חשק מיני/,
  },
  {
    reason: 'frightening',
    pattern: /סרטן|גידול|לוקמיה|לויקמיה/,
  },
]

export function isHiddenFromPatients(indication: string): boolean {
  return HIDDEN_PATTERNS.some(({ pattern }) => pattern.test(indication))
}
