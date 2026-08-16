#!/usr/bin/env node
/**
 * כמה ממנוע האבחנה המבדלת מגובה במקור.
 *
 * `pathogenesis.ts` הוא מה שבוחר אילו נקודות מתאימות לשורש הבעיה, ולכן
 * הוא תקרת הדיוק של כל תוכנית טיפול. הקובץ עצמו מתעד שרשומות בלי
 * `sourceRef` נכתבו במרץ 2026 בלי אימות מול הספר.
 *
 * הכלי סופר לפי **שורש**, לא לפי מופעי מחרוזת. ספירת `grep -c` נותנת
 * מספר שגוי כי כמה שורשים חולקים שורה ויש התאמות בהגדרת הטיפוס.
 *
 *   node scripts/pathogenesis-coverage.cjs
 */
const fs = require('fs')

const src = fs.readFileSync('src/data/pathogenesis.ts', 'utf8')

// גוף המפה מתחיל אחרי הגדרות הטיפוסים
const maps = src.split(/\n  \{\n    symptom: '/).slice(1)

let totalRoots = 0
let totalSourced = 0
const rows = []

for (const m of maps) {
  const symptom = m.slice(0, m.indexOf("'"))
  // כל שורש הוא בלוק שמתחיל ב-rootId
  const roots = m.split(/\n      \{\n        rootId: '/).slice(1)
  const sourced = roots.filter((r) => /sourceRef:/.test(r.slice(0, r.indexOf('\n      }')))).length
  totalRoots += roots.length
  totalSourced += sourced
  rows.push({ symptom, roots: roots.length, sourced })
}

rows.sort((a, b) => a.sourced / a.roots - b.sourced / b.roots)

console.log('כיסוי מקור במנוע האבחנה המבדלת')
console.log('='.repeat(56))
console.log('סימפטום'.padEnd(22) + 'שורשים'.padEnd(10) + 'מגובים'.padEnd(10) + 'מצב')
console.log('-'.repeat(56))
for (const r of rows) {
  const tag = r.sourced === r.roots ? '✅' : r.sourced === 0 ? '🚨 אף אחד' : '⚠️  חלקי'
  console.log(r.symptom.padEnd(22) + String(r.roots).padEnd(10) + String(r.sourced).padEnd(10) + tag)
}
console.log('-'.repeat(56))
const pct = totalRoots ? Math.round((totalSourced / totalRoots) * 100) : 0
console.log(`סה"כ ${totalSourced}/${totalRoots} שורשים מגובים (${pct}%)`)
