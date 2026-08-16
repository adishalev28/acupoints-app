#!/usr/bin/env node
/**
 * מילוי 9 הרשומות המצביעות באזור 33.
 *
 * הרקע: חמש קבוצות נקודות באזור 33 נדקרות **תמיד יחד**, והאפליקציה של
 * שון מציגה כל קבוצה ככרטיס אחד. אצלנו הן רשומות בנפרד, ורק אחת מכל
 * קבוצה מחזיקה את התוכן. לשאר יש `indications: ['כל ההתוויות של X']`.
 *
 * למה זה בעיה קלינית: `SmartDiagnosis.tsx` מתאים מילות מפתח מול
 * `p.indications`, ולכן הרשומות האלה **לא עולות לעולם בחיפוש לפי
 * תסמין** - למרות שהן נדקרות עם המחזיקה תמיד.
 *
 * ההחלטה (עדי, 16.8.2026): למלא בהן את התוויות המחזיקה ואת
 * `dongIndications` שלה, ולשמר ב-`additionalInfo` את ההפניה כדי שיהיה
 * ברור שמדובר בקבוצה ולא בנקודה עצמאית.
 *
 * ⚠️ ההחלפה מצומצמת לבלוק הנקודה בלבד - `String.replace` על הקובץ כולו
 * תופס את המופע הראשון ועלול לנחות בנקודה אחרת (קרה בפועל ב-88.25).
 */
const fs = require('fs')

const FILE = 'src/data/zones/zone33extra.ts'
const src = fs.readFileSync(FILE, 'utf8')
const SPLIT = /(?=\r?\n\s*\{\s*\r?\n\s*id:\s*')/

// שם התצוגה שבהפניה → מזהה הרשומה המחזיקה
const HOLDER_BY_NAME = {
  'Gan Ling San': 'GanLingSan',
  'Jian Li': 'JianLi',
  'Tu Wei San': 'TuWeiSan',
  'Xin Ling Yi': 'XinLingYi',
  'Yao Ling Er': 'YaoLingEr',
}

const blocks = src.split(SPLIT)
const idOf = (b) => (b.match(/id:\s*'([^']+)'/) || [])[1]

// שולף את הטקסט המלא של מערך שדה, כפי שהוא בקובץ
const grabField = (blk, field) => {
  const re = new RegExp('(^|\\r?\\n)([ \\t]{4})' + field + ':\\s*\\[[\\s\\S]*?\\r?\\n[ \\t]{4}\\],')
  const m = blk.match(re)
  return m ? m[0].replace(/^\r?\n/, '') : null
}

const holders = {}
for (const b of blocks) {
  const id = idOf(b)
  if (!id) continue
  if (Object.values(HOLDER_BY_NAME).includes(id)) {
    holders[id] = {
      indications: grabField(b, 'indications'),
      dong: grabField(b, 'dongIndications'),
    }
  }
}

let filled = 0
const out = blocks.map((b) => {
  const id = idOf(b)
  if (!id) return b
  const pm = b.match(/indications:\s*\['כל ההתוויות של ([^']+)'\],/)
  if (!pm) return b

  const holderId = HOLDER_BY_NAME[pm[1]]
  if (!holderId || !holders[holderId]) {
    console.error(`✗ ${id}: לא נמצאה מחזיקה עבור "${pm[1]}"`)
    return b
  }
  const h = holders[holderId]
  if (!h.indications) { console.error(`✗ ${holderId}: אין indications`); return b }

  // ההערה + dongIndications + indications, בסדר ובהזחה של המחזיקה
  const note = '    // מולא מ-' + holderId + ' - הנקודות נדקרות תמיד יחד ומוצגות\n' +
               '    // באפליקציה של שון ככרטיס אחד. בלי זה הנקודה לא עולה בחיפוש\n' +
               '    // לפי תסמין (SmartDiagnosis מתאים מול indications).\n'
  const replacement = note + (h.dong ? h.dong + '\n' : '') + h.indications

  const before = b
  b = b.replace(pm[0], replacement.replace(/^ {4}/, ''))
  if (b === before) { console.error(`✗ ${id}: ההחלפה לא נתפסה`); return before }

  console.log(`✓ ${id.padEnd(13)}← ${holderId}`)
  filled++
  return b
})

fs.writeFileSync(FILE, out.join(''))
console.log('')
console.log(filled + ' רשומות מולאו')
