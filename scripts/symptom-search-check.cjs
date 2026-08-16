#!/usr/bin/env node
/**
 * בדיקה: אילו נקודות עולות בחיפוש לפי תסמין.
 *
 * משחזר את ההתאמה שב-`SmartDiagnosis.tsx` - מילת מפתח מול `indications`.
 * נבנה כדי לאמת שהרשומות המצביעות באזור 33 אכן עולות בחיפוש אחרי
 * שמולאו, שכן קודם לכן ה-`indications` שלהן היה הפניה בלבד.
 *
 *   node scripts/symptom-search-check.cjs לוקמיה
 */
const fs = require('fs')
const path = require('path')

const ZONES = path.resolve(__dirname, '../src/data/zones')
const term = process.argv[2]
if (!term) { console.error('שימוש: node scripts/symptom-search-check.cjs <תסמין>'); process.exit(1) }

const hits = []
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8')
  for (const blk of src.split(/(?=\r?\n\s*\{\s*\r?\n\s*id:\s*')/)) {
    const m = blk.match(/id:\s*'([^']+)'/)
    if (!m) continue
    const am = blk.match(/\r?\n\s{4}indications:\s*\[([\s\S]*?)\r?\n\s{4}\]/)
    const one = blk.match(/\r?\n\s{4}indications:\s*\[([^\n]*)\]/)
    const body = am ? am[1] : one ? one[1] : ''
    const items = [...body.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1])
    if (items.some((i) => i.includes(term))) hits.push({ id: m[1], file: f })
  }
}

console.log(`חיפוש "${term}" — ${hits.length} נקודות`)
for (const h of hits) console.log('  ' + h.id.padEnd(14) + h.file)
