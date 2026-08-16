#!/usr/bin/env node
/**
 * מילוי `additionalInfo` של 44.02 מהלכידה החדשה (16.8.2026).
 *
 * 44.02 הייתה הנקודה היחידה במאגר עם `additionalInfo` ריק ובלי מקור -
 * הסריקה של 15.8 התחילה ב-44.03 ודילגה על 44.01 ו-44.02. עדי פתח את
 * אזור 44 בטלפון והן נלכדו. ההתוויות של שתיהן היו כבר שלמות.
 *
 * ⚠️ ההחלפה מצומצמת לבלוק הנקודה - `String.replace` על הקובץ כולו תופס
 * את המופע הראשון ועלול לנחות בנקודה אחרת.
 */
const fs = require('fs')

const FILE = 'src/data/zones/zone44.ts'
const src = fs.readFileSync(FILE, 'utf8')
const blocks = src.split(/(?=\r?\n\s*\{\s*\r?\n\s*id:\s*')/)

// מרכאות כפולות במכוון: התוכן מכיל אפוסטרוף מוברח (`ג\'ווי`) עבור
// המחרוזת ב-TypeScript, ובמחרוזת JS חד-מרכאתית הוא סוגר את המחרוזת.
const INFO_4402 =
  "למידע נוסף ראה 44.03 Shou Ying.\\n\\n" +
  "שם הנקודה: הואו [後] — אחורי, מאחור. ג\\'ווי [椎] — חוליה. " +
  "שם הנקודה מרמז על יכולתה לטפל בהפרעות של חוליות עמוד השדרה."

let done = 0
const out = blocks.map((b) => {
  const id = (b.match(/id:\s*'([^']+)'/) || [])[1]
  if (id === '44.02') {
    if (!/additionalInfo:\s*''/.test(b)) { console.error('✗ 44.02: additionalInfo אינו ריק, לא נגעתי'); return b }
    b = b.replace(/additionalInfo:\s*''/, "additionalInfo:\n      '" + INFO_4402 + "'")
    console.log('✓ 44.02 — additionalInfo מולא')
    done++
  }
  if (id === '44.01') {
    // המשפט המסכם מהמקור שלא תורגם
    const from = 'פאזת המתכת קשורה לריאות.'
    if (b.includes(from) && !b.includes('שמות הנקודות מרמזים')) {
      b = b.replace(from, from + ' שמות הנקודות מרמזים על השפעתן עליהן.')
      console.log('✓ 44.01 — המשפט המסכם הושלם')
      done++
    }
  }
  return b
})

fs.writeFileSync(FILE, out.join(''))
console.log('')
console.log(done + ' שינויים')
