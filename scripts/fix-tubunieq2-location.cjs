#!/usr/bin/env node
/**
 * הסרת אזהרת המיקום מ-`TuBuNieQu_2`, אחרי שהמקור אישר אותה.
 *
 * ב-16.8 הנקודה נוספה עם ⚠️ ב-`location`, כי המיקום שהאפליקציה הציגה
 * ("בצד המדיאלי של כף הרגל") נראה סותר את שם הנקודה - אזור טמפורלי בראש.
 * הנחתי שזה נגרר בטעות מ-San Shui שקודמת לה ברשימה.
 *
 * חילוץ `sources/bleeding.md` (עמ' 77) הוכיח שזה **נכון**: אזור הקזה 3
 * מגדיר "האזור הטמפורלי של הראש" בדיוק שם - "בחלק המדיאלי של כף הרגל,
 * מתחת לקרסול המדיאלי". יש אזור טמפורלי מקביל גם בצד הלטרלי (אזור 2).
 *
 * 📌 הלקח: הסתירה הייתה בידע שלי, לא בנתונים. טוב שסימנתי ולא ניחשתי.
 */
const fs = require('fs')

const FILE = 'src/data/zones/zone66extra.ts'
const NEW_LOCATION =
  "    location: 'בחלק המדיאלי של כף הרגל, מתחת לקרסול המדיאלי. זהו אחד משני האזורים הטמפורליים - המקביל לו נמצא בצד הלטרלי של הרגל.',"

const blocks = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n').split(/(?=\n\s*\{\s*\n\s*id:\s*')/)

let done = 0
const out = blocks.map((b) => {
  if (!/id:\s*'TuBuNieQu_2'/.test(b)) return b
  // המיקום נכתב כמחרוזת רב-שורתית עם ההזחה של השדה
  const re = /\n {4}location:\n? *'(?:[^'\\]|\\.)*',/
  if (!re.test(b)) { console.error('✗ לא נמצא שדה location'); return b }
  b = b.replace(re, '\n' + NEW_LOCATION)
  done++
  return b
})

fs.writeFileSync(FILE, out.join(''))
console.log(done ? '✅ TuBuNieQu_2 — האזהרה הוסרה, המיקום אומת מול עמ׳ 77' : '✗ ללא שינוי')
