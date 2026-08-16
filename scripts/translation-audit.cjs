#!/usr/bin/env node
/**
 * ביקורת תרגום: משווה את ההתוויות בעברית מול המקור האנגלי שנלכד
 * מהאפליקציה של שון גודמן, ומסמן פריטים חשודים לבדיקה ידנית.
 *
 * הרקע: החומר העברי הופק בעבר מצילומי מסך של אותה אפליקציה ותורגם
 * בסבב אוטומטי. הסבב ההוא הכניס שגיאות קליניות ממשיות — deafness תורגם
 * לדלקת צפק, skin diseases לסרטן ריאות, pain in the uterus לכאבים
 * בידיים וברגליים. הכלי הזה מאתר עוד כאלה.
 *
 * השיטה: לכל פריט אנגלי מחפשים מונח עברי מקביל לפי מילון מונחים רפואיים.
 * כשלמונח האנגלי יש תרגום מוכר והוא **אינו מופיע** בשום מקום ברשימה
 * העברית של אותה נקודה — זה דגל.
 *
 * הכלי לא משנה נתונים. הפלט הוא רשימה לאישור.
 *
 *   node scripts/translation-audit.cjs            # דוח מלא
 *   node scripts/translation-audit.cjs --zone 88  # אזור אחד
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'sources/app-indications')
const ZONES = path.join(ROOT, 'src/data/zones')

const zoneArg = (() => {
  const i = process.argv.indexOf('--zone')
  return i > -1 ? process.argv[i + 1] : null
})()

// מונחים שהתרגום העברי שלהם חד משמעי. אם המונח האנגלי מופיע בכרטיס
// והעברית המקבילה נעדרת מהרשימה כולה — יש חשד לשגיאת תרגום.
// המפתח נבדק כתת-מחרוזת באנגלית; הערך הוא חלופות עבריות מקובלות.
const GLOSSARY = {
  deafness: ['חירשות', 'חרשות'],
  tinnitus: ['טינטון', 'צלצולים באוזניים'],
  hemiplegia: ['המיפלגיה', 'שיתוק חצי גוף', 'שיתוק חד-צדדי'],
  hemoptysis: ['המופטיזיס', 'שיעול דם'],
  'skin disease': ['מחלות עור', 'מחלת עור'],
  'lung cancer': ['סרטן ריאות'],
  psoriasis: ['פסוריאזיס', 'ספחת'],
  peritonitis: ['דלקת צפק', 'פריטוניטיס'],
  'uterus': ['רחם'],
  uterine: ['רחם'],
  gonorrhea: ['זיבה', 'גונוריאה'],
  prostatitis: ['דלקת ערמונית', 'פרוסטטיטיס'],
  leukorrhea: ['לויקוריאה', 'הפרשות לבנות', 'הפרשה לבנה'],
  hematuria: ['דם בשתן', 'המטוריה'],
  proteinuria: ['חלבון בשתן'],
  lumbago: ['לומבגו', 'גב תחתון'],
  sciatica: ['סיאטיקה'],
  'erectile dysfunction': ['הפרעת זקפה', 'הפרעת זיקפה', 'אין אונות', 'אימפוטנציה', 'אי-ספיקה מינית'],
  impotence: ['הפרעת זקפה', 'הפרעת זיקפה', 'אין אונות', 'אימפוטנציה', 'אי-ספיקה מינית'],
  'premature ejaculation': ['שפיכה מוקדמת'],
  diabetes: ['סוכרת'],
  nephritis: ['דלקת כליות', 'נפריטיס'],
  cholera: ['כולרה'],
  migraine: ['מיגרנה'],
  asthma: ['אסתמה'],
  pneumonia: ['דלקת ריאות'],
  tonsillitis: ['דלקת שקדים', 'טונסיליטיס'],
  pharyngitis: ['דלקת לוע', 'דלקת גרון', 'פרינגיטיס'],
  psychosis: ['פסיכוזה'],
  epilepsy: ['אפילפסיה', 'כפיון'],
  jaundice: ['צהבת'],
  hepatitis: ['הפטיטיס', 'דלקת כבד'],
  cirrhosis: ['שחמת'],
  gastritis: ['גסטריטיס', 'דלקת קיבה'],
  appendicitis: ['אפנדיציטיס', 'דלקת תוספתן'],
  hypertension: ['יתר לחץ דם', 'לחץ דם גבוה'],
  palpitations: ['דפיקות לב'],
  vertigo: ['ורטיגו', 'סחרחורת'],
  insomnia: ['נדודי שינה', 'אינסומניה'],
  infertility: ['אי-פוריות', 'אי פוריות', 'עקרות'],
  'abortion': ['הפלה'],
  rabies: ['כלבת'],
  syphilis: ['עגבת', 'סיפיליס'],
  'food poisoning': ['הרעלת מזון'],
  keratitis: ['קרטיטיס', 'דלקת קרנית'],
  conjunctivitis: ['דלקת לחמית', 'קונג׳נקטיביטיס'],
  glaucoma: ['גלאוקומה'],
  trachoma: ['טרכומה'],
  photophobia: ['רגישות לאור', 'פוטופוביה'],
  bromhidrosis: ['ריח זיעה', 'ברומהידרוזיס'],
  hyperhidrosis: ['הזעת יתר', 'היפרהידרוזיס'],
  edema: ['בצקת'],
  polio: ['פוליו'],
  mastitis: ['דלקת שד', 'מסטיטיס'],
  'breast cancer': ['סרטן שד'],
  'kidney stone': ['אבני כליה', 'אבני כליות', 'אבן כליה', 'נפרוליתיאזיס'],
  'gallstone': ['אבני מרה', 'אבן מרה', 'כולליתיאזיס'],
  cholelithiasis: ['אבני מרה'],
  cholecystitis: ['דלקת כיס מרה', 'כולציסטיטיס'],
  'toothache': ['כאבי שיניים', 'כאב שיניים'],
  gingivitis: ['דלקת חניכיים'],
  rhinitis: ['נזלת'],
  sinusitis: ['סינוסיטיס', 'דלקת סינוסים'],
  anosmia: ['אנוסמיה', 'אובדן חוש ריח'],
  arteriosclerosis: ['טרשת עורקים'],
  atherosclerosis: ['טרשת עורקים'],
  constipation: ['עצירות'],
  diarrhea: ['שלשול'],
  enteritis: ['דלקת מעיים', 'אנטריטיס'],
  hernia: ['בקע'],
  dysmenorrhea: ['כאבי מחזור', 'דיסמנוריאה'],
  amenorrhea: ['היעדר מחזור', 'העדר מחזור', 'אמנוריאה'],
  dystocia: ['לידה קשה', 'דיסטוציה'],
  'retained placenta': ['שליה'],
  neurasthenia: ['נוירסתניה', 'תשישות עצבית'],
  'facial paralysis': ['שיתוק פנים'],
  'trigeminal neuralgia': ['נוירלגיה טריגמינלית', 'נוירלגיית טריגמינל'],
  scoliosis: ['עקמת', 'סקוליוזיס'],
  'frozen shoulder': ['כתף קפואה'],
}

// --- טעינת המקור האנגלי ---
const app = {}
for (const f of fs.readdirSync(SRC)) {
  if (f.startsWith('_')) continue
  const j = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))
  for (const [k, v] of Object.entries(j)) if (!k.startsWith('_')) app[k] = v
}

// --- טעינת הנתונים בעברית ---
const ours = new Map()
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8')
  for (const blk of src.split(/(?=\n\s*\{\s*\n\s*id:\s*')/)) {
    const m = blk.match(/id:\s*'([^']+)'/)
    if (!m) continue
    const zone = (blk.match(/zone:\s*'([^']+)'/) || [])[1] || '?'
    // המערך עשוי להיות רב-שורתי או בשורה אחת — שני המקרים נתמכים,
    // אחרת רשומות מצביעות (indications בשורה אחת) נקראות כריקות ומדווחות
    // בטעות כחסרות תרגום.
    const grab = (field) => {
      const multi = blk.match(new RegExp('\\n\\s{4}' + field + ':\\s*\\[([\\s\\S]*?)\\n\\s{4}\\]'))
      const single = blk.match(new RegExp('\\n\\s{4}' + field + ':\\s*\\[([^\\n]*)\\]'))
      const body = multi ? multi[1] : single ? single[1] : null
      return body ? [...body.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]) : []
    }
    const items = grab('indications')
    const dongItems = grab('dongIndications')
    ours.set(m[1], { zone, items, dongItems, file: f })
  }
}

// --- הביקורת ---
const findings = []
for (const [id, a] of Object.entries(app)) {
  const o = ours.get(id)
  if (!o) continue
  if (zoneArg && o.zone !== zoneArg) continue
  // רשומות מצביעות אינן פער
  if (o.items.some((x) => x.includes('כל ההתוויות של'))) continue

  const hebrewBlob = [...o.items, ...o.dongItems].join(' | ')
  const englishAll = [...(a.dongIndications || []), ...(a.indications || [])]
    .join(' ')
    .toLowerCase()

  const missing = []
  for (const [en, hes] of Object.entries(GLOSSARY)) {
    if (!englishAll.includes(en)) continue
    if (hes.some((h) => hebrewBlob.includes(h))) continue
    const inDong = (a.dongIndications || []).join(' ').toLowerCase().includes(en)
    missing.push({ en, expected: hes[0], inDong })
  }
  if (missing.length) findings.push({ id, zone: o.zone, file: o.file, missing })
}

findings.sort((x, y) => {
  const dx = x.missing.filter((m) => m.inDong).length
  const dy = y.missing.filter((m) => m.inDong).length
  if (dy !== dx) return dy - dx
  return y.missing.length - x.missing.length
})

let dongHits = 0
for (const f of findings) dongHits += f.missing.filter((m) => m.inDong).length

console.log('ביקורת תרגום — התוויות עבריות מול המקור האנגלי')
console.log('='.repeat(72))
console.log('נקודות שנבדקו: ' + [...ours.keys()].filter((k) => app[k]).length)
console.log('נקודות עם חשד: ' + findings.length)
console.log('מונחים חשודים בכרטיס דונג עצמו: ' + dongHits + '  ← העדיפות הגבוהה')
console.log('')

for (const f of findings) {
  const dong = f.missing.filter((m) => m.inDong)
  const later = f.missing.filter((m) => !m.inDong)
  const tag = dong.length ? '🔴' : '  '
  console.log(tag + ' ' + f.id.padEnd(12) + '(' + f.file + ')')
  for (const m of dong) console.log('     דונג · ' + m.en.padEnd(24) + '→ צפוי: ' + m.expected)
  for (const m of later) console.log('           ' + m.en.padEnd(24) + '→ צפוי: ' + m.expected)
}

console.log('')
console.log('הערה: הכלי מסמן מונח שקיים באנגלית ושהמקבילה העברית שלו נעדרת')
console.log('מהרשימה כולה. חלק מהסימונים יהיו תרגום חלופי לגיטימי — זו רשימה')
console.log('לבדיקה, לא רשימת שגיאות מאומתות.')
