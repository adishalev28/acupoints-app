#!/usr/bin/env node
/**
 * כלי השוואה ידנית לנקודות ש-apply-dong-split.cjs סירב לגעת בהן.
 *
 * הסקריפט האוטומטי דורש שמספר ההתוויות בעברית יהיה בדיוק
 * N + (מספר הכרטיסים - 1). כשהחשבון לא מסתדר, סימן שגם כרטיסים
 * מאוחרים פוצלו לרשומות נפרדות — אבל זה **לא מזיז את הגבול**:
 * אם הסדר נשמר, N ההתוויות הראשונות בעברית עדיין הן כרטיס דונג.
 *
 * הכלי מציג את שני הצדדים זה מול זה כדי לאמת את הגבול בעיניים,
 * ואז מאפשר להחיל אותו במפורש.
 *
 *   node scripts/dong-compare.cjs 88.15              # הצגה
 *   node scripts/dong-compare.cjs 88.15 --take 7     # תצוגה מקדימה של החיתוך
 *   node scripts/dong-compare.cjs 88.15 --take 7 --write
 *   node scripts/dong-compare.cjs --todo             # מה עוד ממתין
 */
const fs = require('fs')
const path = require('path')

const D = path.resolve(__dirname, '../src/data/zones')
const SRC = path.resolve(__dirname, '../sources/app-indications')

const WRITE = process.argv.includes('--write')
const TODO = process.argv.includes('--todo')
const takeIdx = process.argv.indexOf('--take')
const TAKE = takeIdx > -1 ? Number(process.argv[takeIdx + 1]) : null
const ID = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null

// --- צד האפליקציה ---
const app = new Map()
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.json')) continue
  const data = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))
  for (const [id, rec] of Object.entries(data)) {
    if (id.startsWith('_') || !rec || !rec.dongIndications) continue
    app.set(id, { dong: rec.dongIndications, rest: rec.indications || [] })
  }
}

// --- צד העברית ---
const BLOCK_RE = /\r?\n {2}\{\r?\n(?:.|\n|\r)*?\r?\n {2}\},/g
function scanZones() {
  const out = new Map()
  for (const f of fs.readdirSync(D)) {
    const src = fs.readFileSync(path.join(D, f), 'utf8')
    for (const m of src.matchAll(BLOCK_RE)) {
      const block = m[0]
      const id = (block.match(/id: '([^']+)'/) || [])[1]
      if (!id) continue
      const ind = block.match(/(\r?\n {4}indications: \[)((?:.|\n|\r)*?)(\r?\n {4}\],)/)
      const items = ind ? [...ind[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]) : []
      out.set(id, { file: f, items, hasDong: /dongIndications:/.test(block) })
    }
  }
  return out
}
const hebrew = scanZones()

if (TODO) {
  const rows = []
  for (const [id, a] of app) {
    const h = hebrew.get(id)
    if (!h || h.hasDong) continue
    rows.push({ id, he: h.items.length, n: a.dong.length, expected: a.dong.length + a.rest.length })
  }
  rows.sort((x, y) => x.id.localeCompare(y.id))
  console.log(`ממתינות להשוואה ידנית: ${rows.length}\n`)
  for (const r of rows) {
    console.log(
      `  ${r.id.padEnd(11)} עברית ${String(r.he).padStart(3)} · צפוי ${String(r.expected).padStart(3)}` +
      `  →  --take ${r.n}`
    )
  }
  process.exit(0)
}

if (!ID) {
  console.error('שימוש: node scripts/dong-compare.cjs <id> [--take N] [--write]  |  --todo')
  process.exit(1)
}
if (!app.has(ID)) {
  console.error(`אין מקור אפליקציה ל-${ID}`)
  process.exit(1)
}
if (!hebrew.has(ID)) {
  console.error(`הנקודה ${ID} לא נמצאה בנתוני הזונות`)
  process.exit(1)
}

const a = app.get(ID)
const h = hebrew.get(ID)
const N = a.dong.length

if (!WRITE) {
  console.log(`═══ ${ID} ═══  (${h.file})`)
  if (h.hasDong) console.log('⚠️  לנקודה כבר יש dongIndications\n')

  console.log(`── כרטיס דונג באפליקציה — ${N} פריטים ──`)
  a.dong.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. ${t}`))

  const cut = TAKE ?? N
  console.log(`\n── ההתוויות בעברית — ${h.items.length} פריטים ──`)
  h.items.forEach((t, i) => {
    if (i === cut) console.log('  ' + '─'.repeat(40) + ' גבול דונג ' + '─'.repeat(10))
    console.log(`  ${String(i + 1).padStart(2)}. ${t}`)
  })
  if (cut >= h.items.length) console.log('  ' + '─'.repeat(40) + ' גבול דונג ' + '─'.repeat(10))

  console.log(`\n── שאר הכרטיסים באפליקציה — ${a.rest.length} ──`)
  a.rest.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. ${t}`))

  if (TAKE) console.log(`\n(תצוגה מקדימה של --take ${TAKE}. הוסף --write להחלה)`)
  process.exit(0)
}

// --- כתיבה ---
if (!TAKE) {
  console.error('כתיבה דורשת --take N מפורש')
  process.exit(1)
}
if (h.hasDong) {
  console.error(`ל-${ID} כבר יש dongIndications — הסר אותו ידנית קודם`)
  process.exit(1)
}
if (TAKE < 1 || TAKE > h.items.length) {
  console.error(`--take ${TAKE} מחוץ לטווח (1..${h.items.length})`)
  process.exit(1)
}

const file = path.join(D, h.file)
let src = fs.readFileSync(file, 'utf8')
const blocks = [...src.matchAll(BLOCK_RE)]
const pm = blocks.find((m) => (m[0].match(/id: '([^']+)'/) || [])[1] === ID)
const block = pm[0]
const indMatch = block.match(/(\r?\n {4}indications: \[)((?:.|\n|\r)*?)(\r?\n {4}\],)/)

const nl = block.includes('\r\n') ? '\r\n' : '\n'
const list = h.items.slice(0, TAKE).map((t) => `      '${t}',`).join(nl)
const note =
  TAKE === N
    ? `הגבול תואם את ${N} פריטי הכרטיס.`
    : `נלקחו ${TAKE} פריטים מול ${N} פריטים בכרטיס — ראה הערה בהודעת הקומיט.`
const insert =
  `${nl}    // אומת ידנית מול צילום האפליקציה של שון: הכרטיס הראשון מכיל ${N} פריטים.` +
  `${nl}    // ${note}${nl}` +
  `    dongIndications: [${nl}${list}${nl}    ],`

src =
  src.slice(0, pm.index) +
  block.replace(indMatch[1], insert + indMatch[1]) +
  src.slice(pm.index + block.length)
fs.writeFileSync(file, src)
console.log(`✅ ${ID} — נכתבו ${TAKE} התוויות דונג אל ${h.file}`)
