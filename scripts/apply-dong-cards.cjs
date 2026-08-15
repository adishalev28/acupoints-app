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

/*
 * מסלול אימות שני: השוואה ישירה של הכרטיס הראשון.
 *
 * כלל הספירה הכוללת שמרני מדי — הוא פוסל נקודה שבה כרטיס מאוחר פוצל אחרת,
 * גם כשהכרטיס הראשון, היחיד שחשוב כאן, זהה לחלוטין.
 * כשקיים המקור האנגלי מ-sources/app-indications אפשר להשוות אותו ישירות.
 */
const SRC = path.resolve(__dirname, '../sources/app-indications')
const appCard1 = new Map()
if (fs.existsSync(SRC)) {
  for (const f of fs.readdirSync(SRC)) {
    if (!f.endsWith('.json')) continue
    const data = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))
    for (const [id, rec] of Object.entries(data)) {
      if (id.startsWith('_') || !rec || !rec.dongIndications) continue
      appCard1.set(id, rec.dongIndications)
    }
  }
}

// פסיק בתוך סוגריים הוא חלק מההסבר ולא מפריד בין התוויות
function splitItems(text) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of text.replace(/\.$/, '')) {
    if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue }
    cur += ch
  }
  out.push(cur)
  if (depth !== 0) return text.replace(/\.$/, '').split(/,\s*/).map((s) => s.trim()).filter(Boolean)
  return out.map((s) => s.trim()).filter(Boolean)
}

const applied = []
const mismatch = []
const shortfall = []
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

    // מסלול א׳: הספירה הכוללת תואמת → גבולות הכרטיסים נשמרו 1:1
    // מסלול ב׳: הכרטיס הראשון אומת ישירות מול המקור האנגלי
    const en = appCard1.get(id)
    const heFirst = items.length ? splitItems(items[0]) : []
    const card1Verified = en ? heFirst.length === en.length : false
    if (en && heFirst.length < en.length) {
      shortfall.push({ id, he: heFirst.length, app: en.length })
    }
    if (items.length !== cards[id] && !card1Verified) {
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
if (shortfall.length) {
  console.log(`\n🔴 הכרטיס הראשון בעברית קצר מזה שבאפליקציה — תוכן קליני חסר: ${shortfall.length}`)
  shortfall
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((s) => console.log(`   ${s.id.padEnd(10)} עברית ${s.he} פריטים · אפליקציה ${s.app}`))
}
console.log(`\n↩️  כבר מולא: ${already.length}`)
if (notFound.size) console.log(`\n❓ מזהים שלא נמצאו בנתונים: ${[...notFound].join(', ')}`)
if (!WRITE) console.log('\n(dry run — הרץ עם --write לכתיבה)')
