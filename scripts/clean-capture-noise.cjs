#!/usr/bin/env node
/**
 * ניקוי רעש לכידה מקבצי המקור ב-sources/app-indications/.
 *
 * הרקע: מלכודת 15 ב-scripts/phone-capture/README.md - צילום שתופס את
 * החלון שבחזית במקום את הטלפון. בפועל זה קרה בשתי רמות:
 *
 * 1. רסיס "Claude O" - שריד משורת הכותרת שנדלף בגבול המסך. 18 רשומות.
 * 2. בלוק שלם של טקסט מחלון Claude שנכנס ל-ZhuYuan (כ-800 תווים).
 *
 * הטקסט הזה מוכח שאינו מהאפליקציה של שון, ולכן הסרתו היא תיקון פגם
 * לכידה ולא עריכת תוכן. בלי הניקוי, מעברי העשרה עתידיים מתייחסים אליו
 * כאל תוכן חסר ומנפחים את מדדי הפער.
 *
 *   node scripts/clean-capture-noise.cjs           # דוח בלבד
 *   node scripts/clean-capture-noise.cjs --write
 */
const fs = require('fs')
const path = require('path')

const SRC = path.resolve(__dirname, '../sources/app-indications')
const WRITE = process.argv.includes('--write')

// הסימן שממנו והלאה הטקסט אינו מהאפליקציה
const BLOCK_MARKER = '⚠️ GAP Monthly accountant report'
const FRAGMENT = /\s*Claude O\s*/g
// כשהרסיס נפל באמצע משפט הוא דרס תווים אמיתיים. מחיקה שקטה הייתה
// מייצרת משפט שגוי, ולכן מסמנים את הפער במקום.
const EMBEDDED = /\s*Claude\s*[O0]?\s*/g

let files = 0
let fragments = 0
let blocks = 0

for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.json')) continue
  const p = path.join(SRC, f)
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  let touched = false

  for (const [id, v] of Object.entries(j)) {
    if (id.startsWith('_') || typeof v !== 'object' || v === null) continue

    // 1. חיתוך בלוק זר
    if (typeof v.additionalInfo === 'string') {
      const at = v.additionalInfo.indexOf(BLOCK_MARKER)
      if (at > -1) {
        console.log(`  ✂️  ${f} · ${id} — נחתך בלוק זר של ${v.additionalInfo.length - at} תווים`)
        v.additionalInfo = v.additionalInfo.slice(0, at).trim()
        blocks++
        touched = true
      }
      let cleaned = v.additionalInfo.replace(FRAGMENT, ' ')
      if (EMBEDDED.test(cleaned)) {
        cleaned = cleaned.replace(EMBEDDED, ' [...] ')
        console.log(`  🩹 ${f} · ${id} — רסיס באמצע משפט, סומן כפער`)
      }
      cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()
      if (cleaned !== v.additionalInfo) {
        v.additionalInfo = cleaned
        fragments++
        touched = true
      }
    }

    // 2. רסיסים במערכי ההתוויות
    for (const key of ['dongIndications', 'indications']) {
      if (!Array.isArray(v[key])) continue
      // השוואה על התוכן ולא על האורך: רסיס באמצע פריט משנה את הטקסט
      // בלי לשנות את מספר הפריטים, ובדיקת אורך בלבד הייתה מפספסת אותו
      const before = JSON.stringify(v[key])
      const beforeLen = v[key].length
      v[key] = v[key]
        .map((x) => {
          if (typeof x !== 'string') return x
          let s = x.replace(FRAGMENT, ' ')
          // includes ולא EMBEDDED.test - regex עם דגל g שומר lastIndex בין
      // קריאות ומדלג על התאמות בקריאה הבאה
      if (s.includes('Claude')) s = s.replace(EMBEDDED, ' [...] ')
          return s.replace(/\s{2,}/g, ' ').trim()
        })
        .filter((x) => x && x !== 'Claude' && x !== '[...]' && x.length > 1)
      if (JSON.stringify(v[key]) !== before) {
        const dropped = beforeLen - v[key].length
        console.log(`  🧹 ${f} · ${id} · ${key} — ${dropped > 0 ? 'הוסרו ' + dropped + ' פריטי רעש' : 'נוקה רסיס בתוך פריט'}`)
        fragments++
        touched = true
      }
    }
  }

  if (touched) {
    files++
    if (WRITE) fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n')
  }
}

console.log('')
console.log(`קבצים שנגעו בהם: ${files} · בלוקים שנחתכו: ${blocks} · ניקויי רסיסים: ${fragments}`)
if (!WRITE) console.log('\n(dry run — הרץ עם --write)')
