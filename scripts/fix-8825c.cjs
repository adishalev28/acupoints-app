#!/usr/bin/env node
/**
 * תיקון באג בסקריפטי התיקון הקודמים + אימות.
 *
 * 🚨 הבאג: `String.replace(from, to)` מחליף את המופע הראשון **בקובץ
 * כולו**, לא בנקודה שהתכוונו אליה. אחת ההחלפות נחתה בתוך `indications`
 * של 88.25 במקום ב-`additionalInfo` ויצרה כפילות
 * ("בעמוד השדרה בעמוד השדרה").
 *
 * 📌 הכלל שנגזר: **סקריפט שמתקן טקסט חייב לצמצם את עצמו לבלוק הנקודה
 * ולשדה הספציפי לפני ההחלפה.** כאן זה נעשה על ידי חיתוך הבלוק,
 * החלפה בתוכו בלבד, והרכבה מחדש.
 */
const fs = require('fs')
const p = 'src/data/zones/zone88.ts'
const src = fs.readFileSync(p, 'utf8')

const blocks = src.split(/(?=\r?\n\s*\{\s*\r?\n\s*id:\s*')/)
let changed = 0

const out = blocks.map((b) => {
  if (!/id:\s*'88\.25'/.test(b)) return b
  let n = b

  // 1. ניקוי הכפילות שנוצרה בפריט ההתוויה
  const dup = 'אוסטאופיטים (דורבנות) בעמוד השדרה בעמוד השדרה'
  if (n.includes(dup)) { n = n.replace(dup, 'אוסטאופיטים (דורבנות) בעמוד השדרה'); changed++ }

  // 2. התיקון שהיה אמור להיכנס ל-additionalInfo מלכתחילה
  if (n.includes('כגון דורבנות בעצם,')) {
    n = n.replace('כגון דורבנות בעצם,', 'כגון אוסטאופיטים (דורבנות) בעמוד השדרה,')
    changed++
  }
  return n
})

fs.writeFileSync(p, out.join(''))
console.log(changed + ' תיקונים הוחלו')

// --- אימות: כל היעדים יושבים ב-additionalInfo של 88.25 ---
const after = fs.readFileSync(p, 'utf8')
const blk = after.split(/(?=\r?\n\s*\{\s*\r?\n\s*id:\s*')/).find((x) => /id:\s*'88\.25'/.test(x))
const info = (blk.match(/additionalInfo:\s*\r?\n?\s*'((?:[^'\\]|\\.)*)'/) || [])[1] || ''

const EXPECTED = [
  'יאנג ויי צ\\\'ייה (Wei Chieh Young)',
  'להרגעה ולהרדמה',
  'מקור מטייוואן',
  'הנקודה מטפלת בכאב',
  'בנדודי שינה, בדפיקות לב ובנוירסתניה',
  'ספונדיליטיס אנקילוזנטי',
  'אוסטאופיטים (דורבנות) בעמוד השדרה',
  'שיתוק פנים, סחרחורת, שבץ והמיפלגיה',
]
console.log('')
console.log('--- אימות מיקום התיקונים ---')
let ok = 0
for (const e of EXPECTED) {
  const inInfo = info.includes(e)
  console.log((inInfo ? '  ✓ ' : '  ✗ ') + e.slice(0, 45))
  if (inInfo) ok++
}
console.log('')
console.log(ok + '/' + EXPECTED.length + ' יושבים ב-additionalInfo של 88.25')
console.log('כפילות "בעמוד השדרה בעמוד השדרה": ' + (after.includes('בעמוד השדרה בעמוד השדרה') ? '🚨 עדיין קיימת' : 'נוקתה'))
