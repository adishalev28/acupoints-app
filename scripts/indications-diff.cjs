#!/usr/bin/env node
/**
 * השוואת רשימות התוויות: העברית שלנו מול המקור האנגלי מאפליקציית שון.
 *
 * ההכרעה שמאחורי הכלי: האפליקציה של שון היא מקור האמת. החומר העברי הופק
 * מסריקה ישנה יותר שלה, ולכן הוא עשוי לפגר. המטרה היא שהרשימה שלנו תכסה
 * את כל מה שיש אצלו — בלי למחוק תוכן קיים.
 *
 * המקור מכיל שאריות OCR שאינן התוויות: הד של כותרת הנקודה הבאה
 * ("11.01-05 Qi Jian [-tMR] Seven Space"), מספר אזור בודד, וסוגריים
 * מרובעים עם ג'יבריש. הכלי מסנן אותן כדי שספירת הפער תהיה אמיתית.
 *
 *   node scripts/indications-diff.cjs --scope        # כמה חסר, לפי אזור
 *   node scripts/indications-diff.cjs --zone 11      # רשימת נקודות באזור
 *   node scripts/indications-diff.cjs 11.02          # שתי הרשימות זו מול זו
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'sources/app-indications')
const ZONES = path.join(ROOT, 'src/data/zones')

// --- סינון שאריות OCR ---
// פריט אינו התוויה אם הוא הד של כותרת נקודה, מספר בודד, או קצר מדי
// מכדי לשאת מידע קליני.
const isNoise = (s) => {
  const t = s.trim()
  if (t.length < 4) return true
  if (/^[^a-zA-Z]*$/.test(t)) return true // בלי אותיות לטיניות כלל
  if (/^\d{1,4}(\.\d+)?([-–]\d+)?$/.test(t)) return true // "11", "11.01-05"

  // הוראות דיקור והערות - נסרקות מאותו טאב אך אינן התוויות
  if (/[•●]/.test(t)) return true
  if (/\b(Needling|Bloodletting|Perpendicular|Caution|contraindicated|Thread the point)\b/i.test(t)) return true
  if (/\d\s*-?\s*\d*\.?\d*\s*cun\b/i.test(t)) return true

  // הד של כותרת נקודה: מזהה נקודה בכל מקום בשורה, או סוגריים מרובעים
  // (המקור עוטף שם סיני משובש ב-[...] בכותרות בלבד).
  if (/\b\d{1,4}[.@]\d{2}\b/.test(t)) return true
  if (/\[/.test(t)) return true

  // ⚠️ הכלל שלמטה החליף כלל קודם ושגוי ("אין נקודה בסוף ואין פסיק =
  // רעש"). הכלל ההוא בלע התוויות אמיתיות: Toothache, Insomnia,
  // Urticaria (hives), Prostatic Hyperplasia. **לא להחזיר אותו.**
  //
  // ההפרדה האמיתית: שאריות ה-OCR הן שמות נקודות בפין-יין, כתובים
  // Title Case לכל אורכם ("Ren Shi", "Zhong Kui Heavy Head",
  // "Huo Zhong Throat Center"). התוויות רפואיות כתובות sentence case -
  // המילה השנייה קטנה ("Eye pain", "Steaming bone syndrome") או שיש בהן
  // סוגריים מסבירים.
  // כותרות מקטע שנסרקו יחד עם ההתוויות
  if (/^(Location|Anatomy|Indications|Additional|Function)\b/.test(t)) return true
  if (/^[a-z]/.test(t)) return true // "bone (in"
  if (/\d/.test(t) && !/[.;]$/.test(t)) return true // "SiFuY1", "When trea 43"
  const tokens = t.split(/\s+/)
  if (tokens.length >= 2 && !t.includes('(') && tokens.every((w) => /^[A-Z]/.test(w))) return true

  return false
}

const app = {}
for (const f of fs.readdirSync(SRC)) {
  if (f.startsWith('_')) continue
  const j = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))
  for (const [k, v] of Object.entries(j)) if (!k.startsWith('_')) app[k] = v
}

const ours = new Map()
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8')
  for (const blk of src.split(/(?=\n\s*\{\s*\n\s*id:\s*')/)) {
    const m = blk.match(/id:\s*'([^']+)'/)
    if (!m) continue
    const zone = (blk.match(/zone:\s*'([^']+)'/) || [])[1] || '?'
    const grab = (field) => {
      const multi = blk.match(new RegExp('\\n\\s{4}' + field + ':\\s*\\[([\\s\\S]*?)\\n\\s{4}\\]'))
      const single = blk.match(new RegExp('\\n\\s{4}' + field + ':\\s*\\[([^\\n]*)\\]'))
      const body = multi ? multi[1] : single ? single[1] : null
      return body ? [...body.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]) : []
    }
    ours.set(m[1], {
      zone,
      file: f,
      items: grab('indications'),
      dong: grab('dongIndications'),
    })
  }
}

const rows = []
for (const [id, o] of ours) {
  const a = app[id]
  if (!a) continue
  if (o.items.some((x) => x.includes('כל ההתוויות של'))) continue // רשומת מצביע
  const en = (a.indications || []).filter((x) => !isNoise(x))
  rows.push({ id, zone: o.zone, file: o.file, en, he: o.items, gap: en.length - o.items.length })
}

const arg = process.argv[2]

if (arg === '--scope') {
  const byZone = {}
  for (const r of rows) {
    const z = (byZone[r.zone] ||= { total: 0, behind: 0, items: 0 })
    z.total++
    if (r.gap > 0) {
      z.behind++
      z.items += r.gap
    }
  }
  console.log('היקף הפער מול האפליקציה של שון')
  console.log('='.repeat(56))
  console.log('אזור'.padEnd(8) + 'נקודות'.padEnd(10) + 'מפגרות'.padEnd(10) + 'פריטים חסרים')
  let t = 0, b = 0, i = 0
  for (const z of Object.keys(byZone).sort()) {
    const d = byZone[z]
    console.log(z.padEnd(8) + String(d.total).padEnd(10) + String(d.behind).padEnd(10) + d.items)
    t += d.total; b += d.behind; i += d.items
  }
  console.log('-'.repeat(56))
  console.log('סה"כ'.padEnd(8) + String(t).padEnd(10) + String(b).padEnd(10) + i)
} else if (arg === '--zone') {
  const z = process.argv[3]
  for (const r of rows.filter((x) => x.zone === z).sort((a, b) => b.gap - a.gap)) {
    const tag = r.gap > 0 ? '⚠' : ' '
    console.log(`${tag} ${r.id.padEnd(16)}${r.file.padEnd(18)}אנגלית ${String(r.en.length).padStart(2)}  עברית ${String(r.he.length).padStart(2)}  פער ${r.gap > 0 ? '+' + r.gap : r.gap}`)
  }
} else if (arg) {
  const r = rows.find((x) => x.id === arg)
  if (!r) { console.error('לא נמצא: ' + arg); process.exit(1) }
  console.log('=== ' + r.id + '  (' + r.file + ') ===')
  console.log('\n--- אנגלית (' + r.en.length + ') ---')
  r.en.forEach((x, i) => console.log(String(i + 1).padStart(3) + '. ' + x))
  console.log('\n--- עברית (' + r.he.length + ') ---')
  r.he.forEach((x, i) => console.log(String(i + 1).padStart(3) + '. ' + x))
} else {
  console.error('שימוש: --scope | --zone <n> | <id>')
  process.exit(1)
}
