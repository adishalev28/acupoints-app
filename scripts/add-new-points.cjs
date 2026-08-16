#!/usr/bin/env node
/**
 * הוספת 7 הנקודות שקיימות באפליקציה של שון וחסרו אצלנו.
 *
 * ההתוויות, `dongIndications` ו-`additionalInfo` נלכדו ב-15.8 ושמורים
 * ב-`sources/app-indications/_pending-*.json`. מה שחסר היה **מיקום** -
 * הצינור סורק רק את טאב ההתוויות. עדי חיבר את הטלפון ב-16.8 והמיקומים
 * נלכדו עם `scripts/phone-capture/location.ps1` שנבנה לצורך זה.
 *
 * הכלי מוסיף לסוף מערך הנקודות של כל קובץ. אינו נוגע ברשומות קיימות.
 */
const fs = require('fs')

const P = {
  JianFeng: {
    file: 'zone44extra.ts',
    arr: 'zone44ExtraPoints',
    body: `  {
    id: 'JianFeng',
    zone: '44',
    pinyinName: 'Jian Feng',
    chineseName: '肩峰穴',
    hebrewName: 'פסגת הכתף',
    englishName: 'Shoulder Peak',
    location: '2 צון פרוקסימלית ל-44.06 Jian Zhong.',
    needling: 'אנכי, 0.5-1 צון.',
    reactionAreas: ['ענף:ריאה', 'משלים:לב'],
    dongIndications: [
      'סרטן שד (יעיל מאוד)',
      'גידול בשד',
      'דלקת שד (מסטיטיס) - יעיל מאוד',
      'דלקת פטמה (יעיל מאוד)',
      'אדנומה של הפטמה',
    ],
    indications: [
      'סרטן שד (יעיל מאוד), גידול בשד, דלקת שד, דלקת פטמה, אדנומה של הפטמה',
      'יתר לחץ דם',
      'הזעת יתר (היפרהידרוזיס)',
      'פקקת מוחית (CVA), אפזיה, שיתוק רגליים (פראפלגיה), המיפלגיה (שיתוק חד-צדדי) - יעיל מאוד',
      'היפרדות/רפיון של מפרק הערווה (סימפיזיוליזיס)',
      'בקע מפשעתי (שאן צ\\'י)',
      'גרד נרתיקי',
      'חוסר חלב (היפוגלקטיה), נפיחות בשד',
      'נקע קרסול וכאב קרסול - מדיאלי, לטרלי ודורסלי',
      'כאבי מפרק ירך, בורסיטיס טרוכנטרית, דלקת מפרק ירך',
      'גודש בשדיים לפני הווסת',
      'כאבי מפשעה',
    ],
    additionalInfo:
      'נקודה חשובה לטיפול בהפרעות שד.\\n\\nHu Wen Zhi: לשלב עם Shuang Long לטיפול במחלות שד. להגברת ההשפעה - להקיז באזור הריאות והלב בגב.\\n\\nשם הנקודה: ג\\'יאן [肩] - כתף. פנג [峰] - פסגה, הנקודה הגבוהה ביותר. Jian Feng הוא האקרומיון, ושם הנקודה מרמז על מיקומה מתחתיו.',
    sources: [{ source: 'sean-goodman' }],
  },`,
  },

  GB40_QiuXu: {
    file: 'zone66extra.ts',
    arr: 'zone66ExtraPoints',
    body: `  {
    id: 'GB40_QiuXu',
    zone: '66',
    pinyinName: 'Gb-40 Qiu Xu',
    chineseName: '丘墟',
    hebrewName: 'גבעת החורבות',
    englishName: 'Mound of Ruins',
    location: 'במפרק הקרסול, בשקע הקדמי-תחתון לקרסול הלטרלי.',
    needling: 'אנכי, 1-1.5 צון.',
    reactionAreas: [],
    dongIndications: ['דיסארתריה (הפרעת הגייה)', 'אפזיה'],
    indications: [
      'דיסארתריה (הפרעת הגייה), אפזיה',
      'כאב במפרק שורש כף היד',
      'תסמונת התעלה הקרפלית (CTS)',
      'כאב צוואר (באזור GB-20 Feng Chi)',
    ],
    additionalInfo:
      'נקודה סטנדרטית של ערוץ כיס המרה שהאפליקציה של שון כוללת בתוך אזור 66.\\n\\nג\\'יימס מאהר: GB-40 מיועדת לכאב במפרק שורש כף היד שמושרה או מוחמר מסיבוב (תנועה מעגלית של שורש כף היד). דוקרים אותה בצד הנגדי לשורש כף היד הפגוע. בדרך כלל משמשת כחלק מפרוטוקול רחב יותר, לעיתים קרובות בשילוב ST-41 Jie Xi, BL-62 Shen Mai, 77.17 Tian Huang, 77.22 Ce San Li ו-77.23 Li Ce San Li.',
    sources: [{ source: 'sean-goodman' }],
  },`,
  },

  SanShui: {
    file: 'zone66extra.ts',
    arr: 'zone66ExtraPoints',
    body: `  {
    id: 'SanShui',
    zone: '66',
    pinyinName: 'San Shui',
    chineseName: '三水穴',
    hebrewName: 'שלושת המים',
    englishName: 'Three Waters',
    location:
      'שלוש נקודות מתחת לקרסול המדיאלי.\\nShui Fen [水分]: 1 צון מתחת ל-Ki-6 Zhao Hai.\\nShui Men [水門]: 0.5 צון אחורית ל-Shui Fen.\\nShui Xiang [水相]: 0.5 צון קדמית ל-Shui Fen.',
    needling: 'אלכסוני, 0.5-1 צון.',
    reactionAreas: [],
    dongIndications: ['כאב עצבים גולגולתיים', 'נוירלגיה טריגמינלית'],
    indications: [
      'כאב עצבים גולגולתיים, נוירלגיה טריגמינלית',
      'גידולי מוח',
      'מיגרנה',
      'כאב גב תחתון',
      'דלקת רחם (מטריטיס), דלקת שחלות (אופוריטיס), כאבי מחזור (דיסמנוריאה)',
      'נפיחות באשכים',
      'כאב כתף',
      'נקע צוואר, כאב צוואר',
      'שיתוק העצב השישי (עצב המרחיק), פזילה פנימה (אזוטרופיה)',
    ],
    additionalInfo:
      'הנקודות אינן מופיעות בספר המקורי של מאסטר דונג - Hu Wen Zhi הציג אותן ראשון.\\n\\n⚠️ הקבוצה מונה את Shui Fen, Shui Men ו-Shui Xiang. במאגר שלנו קיימות ShuiMen ו-ShuiFen כרשומות נפרדות שתוכנן שונה (רחם, שליה ועקב) ואינו תואם את הכרטיס הזה - ייתכן שמדובר במקור אחר. טרם הוכרע.\\n\\nשם הנקודות: סאן [三] - שלוש. שווי [水] - מים. פן [分] - להפריד, לחלק. מן [門] - שער. שיאנג [相] - ריח נעים. השם מציין את זיקתן ליסוד המים.',
    sources: [{ source: 'sean-goodman' }],
  },`,
  },

  TuBuNieQu_2: {
    file: 'zone66extra.ts',
    arr: 'zone66ExtraPoints',
    body: `  {
    id: 'TuBuNieQu_2',
    zone: '66',
    pinyinName: 'Tou Bu Nie Qu Fangxie Qu Er',
    chineseName: '頭部顳區放血區二',
    hebrewName: 'אזור הקזה טמפורלי שני',
    englishName: 'Temporal Region of the Head Bloodletting Region 2',
    location:
      '⚠️ טרם אומת. האפליקציה מציגה כאן "בצד המדיאלי של כף הרגל, מתחת לקרסול הפנימי" - תיאור שסותר את שם הנקודה ואת אזור התגובה שלה, וכנראה נגרר בטעות מ-San Shui שקודמת לה ברשימה. לא לדקור לפי השורה הזו בלי אימות מול התרשים.',
    needling: 'הקזת דם.',
    reactionAreas: ['ראש-צדדי'],
    dongIndications: ['מיגרנה', 'כאב ראש רקתי', 'כאב ראש מתח'],
    indications: [
      'מיגרנה, כאב ראש רקתי, כאב ראש מתח',
      'תסמונת מפרק הלסת (TMJ)',
      'סחרחורת',
      'יתר לחץ דם',
    ],
    additionalInfo:
      'בטיפול באזורים אלו: תחילה לסרוק את האזור לאיתור ערוץ לואו, אחר כך למשש כדי לאתר שינויים ברקמה, ולהקיז דם באזורים שזוהו.',
    sources: [{ source: 'sean-goodman' }],
  },`,
  },

  ZhengYang: {
    file: 'zone77extra.ts',
    arr: 'zone77ExtraPoints',
    body: `  {
    id: 'ZhengYang',
    zone: '77',
    pinyinName: 'Zheng Yang',
    chineseName: '正陽穴',
    hebrewName: 'יאנג מיושר',
    englishName: 'Rectifying Yang',
    location:
      'שלוש נקודות.\\nZheng Yang Yi: 1 צון מתחת ל-BL-40 Wei Zhong.\\nZheng Yang Er: 1 צון לטרלית ל-Zheng Yang Yi.\\nZheng Yang San: 1 צון מדיאלית ל-Zheng Yang Yi.',
    needling: '⚠️ טרם נלכד מהאפליקציה.',
    reactionAreas: [],
    dongIndications: ['הגדלת הלב (קרדיומגליה)'],
    indications: [
      'הגדלת הלב (קרדיומגליה)',
      'לחץ וכאב בחזה',
      'כאב באזור BL-43 Gao Huang',
      'צוואר תפוס',
      'טחורים, דימום מטחורים, פיסורה אנאלית',
      'חומצת קיבה עודפת',
      'כאב ראש',
      'מיגרנה',
      'חוסר תחושה בידיים וברגליים, פרסתזיה בידיים וברגליים',
      'דפיקות לב',
      'כאב כתף',
    ],
    additionalInfo:
      'הנקודות אינן מופיעות בספר המקורי של מאסטר דונג - Hu Wen Zhi הציג אותן.\\n\\nשם הנקודה: ג\\'נג [正] - ישר, נכון, מדויק, לתקן, ראשי. יאנג [陽] - חיובי, שמש, העיקרון הזכרי, ההפך מיין.',
    sources: [{ source: 'sean-goodman' }],
  },`,
  },

  ZhongXi_NeiXiYan: {
    file: 'zone77extra.ts',
    arr: 'zone77ExtraPoints',
    body: `  {
    id: 'ZhongXi_NeiXiYan',
    zone: '77',
    pinyinName: 'Zhong Xi / Nei Xi Yan',
    chineseName: '中膝 / 內膝眼',
    hebrewName: 'מרכז הברך / עין הברך הפנימית',
    englishName: 'Centre Knee / Inner Knee Eye',
    location:
      'Nei Xi Yan: בשקע המדיאלי לגיד הפיקה, מיד דיסטלית לפיקה. לאתר עם הברך כפופה. זהה במיקומה ל-MN-LE-16 Knee Eye.\\nZhong Xi: במרכז גיד הפיקה, באותו גובה כמו Nei Xi Yan ו-ST-35 Du Bi.',
    needling: 'Nei Xi Yan: אלכסוני ממדיאלי ללטרלי, 1-2 צון.\\nZhong Xi: אנכי, 0.3-0.8 צון.',
    reactionAreas: [],
    dongIndications: ['כאב מרפק', 'מרפק טניס (אפיקונדיליטיס לטרלית)'],
    indications: [
      'כאב מרפק, מרפק טניס (אפיקונדיליטיס לטרלית)',
      'כאבי ברכיים, אוסטיאוארתריטיס של הברך',
    ],
    additionalInfo:
      'בשלב החריף: תחילה להקיז דם במרפק הפגוע, ורק אחר כך לדקור את Zhong Xi, Nei Xi Yan ו-ST-35 Du Bi.\\n\\nשם הנקודה: ג\\'ונג [中] - מרכז, אמצע. שי [膝] - ברך. נאי [內] - החלק הפנימי של הגוף. יאן [眼] - עיניים. השם מציין שהנקודה ממוקמת על הברך.',
    sources: [{ source: 'sean-goodman' }],
  },`,
  },

  ZhongLiu: {
    file: 'zone99.ts',
    arr: 'zone99Points',
    body: `  {
    id: 'ZhongLiu',
    zone: '99',
    pinyinName: 'Zhong Liu',
    chineseName: '腫瘤穴',
    hebrewName: 'נקודות הגידול',
    englishName: 'Tumor Points',
    location: 'שש נקודות לאורך השוליים החיצוניים של תנוך האוזן.',
    needling: 'אנכי, 0.1-0.2 צון.',
    reactionAreas: ['עצב:ריאה'],
    dongIndications: [
      'קרצינומות (סרטן)',
      'פוליפים',
      'גידולים לימפתיים',
      'סקרופולה',
      'שחפת צווארית',
      'דלקת בלוטות לימפה',
    ],
    indications: [
      'קרצינומות (סרטן), פוליפים, גידולים לימפתיים, סקרופולה, שחפת צווארית, דלקת בלוטות לימפה',
      'אדנומה מפרישה (גידול בבלוטת יותרת המוח)',
    ],
    additionalInfo:
      'הנקודות אינן מופיעות בספר המקורי של מאסטר דונג - Hu Wen Zhi הציג אותן. הקבוצה מיועדת במפורש לטיפול בגידולים ממאירים.\\n\\nבשיטת מאסטר דונג, נקודות המטפלות בגושים או גידולים קשות קשורות לרוב למערכת הריאות, שכן הריאות שולטות בצ\\'י ואחראיות להנעת סטגנציה ולפירוק הצטברויות בגוף.\\n\\nשם הנקודה: ג\\'ונג [腫] - נפיחות, גוש. ליו [瘤] - גידול.',
    sources: [{ source: 'sean-goodman' }],
  },`,
  },
}

const byFile = {}
for (const [id, r] of Object.entries(P)) (byFile[r.file] ||= []).push({ id, ...r })

let added = 0
for (const [file, recs] of Object.entries(byFile)) {
  const p = 'src/data/zones/' + file
  let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
  const fresh = recs.filter((r) => {
    if (s.includes(`id: '${r.id}'`)) { console.error(`⊘ ${r.id} כבר קיימת`); return false }
    return true
  })
  if (!fresh.length) continue

  // הוספה לפני הסוגר הסוגר של המערך
  const i = s.lastIndexOf('\n]')
  if (i < 0) { console.error('✗ ' + file + ': לא נמצא סוף המערך'); continue }
  s = s.slice(0, i) + '\n' + fresh.map((r) => r.body).join('\n') + s.slice(i)
  fs.writeFileSync(p, s)
  for (const r of fresh) { console.log(`✓ ${r.id.padEnd(18)}→ ${file}`); added++ }
}

console.log('')
console.log(added + ' נקודות נוספו')
