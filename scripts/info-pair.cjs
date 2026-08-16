#!/usr/bin/env node
/**
 * מציג את `additionalInfo` של נקודה: המקור האנגלי מול הטקסט העברי שלנו.
 *
 * ⚠️ להציג תמיד את **שני** הצדדים במלואם. חיתוך של הצד העברי (למשל עם
 * `tail`) יוצר רושם שגוי שתוכן חסר - זו תקלה שקרתה בפועל.
 *
 *   node scripts/info-pair.cjs 44.05
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const id = process.argv[2]
if (!id) { console.error('שימוש: node scripts/info-pair.cjs <id>'); process.exit(1) }

let en = null
for (const f of fs.readdirSync(path.join(ROOT, 'sources/app-indications'))) {
  if (f.startsWith('_')) continue
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources/app-indications', f), 'utf8'))
  if (j[id]) { en = j[id].additionalInfo || ''; break }
}

let he = null, file = null
const ZONES = path.join(ROOT, 'src/data/zones')
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8')
  for (const blk of src.split(/(?=\n\s*\{\s*\n\s*id:\s*')/)) {
    const m = blk.match(/id:\s*'([^']+)'/)
    if (!m || m[1] !== id) continue
    const mm = blk.match(/additionalInfo:\s*\n?\s*'((?:[^'\\]|\\.)*)'/)
    he = mm ? mm[1].replace(/\\n/g, '\n').replace(/\\'/g, "'") : ''
    file = f
  }
}

console.log('=== ' + id + '  (' + (file || '?') + ') ===')
console.log('')
console.log('--- המקור האנגלי (' + (en ? en.length : 0) + ' תווים) ---')
console.log(en || '(אין)')
console.log('')
console.log('--- העברית שלנו (' + (he ? he.length : 0) + ' תווים) ---')
console.log(he || '(ריק)')
