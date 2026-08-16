#!/usr/bin/env node
/**
 * הזרקת פריטי התוויות למקום מדויק ברשימה העברית.
 *
 * למה לא להוסיף בסוף: סדר הרשימה העברית משקף את סדר הכרטיסים באפליקציה
 * של שון. הוספה בסוף שוברת את ההתאמה ומקשה על השוואה עתידית.
 *
 * קלט: קובץ JSON בצורה { "44.11": [[5, "טקסט"], [7, "טקסט"]] }
 * המספר הוא האינדקס (0-based) שאליו הפריט נכנס ברשימה העברית הסופית.
 * ההזרקות מוחלות בסדר יורד כדי שהזרקה מוקדמת לא תזיז את המאוחרות.
 *
 * אפוסטרופים בטקסט מוברחים אוטומטית - זו הייתה תקלה אמיתית שסגרה
 * 14 מחרוזות TypeScript באמצע בלי ש-tsc יתפוס.
 *
 *   node scripts/insert-indications.cjs patch.json [--dry]
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ZONES = path.join(ROOT, 'src/data/zones')
const dry = process.argv.includes('--dry')
const patch = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))

// איתור הקובץ והבלוק של כל מזהה
const files = fs.readdirSync(ZONES).filter((f) => f.endsWith('.ts'))
let done = 0

for (const [id, inserts] of Object.entries(patch)) {
  let hit = null
  for (const f of files) {
    // נרמול CRLF→LF: git ממיר לסופי שורה של חלונות בעותק העבודה, וכל
    // הרג'קסים כאן מניחים \n. בלי זה הכלי "לא מוצא" מערכים קיימים.
    // הכתיבה חוזרת ב-LF, כפי שהריפו שומר.
    const src = fs.readFileSync(path.join(ZONES, f), 'utf8').replace(/\r\n/g, '\n')
    // הבלוק מתחיל ב-`{` שאחריו מיד `id:` - אין להוסיף הערות ביניהם
    const re = new RegExp("\\n(\\s*)\\{\\s*\\n\\s*id:\\s*'" + id.replace(/\./g, '\\.') + "',")
    const m = src.match(re)
    if (m) { hit = { f, src, at: m.index }; break }
  }
  if (!hit) { console.error('✗ לא נמצא: ' + id); continue }

  // מערך indications של הבלוק הזה בלבד
  const after = hit.src.slice(hit.at)
  const am = after.match(/\n(\s{4})indications:\s*\[\n([\s\S]*?)\n\s{4}\]/)
  if (!am) { console.error('✗ אין indications רב-שורתי: ' + id); continue }

  const indent = am[1] + '  '
  const lines = am[2].split('\n')
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

  // האינדקסים מתייחסים לרשימה **הסופית**, לכן סדר עולה: כל הזרקה דוחפת
  // את הבאות אחריה בדיוק למקום שנועד להן. (סדר יורד היה נכון רק אילו
  // האינדקסים התייחסו לרשימה המקורית - זה היה באג.)
  let applied = 0
  for (const [idx, text] of [...inserts].sort((a, b) => a[0] - b[0])) {
    if (idx > lines.length) { console.error(`✗ ${id}: אינדקס ${idx} מעבר לסוף (${lines.length})`); continue }
    lines.splice(idx, 0, indent + "'" + esc(text) + "',")
    applied++
  }
  if (applied !== inserts.length) console.error(`  ⚠ ${id}: ${applied}/${inserts.length} הוזרקו`)

  const rebuilt = '\n' + am[1] + 'indications: [\n' + lines.join('\n') + '\n' + am[1] + ']'
  const updated = hit.src.slice(0, hit.at) + after.replace(am[0], rebuilt)

  if (updated === hit.src) { console.error('✗ ללא שינוי: ' + id); continue }
  if (!dry) fs.writeFileSync(path.join(ZONES, hit.f), updated)
  console.log(`✓ ${id.padEnd(14)} +${applied}  (${hit.f})`)
  done++
}

console.log('')
console.log((dry ? '[יבש] ' : '') + done + ' נקודות עודכנו')
