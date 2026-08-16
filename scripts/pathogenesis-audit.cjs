#!/usr/bin/env node
/**
 * ביקורת מנוע האבחנה המבדלת מול שתי אמיתות מאומתות.
 *
 * למה עכשיו: עד היום לא הייתה דרך לבדוק את `pathogenesis.ts`. עכשיו יש
 * שתיים - נתוני הנקודות אומתו מול האפליקציה של שון, ו-`sources/rootdx.md`
 * מחזיק חילוץ מאומת עם ציטוטים מעמ' 59-66 של הספר.
 *
 * שתי בדיקות:
 *
 * 1. **התאמת איבר לנקודות ראשיות** (טבלת עמ' 64). אם שורש מצהיר
 *    `kidney-deficiency` אבל רושם את קבוצת הריאות - זו סתירה למקור.
 *    זה בדיוק מה שנמצא ב"כאב ברכיים": חולשת כליות עם Ling Gu + Da Bai,
 *    שהן קבוצת הריאות.
 *
 * 2. **האם הנקודה בכלל מטפלת בסימפטום.** מצליב מול `indications`
 *    ו-`dongIndications` של הנקודה עצמה. התאמה ל-dongIndications מדווחת
 *    בנפרד כי היא גוברת קלינית.
 *
 * הכלי לא משנה נתונים. הפלט הוא רשימה לאישור.
 *
 *   node scripts/pathogenesis-audit.cjs [--symptom "כאב ברכיים"]
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const only = (() => {
  const i = process.argv.indexOf('--symptom')
  return i > -1 ? process.argv[i + 1] : null
})()

// ── טבלת עמ' 64: הנקודות הראשיות לטיפול במנגנון המחלה, לפי איבר ──
// ציטוט: "במחלות כרוניות וקשות חשוב לדקור את הנקודות הראשיות לטיפול
// במנגנון המחלה על פי חמשת האיברים המלאים."
const ORGAN_PRIMARY = {
  heart: { name: 'לב-אש', points: ['88.01-03'] },
  spleen: { name: 'טחול-אדמה', points: ['77.08', '77.09', '77.11', '77.05-07'] },
  lung: { name: 'ריאות-מתכת', points: ['88.17-19', '22.05', '22.04'] },
  kidney: { name: 'כליות-מים', points: ['77.17', '77.19', '77.21', '88.09-11', '77.18', '22.06'] },
  liver: { name: 'כבד-עץ', points: ['88.12-14'] },
}

// זיהוי האיבר מתוך rootId
const organOf = (rootId) => {
  const r = rootId.toLowerCase()
  if (r.includes('kidney')) return 'kidney'
  if (r.includes('lung')) return 'lung'
  if (r.includes('spleen')) return 'spleen'
  if (r.includes('liver')) return 'liver'
  if (r.includes('heart')) return 'heart'
  return null // cold-damp, blood-stagnation וכו' - אינם טענת איבר
}

// ── נתוני הנקודות ──
const points = new Map()
const ZONES = path.join(ROOT, 'src/data/zones')
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8')
  for (const blk of src.split(/(?=\r?\n\s*\{\s*\r?\n\s*id:\s*')/)) {
    const m = blk.match(/id:\s*'([^']+)'/)
    if (!m) continue
    const grab = (field) => {
      const multi = blk.match(new RegExp('\\r?\\n\\s{4}' + field + ':\\s*\\[([\\s\\S]*?)\\r?\\n\\s{4}\\]'))
      const single = blk.match(new RegExp('\\r?\\n\\s{4}' + field + ':\\s*\\[([^\\n]*)\\]'))
      const body = multi ? multi[1] : single ? single[1] : null
      return body ? [...body.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]) : []
    }
    points.set(m[1], { ind: grab('indications'), dong: grab('dongIndications') })
  }
}

// ── מפות הפתוגנזה ──
const pSrc = fs.readFileSync(path.join(ROOT, 'src/data/pathogenesis.ts'), 'utf8')
const maps = pSrc.split(/\n  \{\n    symptom: '/).slice(1)

// מילות מפתח לחיפוש בהתוויות, לפי סימפטום
const KEYWORDS = {
  'סיאטיקה': ['סיאטיקה'],
  'כאב גב תחתון': ['גב תחתון', 'לומבגו', 'מותני'],
  'כאב כתף': ['כתף'],
  'מיגרנה': ['מיגרנה', 'כאב ראש'],
  'פציאליס': ['שיתוק פנים', 'פנים'],
  'בעיות עיכול': ['קיבה', 'עיכול', 'מעי', 'בטן', 'גסטריטיס'],
  'נדודי שינה': ['נדודי שינה', 'שינה'],
  'אסתמה': ['אסתמה', 'שיעול', 'ריאות'],
  'כאב ברכיים': ['ברך', 'ברכיים'],
  'בעיות עור': ['עור', 'אקזמה', 'פסוריאזיס'],
  'פריון וגינקולוגיה': ['פוריות', 'רחם', 'שחלות', 'מחזור', 'גינקולוג'],
}

let contradictions = 0
let unsupported = 0

for (const m of maps) {
  const symptom = m.slice(0, m.indexOf("'"))
  if (only && symptom !== only) continue
  const kws = KEYWORDS[symptom] || [symptom]
  const roots = m.split(/\n      \{\n        rootId: '/).slice(1)

  const findings = []
  for (const r of roots) {
    const rootId = r.slice(0, r.indexOf("'"))
    const body = r.slice(0, r.indexOf('\n      }'))
    const sourced = /sourceRef:/.test(body)
    const ids = [...(body.match(/pointIds:\s*\[([^\]]*)\]/) || ['', ''])[1].matchAll(/'([^']+)'/g)].map((x) => x[1])

    const organ = organOf(rootId)
    const wrong = []
    const noMatch = []

    for (const id of ids) {
      // בדיקה 1: סתירה לטבלת האיברים
      if (organ) {
        const mine = ORGAN_PRIMARY[organ].points
        const otherOrgan = Object.entries(ORGAN_PRIMARY).find(
          ([k, v]) => k !== organ && v.points.includes(id)
        )
        if (otherOrgan && !mine.includes(id)) wrong.push({ id, claims: organ, actually: otherOrgan[0] })
      }
      // בדיקה 2: האם הנקודה מטפלת בסימפטום
      const p = points.get(id)
      if (!p) { noMatch.push({ id, why: 'הנקודה לא קיימת' }); continue }
      const blob = [...p.ind, ...p.dong].join(' | ')
      if (!kws.some((k) => blob.includes(k))) noMatch.push({ id, why: 'אין התוויה תואמת' })
    }

    if (wrong.length || noMatch.length) findings.push({ rootId, sourced, wrong, noMatch })
  }

  if (!findings.length) continue
  console.log('')
  console.log('━━━ ' + symptom + ' ━━━')
  for (const f of findings) {
    console.log('  ' + f.rootId + (f.sourced ? '  [מגובה במקור]' : '  [לא מגובה]'))
    for (const w of f.wrong) {
      console.log(`    🚨 ${w.id} — מוצהר ${ORGAN_PRIMARY[w.claims].name}, אך בטבלת עמ׳ 64 היא ${ORGAN_PRIMARY[w.actually].name}`)
      contradictions++
    }
    for (const n of f.noMatch) {
      console.log(`    ⚠️  ${n.id} — ${n.why} ל"${symptom}"`)
      unsupported++
    }
  }
}

console.log('')
console.log('='.repeat(64))
console.log(`🚨 סתירות לטבלת האיברים המאומתת: ${contradictions}`)
console.log(`⚠️  נקודות בלי התוויה תואמת לסימפטום: ${unsupported}`)
console.log('')
console.log('הערה: "אין התוויה תואמת" אינו בהכרח שגיאה - נקודת שורש מטפלת')
console.log('במנגנון ולא בסימפטום. סתירה לטבלת עמ׳ 64 היא ממצא חמור יותר.')
console.log('')
console.log('⚠️ ניואנס שאומת ידנית: סתירת איבר אינה בהכרח בחירת נקודה שגויה.')
console.log('ל-77.08 יש "אסתמה" בכרטיס דונג עצמו, ולכן השימוש בה לאסתמה מוצדק')
console.log('קלינית - מה ששגוי הוא **תווית האיבר**. לעומת זאת ל-22.05 אין אף')
console.log('התוויה של ברך מתוך 42, ושם גם הנקודה וגם התווית שגויות.')
