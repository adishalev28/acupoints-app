#!/usr/bin/env node
/**
 * מייצר גיליון עזר להצלבת ההתוויות מול צילומי האפליקציה של שון.
 * לכל נקודה: ההתוויות בעברית ממוספרות + סימון אם dongIndications כבר מולא.
 *
 *   node scripts/indications-sheet.cjs            # הכל
 *   node scripts/indications-sheet.cjs 22         # אזור 22 בלבד
 *   node scripts/indications-sheet.cjs --todo     # רק מה שטרם אומת
 */
const fs = require('fs')
const path = require('path')

const D = path.resolve(__dirname, '../src/data/zones')
const arg = process.argv[2]
const todoOnly = process.argv.includes('--todo')
const zoneFilter = arg && !arg.startsWith('--') ? arg : null

const out = []
for (const f of fs.readdirSync(D).sort()) {
  const src = fs.readFileSync(path.join(D, f), 'utf8')
  for (const c of src.split(/\n  \{/).slice(1)) {
    const id = (c.match(/id: '([^']+)'/) || [])[1]
    if (!id) continue
    if (zoneFilter && !id.startsWith(zoneFilter)) continue

    const pinyin = (c.match(/pinyinName: '([^']*)'/) || [])[1] || ''
    const done = /dongIndications:/.test(c)
    if (todoOnly && done) continue

    const block = (c.match(/\n    indications: \[([\s\S]*?)\n    \]/) || [])[1]
    if (!block) continue
    const items = [...block.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) =>
      m[1].replace(/\\'/g, "'")
    )

    out.push(
      `\n${done ? '✅' : '⬜'} ${id}  ${pinyin}  (${items.length} התוויות)\n` +
        items.map((t, i) => `   ${String(i + 1).padStart(2)}. ${t}`).join('\n')
    )
  }
}

console.log(out.join('\n'))
console.log(`\n${'─'.repeat(50)}\nסה"כ: ${out.length} נקודות`)
