#!/usr/bin/env node
/**
 * טריאז' להעשרת additionalInfo: איזה תוכן מהמקור האנגלי באמת נעדר מהעברית.
 *
 * למה לא ספירת תווים: עברית דחוסה מאנגלית, והמקור מכיל כפילויות OCR
 * (משפטים שלמים שחוזרים פעמיים). לכן פער בתווים אינו מעיד על תוכן חסר -
 * ארבע נקודות באזור 11 שהופיעו עם פער של מאות תווים היו מכוסות במלואן.
 *
 * במקום זה בודקים **עוגנים**: שמות מטפלים וכותרות מקטעים שמופיעים במקור.
 * אם המקור מייחס פסקה ל-Hu Wen Zhi והעברית לא מזכירה אותו כלל - זה תוכן
 * שנעדר, ללא קשר לאורך.
 *
 *   node scripts/enrichment-triage.cjs 11 zone11.ts zone11extra.ts
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const zone = process.argv[2]
const files = process.argv.slice(3)
if (!zone || !files.length) {
  console.error('שימוש: node scripts/enrichment-triage.cjs <אזור> <קבצים...>')
  process.exit(1)
}

// עוגנים: שם באנגלית → הצורות שבהן הוא עשוי להופיע בעברית
const ANCHORS = [
  ['Hu Wen Zhi', ['Hu Wen Zhi', 'הו וון ג', 'Hu wen Zhi', 'He Wen Zhi']],
  ['Hu Wen Zi', ['Hu Wen Zi', 'הו וון ג']],
  ['Lai Jing-Xiong', ['Lai Jing', 'Lai Jin', 'לאי ג']],
  ['Lai Jin Xiong', ['Lai Jin', 'Lai Jing', 'לאי ג']],
  ['Chuan Min Wang', ['Chuan Min', 'צ״ואן מין', 'צ\'ואן מין']],
  ['Chen Du Ren', ['Chen Du', 'Chen Do', 'צ\'ן דו']],
  ['Chen Do Ren', ['Chen Do', 'Chen Du', 'צ\'ן דו']],
  ['Wei Chieh Young', ['Wei Chieh', 'ויי צ']],
  ['Yang Wei Chieh', ['Yang Wei', 'Wei Chieh', 'יאנג ויי']],
  ['Lee Kuo Cheng', ['Lee Kuo', 'לי גואו', 'לי קואו']],
  ['Miriam Lee', ['Miriam', 'מרים לי']],
  ['Liao Li', ['Liao Li', 'ליאו לי']],
  ['Yuan Guo Ben', ['Yuan Guo', 'יואן גואו']],
  ['James H. Maher', ['Maher', 'מאהר']],
  ['Bloodletting', ['הקז']],
  // גזע ולא מילה מלאה: העברית נוטה את המונח ("הדמיית גפיים"), ובדיקה
  // על "הדמיה" בלבד סימנה נקודות מלאות בשווא.
  ['Imaging', ['הדמי', 'דימוי']],
  ['Palm Diagnosis', ['אבחון כף יד', 'אבחון כף היד']],
  ['Point Name', ['שם הנקודה', 'שם הנקודות']],
  ['Case', ['מקרה', 'מקרים']],
]

const app = JSON.parse(fs.readFileSync(path.join(ROOT, `sources/app-indications/zone${zone}.json`), 'utf8'))

const rows = []
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/zones', f), 'utf8')
  for (const blk of src.split(/(?=\n\s*\{\s*\n\s*id:\s*')/)) {
    const m = blk.match(/id:\s*'([^']+)'/)
    if (!m || !app[m[1]]) continue
    const en = app[m[1]].additionalInfo || ''
    const mm = blk.match(/additionalInfo:\s*\n?\s*'((?:[^'\\]|\\.)*)'/)
    // ⚠️ חובה לבטל את ההברחה לפני ההשוואה. בקובץ תעתיק כמו צ'ואן מין
    // נשמר כ-`צ\'ואן מין`, והעוגן שמחפשים הוא `צ'ואן מין` - בלי הביטול
    // הכלי מדווח שהמטפל חסר בזמן שהוא נמצא. זה סימן בשווא 6 נקודות.
    const he = mm ? mm[1].replace(/\\'/g, "'").replace(/\\n/g, '\n') : ''
    // מקטע אטימולוגיה מזוהה גם בלי הכותרת "שם הנקודה": נוכחות תו סיני
    // ב-additionalInfo מעידה עליו, כי זה המקום היחיד שבו תווים סיניים
    // מופיעים בטקסט. בלי זה עשרות נקודות מסומנות בשווא.
    const hasCjk = /[一-鿿]/.test(he)

    const missing = []
    for (const [needle, forms] of ANCHORS) {
      if (!en.includes(needle)) continue
      if (needle === 'Point Name' && hasCjk) continue
      if (forms.some((x) => he.includes(x))) continue
      if (!missing.includes(needle)) missing.push(needle)
    }
    if (missing.length) rows.push({ id: m[1], file: f, missing })
  }
}

rows.sort((a, b) => b.missing.length - a.missing.length)
console.log(`אזור ${zone} — ${rows.length} נקודות עם עוגנים חסרים`)
console.log('(עוגן חסר = המקור מייחס תוכן למקור/מקטע שהעברית לא מזכירה כלל)')
console.log('')
for (const r of rows) {
  console.log('  ' + r.id.padEnd(14) + r.file.padEnd(16) + r.missing.join(' · '))
}
if (!rows.length) console.log('  ✅ אין עוגנים חסרים')
