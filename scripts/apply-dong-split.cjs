#!/usr/bin/env node
/**
 * ממלא dongIndications לנקודות שבהן החילוץ העברי **פיצל** כל פריט
 * מכרטיס דונג לרשומה נפרדת, במקום לשמור אותו כשורה אחת.
 *
 * זה המצב באזור 88, בניגוד לאזור 77. לכן apply-dong-cards.cjs,
 * שמניח שההתוויה הראשונה = הכרטיס כולו, לא מתאים כאן.
 *
 * הכלל: אם בכרטיס הראשון באפליקציה יש N פריטים, אז N ההתוויות
 * הראשונות בעברית הן ההתוויות של דונג.
 *
 * אימות: מספר ההתוויות בעברית חייב להיות בדיוק
 *   N + (מספר הכרטיסים באפליקציה - 1)
 * כלומר כל שאר הכרטיסים נשארו רשומה אחת כל אחד. אם החשבון לא
 * מסתדר, פוצלו גם כרטיסים מאוחרים ואי אפשר לדעת איפה עובר הגבול —
 * הנקודה מדווחת ולא נוגעים בה.
 *
 *   node scripts/apply-dong-split.cjs           # דוח בלבד
 *   node scripts/apply-dong-split.cjs --write
 */
const fs = require('fs')
const path = require('path')

const D = path.resolve(__dirname, '../src/data/zones')
const SRC = path.resolve(__dirname, '../sources/app-indications')
const WRITE = process.argv.includes('--write')

const app = new Map()
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.json')) continue
  const data = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))
  for (const [id, rec] of Object.entries(data)) {
    if (id.startsWith('_') || !rec || !rec.dongIndications) continue
    app.set(id, { n: rec.dongIndications.length, cards: rec.indications.length + 1 })
  }
}

const applied = []
const skipped = []

for (const f of fs.readdirSync(D)) {
  const file = path.join(D, f)
  let src = fs.readFileSync(file, 'utf8')
  let changed = false

  // מהסוף להתחלה כדי שהאינדקסים לא יזוזו
  const points = [...src.matchAll(/\r?\n {2}\{\r?\n(?:.|\n|\r)*?\r?\n {2}\},/g)].reverse()

  for (const pm of points) {
    const block = pm[0]
    const id = (block.match(/id: '([^']+)'/) || [])[1]
    if (!id || !app.has(id)) continue
    if (/dongIndications:/.test(block)) continue

    const indMatch = block.match(/(\r?\n {4}indications: \[)((?:.|\n|\r)*?)(\r?\n {4}\],)/)
    if (!indMatch) continue
    const items = [...indMatch[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1])

    const { n, cards } = app.get(id)
    const expected = n + cards - 1
    if (items.length !== expected || items.length < n) {
      skipped.push({ id, he: items.length, expected, n, cards })
      continue
    }

    const nl = block.includes('\r\n') ? '\r\n' : '\n'
    const list = items.slice(0, n).map((t) => `      '${t}',`).join(nl)
    const insert =
      `${nl}    // אומת מול צילום האפליקציה של שון: הכרטיס הראשון מכיל ${n} פריטים,` +
      `${nl}    // והחילוץ העברי פיצל כל אחד מהם לרשומה נפרדת.${nl}` +
      `    dongIndications: [${nl}${list}${nl}    ],`
    src =
      src.slice(0, pm.index) +
      block.replace(indMatch[1], insert + indMatch[1]) +
      src.slice(pm.index + block.length)
    changed = true
    applied.push(`${id} (${n})`)
  }

  if (changed && WRITE) fs.writeFileSync(file, src)
}

console.log(`✅ הוחל: ${applied.length}`)
if (applied.length) console.log('   ' + applied.sort().join(', '))
console.log(`\n⚠️  לבדיקה ידנית: ${skipped.length}`)
skipped
  .sort((a, b) => a.id.localeCompare(b.id))
  .forEach((s) =>
    console.log(
      `   ${s.id.padEnd(11)} עברית ${String(s.he).padStart(3)} · צפוי ${String(s.expected).padStart(3)}` +
      `  (כרטיס ראשון ${s.n} פריטים + ${s.cards - 1} כרטיסים)`
    )
  )
if (!WRITE) console.log('\n(dry run — הרץ עם --write לכתיבה)')
