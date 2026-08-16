#!/usr/bin/env node
/**
 * מאחה מחרוזות TypeScript שנשברו על ידי שורות חדשות **אמיתיות** בתוכן.
 *
 * מקור התקלה: עריכות קבוצתיות שהזריקו טקסט רב-פסקאתי לתוך מחרוזת
 * חד-שורתית בלי להמיר את מעברי השורה ל-`\n`. התוצאה היא
 * `TS1002: Unterminated string literal` — והאפליקציה לא נבנית.
 *
 * 🚨 למה זה לא נתפס: `npx tsc --noEmit` בריפו הזה **לא בודק כלום** —
 * `tsconfig.json` הוא קובץ הפניות עם `"files": []`. הבדיקה האמיתית היא
 * `npm run build` (שמריץ `tsc -b`). להשתמש רק בה.
 *
 *   node scripts/fix-broken-strings.cjs [--dry]
 */
const fs = require('fs')
const path = require('path')

const ZONES = path.resolve(__dirname, '../src/data/zones')
const dry = process.argv.includes('--dry')

// מונה מרכאות בודדות לא מוברחות בשורה
const openQuotes = (line) => {
  let n = 0
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\') { i++; continue }
    if (line[i] === "'") n++
  }
  return n
}

let totalFixed = 0
for (const f of fs.readdirSync(ZONES).filter((x) => x.endsWith('.ts'))) {
  const p = path.join(ZONES, f)
  const lines = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').split('\n')
  const out = []
  let fixed = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    // שורה עם מספר אי-זוגי של מרכאות פותחת מחרוזת שלא נסגרה בה
    if (openQuotes(line) % 2 === 1) {
      const start = i
      let joined = line
      while (i + 1 < lines.length && openQuotes(joined) % 2 === 1) {
        i++
        // מעבר שורה אמיתי → \n בתוך המחרוזת
        joined += '\\n' + lines[i]
      }
      if (openQuotes(joined) % 2 === 1) {
        console.error(`✗ ${f}:${start + 1} — לא נמצאה סגירה, לא נגעתי`)
        out.push(line)
        continue
      }
      console.log(`✓ ${f}:${start + 1} — אוחו ${i - start + 1} שורות`)
      out.push(joined)
      fixed++
      continue
    }
    out.push(line)
  }

  if (fixed && !dry) fs.writeFileSync(p, out.join('\n'))
  totalFixed += fixed
}

console.log('')
console.log((dry ? '[יבש] ' : '') + totalFixed + ' מחרוזות אוחו')
