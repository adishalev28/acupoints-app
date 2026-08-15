#!/usr/bin/env node
/**
 * ממלא Point.dongIndications על סמך scripts/dong-cards.json.
 *
 * הכלל: אם מספר ההתוויות בעברית שווה למספר הכרטיסים באפליקציה של שון,
 * אז החילוץ שמר על גבולות הכרטיסים 1:1, ולכן ההתוויה הראשונה = הכרטיס
 * הראשון = ההתוויות של מאסטר דונג.
 *
 * אם המספרים לא תואמים — הנקודה מדווחת לבדיקה ידנית ולא נוגעים בה.
 * זה מכוון: עדיף לדווח מאשר לנחש בהקשר קליני.
 *
 *   node scripts/apply-dong-cards.cjs           # דוח בלבד (dry run)
 *   node scripts/apply-dong-cards.cjs --write   # כתיבה בפועל
 */
const fs = require('fs')
const path = require('path')

const D = path.resolve(__dirname, '../src/data/zones')
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, 'dong-cards.json'), 'utf8')).cards
const WRITE = process.argv.includes('--write')

const applied = []
const mismatch = []
const already = []
const notFound = new Set(Object.keys(cards))

for (const f of fs.readdirSync(D)) {
  const file = path.join(D, f)
  let src = fs.readFileSync(file, 'utf8')
  let changed = false

  // עובדים מהסוף להתחלה כדי שהאינדקסים לא יזוזו
  // חלק מהקבצים ב-CRLF וחלק ב-LF — הביטוי חייב לסבול את שניהם
  const points = [...src.matchAll(/\r?\n  \{\r?\n(?:.|\n|\r)*?\r?\n  \},/g)].reverse()

  for (const pm of points) {
    const block = pm[0]
    const id = (block.match(/id: '([^']+)'/) || [])[1]
    if (!id || !(id in cards)) continue
    notFound.delete(id)

    if (/dongIndications:/.test(block)) {
      already.push(id)
      continue
    }

    const indMatch = block.match(/(\r?\n    indications: \[)((?:.|\n|\r)*?)(\r?\n    \],)/)
    if (!indMatch) continue
    const items = [...indMatch[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1])

    if (items.length !== cards[id]) {
      mismatch.push({ id, he: items.length, app: cards[id] })
      continue
    }

    const first = items[0]
    const nl = block.includes('\r\n') ? '\r\n' : '\n'
    const insert =
      `${nl}    // אומת מול צילום האפליקציה של שון — הכרטיס הראשון = דונג${nl}` +
      `    dongIndications: [${nl}      '${first}',${nl}    ],`
    src =
      src.slice(0, pm.index) +
      block.replace(indMatch[1], insert + indMatch[1]) +
      src.slice(pm.index + block.length)
    changed = true
    applied.push(id)
  }

  if (changed && WRITE) fs.writeFileSync(file, src)
}

console.log(`✅ הוחל: ${applied.length}`)
if (applied.length) console.log('   ' + applied.sort().join(', '))
console.log(`\n⚠️  לבדיקה ידנית (ספירה לא תואמת): ${mismatch.length}`)
mismatch
  .sort((a, b) => a.id.localeCompare(b.id))
  .forEach((m) => console.log(`   ${m.id.padEnd(10)} עברית ${String(m.he).padStart(2)} · אפליקציה ${m.app}`))
console.log(`\n↩️  כבר מולא: ${already.length}`)
if (notFound.size) console.log(`\n❓ מזהים שלא נמצאו בנתונים: ${[...notFound].join(', ')}`)
if (!WRITE) console.log('\n(dry run — הרץ עם --write לכתיבה)')
