// פותר מיקומים לנקודות האצבעות של מאסטר דונג (אזור 11) על שני הגופים.
//
// שימוש:  node scripts/body-model/finger-solver.mjs [--debug]
// פלט:    src/data/bodyModel/fingerPoints.ts
//
// איך זה עובד
// 1. מסגרת כף היד: שורש כף היד = החתך הצר ביותר של הזרוע מעל כף היד; כיוון האצבעות =
//    משורש כף היד אל מרכז בסיסי האצבעות; כיוון רדיאלי = מבסיס הזרת אל בסיס האצבע המורה;
//    הנורמל של כף היד = fingerDir × radialDir (פונה החוצה מכף היד, אל הירך).
// 2. כל אצבע: חתכים ניצבים לכיוון האצבעות כל מילימטר (קרניים לאורך נורמל כף היד, זוגיות
//    חיתוכים), רכיבים קשירים בכל חתך, ומעקב מהקצה כלפי מעלה עד שהאצבע מתאחדת עם שכנתה
//    (קפל הבסיס / קרום בין האצבעות). מהמרכזים נבנה קו אמצע עם אורך קשת.
//    האגודל: אותו דבר, בחתכים ניצבים לציר האגודל.
// 3. מפרקים (לא ניתן לזהות קפלים במודל, אין בו לולאות קודקודים במפרקים):
//    אורך האצבע מהמפרק MCP עד הקצה L מחולק 0.46 : 0.30 : 0.24 (פרוקסימלי : אמצעי : דיסטלי),
//    וקפל הבסיס בכף היד נמצא 0.20L אחרי ה-MCP. לכן על החלק הגלוי Lv = 0.8L:
//    PIP ב-0.325Lv מהבסיס, DIP ב-0.70Lv. מקטע 1 בצד הפלמרי נמדד מקפל הבסיס, ובצד הגבי מה-MCP.
//    האגודל: הבסיס (MCP) הוא המקום שבו האגודל מתאחד עם כף היד; IP ב-0.55 מהאורך עד הקצה.
//    צון האצבע = אורך המקטע האמצעי של האצבע האמצעית (צון האצבע האמצעית).
// 4. כל תת-נקודה: נקודה על קו האמצע במקטע, הזזה לרוחב לפי הקו (A..E / רדיאלי / אמצע / אולנרי),
//    ואז קרן מבפנים החוצה לאורך הכיוון הפלמרי או הגבי; נקודת הפגיעה + 4 מ"מ לאורך הנורמל.

import fs from 'node:fs'
import { loadBody, measure, V, SURFACE_OFFSET } from './who-solver.mjs'

const DEBUG = process.argv.includes('--debug')

// ─────────────────────────────── פרופורציות ───────────────────────────────

/** אורך העצמות מה-MCP עד הקצה, באצבעות 2-5 */
const PHALANX = { proximal: 0.46, middle: 0.30, distal: 0.24 }
/** קפל הבסיס (קרום בין האצבעות) נמצא 0.20 מאורך האצבע אחרי ה-MCP */
const WEB_FROM_MCP = 0.20
const VISIBLE = 1 - WEB_FROM_MCP
/** על החלק הגלוי (מקפל הבסיס עד הקצה) */
const JOINTS = {
  mcp: -WEB_FROM_MCP / VISIBLE,                                   // -0.25
  pip: (PHALANX.proximal - WEB_FROM_MCP) / VISIBLE,               // 0.325
  dip: (PHALANX.proximal + PHALANX.middle - WEB_FROM_MCP) / VISIBLE, // 0.70
}
/** האגודל: פרוקסימלי : דיסטלי מה-MCP עד הקצה */
const THUMB_IP = 0.55

/** קווי האורך בצד הפלמרי, כשבר מחצי הרוחב (+ רדיאלי) */
const PALMAR_LINE = { A: 0.8, B: 0.4, C: 0, D: -0.4, E: -0.8 }
/** קווי האורך בצד הגבי */
const DORSAL_LINE = { radial: 0.55, mid: 0, ulnar: -0.55 }
/** מקום בסיס הציפורן על המקטע הדיסטלי */
const NAIL_BASE = 0.35

// ─────────────────────────────── טבלת הנקודות ───────────────────────────────
// כל תת-נקודה: { seg, along, line } או { seg, along, lat } -
//   seg    מקטע: 1 פרוקסימלי, 2 אמצעי, 3 דיסטלי (באגודל: 1 פרוקסימלי, 2 דיסטלי)
//   along  מיקום לאורך המקטע, 0 = הקצה הפרוקסימלי, 1 = הדיסטלי (1 = הקפל/המפרק שאחרי המקטע)
//   dcun   היסט לאורך האצבע בצון (+ דיסטלי)
//   line   'A'..'E' בצד הפלמרי, 'radial' | 'mid' | 'ulnar' בצד הגבי
//   lat    היסט לרוחב: { cun } בצון או { f } בשבר מחצי הרוחב (+ רדיאלי); 'radialSide' = הדופן הרדיאלית עצמה
//   finger / side  דורסים את ערכי היחידה (לנקודות שעוברות על כמה אצבעות)
// "למעלה/למטה" בטקסטים הם לפי היד המורמת של דונג: עליון = דיסטלי, תחתון = פרוקסימלי.

const at = (seg, along, line, extra = {}) => ({ seg, along, ...(typeof line === 'string' ? { line } : { lat: line }), ...extra })
/** n-1 נקודות על סימני החלוקה של מקטע ל-n חלקים שווים, מהפרוקסימלי לדיסטלי */
const div = (seg, n, line, extra = {}) => Array.from({ length: n - 1 }, (_, k) => at(seg, (k + 1) / n, line, extra))

export const SPECS = {
  // 1/3 צון רדיאלית ממרכז המקטע הפרוקסימלי של האצבע המורה, צד פלמרי (כף היד).
  '11.01': { finger: 2, side: 'palmar', pts: [at(1, 0.5, { cun: 1 / 3 })] },
  // חלק עליון של המקטע הפרוקסימלי של האצבע המורה, צד פלמרי, 0.2 צון דיסטלית מ-DaJian (11.01).
  '11.02': { finger: 2, side: 'palmar', pts: [at(1, 0.5, { cun: 1 / 3 }, { dcun: 0.2 })] },
  // בצד הפלמרי של האצבע השנייה, במקטע השני לאורך קו B. מחלקים לשלושה - הנקודה בחלק הפרוקסימלי.
  '11.03': { finger: 2, side: 'palmar', pts: [at(2, 1 / 3, 'B')] },
  // בצד הפלמרי של האצבע השנייה, במקטע השני על קו B. מחלקים לשלושה - הנקודה בחלק הדיסטלי.
  '11.04': { finger: 2, side: 'palmar', pts: [at(2, 2 / 3, 'B')] },
  // בצד הפלמרי של האצבע השנייה, באמצע המקטע הראשון, על קו C.
  '11.05': { finger: 2, side: 'palmar', pts: [at(1, 0.5, 'C')] },
  // על האצבע הרביעית, במרכז המקטע האמצעי על קו E. (לפי Hu Wen Zhi - קו A; נבחר הטקסט הראשי)
  '11.06': { finger: 4, side: 'palmar', pts: [at(2, 0.5, 'E')] },
  // שלוש נקודות על הקו האולנרי של המקטע האמצעי של האצבע השנייה. מחלקים לארבעה.
  // (הקו "האולנרי" הוא מינוח של הצד הגבי בטקסטים האלה)
  '11.07': { finger: 2, side: 'dorsal', pts: div(2, 4, 'ulnar') },
  // שלוש נקודות בצד הגבי של האצבע השנייה, על הקו האולנרי של המקטע התחתון. מחלקים לארבעה.
  // (תחתון = פרוקסימלי ביד המורמת)
  '11.08': { finger: 2, side: 'dorsal', pts: div(1, 4, 'ulnar') },
  // שתי נקודות על גב האצבע האמצעית, באמצע המקטע השני, על הקווים האולנרי והרדיאלי.
  '11.09': { finger: 3, side: 'dorsal', pts: [at(2, 0.5, 'radial'), at(2, 0.5, 'ulnar')] },
  // על גב האצבע האמצעית, באמצע, במפרק שבין המקטע השני לשלישי.
  '11.10': { finger: 3, side: 'dorsal', pts: [at(2, 1, 'mid')] },
  // שלוש נקודות על גב האצבע האמצעית, המקטע האמצעי, קו האמצע. מחלקים לארבעה.
  '11.11': { finger: 3, side: 'dorsal', pts: div(2, 4, 'mid') },
  // שתי נקודות על קו האמצע של המקטע הפרוקסימלי של האצבע האמצעית, גבי.
  // 1/3 ו-2/3 צון מהקפל השני (קפל ה-PIP, בקצה המקטע), כלומר פרוקסימלית לו.
  '11.12': { finger: 3, side: 'dorsal', pts: [at(1, 1, 'mid', { dcun: -2 / 3 }), at(1, 1, 'mid', { dcun: -1 / 3 })] },
  // שתי נקודות על גב האצבע האמצעית, באמצע המקטע הראשון, על הקווים האולנרי והרדיאלי.
  '11.13': { finger: 3, side: 'dorsal', pts: [at(1, 0.5, 'radial'), at(1, 0.5, 'ulnar')] },
  // שלוש נקודות בצד האולנרי/גבי של המקטע האמצעי של אצבע הטבעת, 0.2 צון מקו האמצע.
  // (הריווח לא נאמר - חלוקה לארבעה כמו ביחידות האחרות)
  '11.14': { finger: 4, side: 'dorsal', pts: div(2, 4, { cun: -0.2 }) },
  // שלוש נקודות על גב אצבע הטבעת, במקטע הראשון לאורך הקו האולנרי. מחלקים לארבעה.
  '11.15': { finger: 4, side: 'dorsal', pts: div(1, 4, 'ulnar') },
  // על הצד הגבי של הזרת, על הקו הרדיאלי במפרק שבין המקטע השני לשלישי.
  '11.16': { finger: 5, side: 'dorsal', pts: [at(2, 1, 'radial')] },
  // שתי נקודות בצד הפלמרי של האצבע השנייה, במקטע הראשון על קו D. מחלקים לשלושה.
  '11.17': { finger: 2, side: 'palmar', pts: div(1, 3, 'D') },
  // שתי נקודות על קו האמצע של המקטע האמצעי של האצבע האמצעית, פלמרי. 1/3 ו-2/3 צון מהקפל הדיסטלי.
  '11.18': { finger: 3, side: 'palmar', pts: [at(2, 1, 'C', { dcun: -2 / 3 }), at(2, 1, 'C', { dcun: -1 / 3 })] },
  // שתי נקודות בצד הפלמרי של האצבע השלישית, במקטע הראשון על קו D. מחלקים לארבעה.
  // (שתיים מתוך שלושה סימנים - נבחרו 1/4 ו-3/4, כמו ב-TuXing; Hu Wen Zhi מוסיף את האמצעי)
  '11.19': { finger: 3, side: 'palmar', pts: [at(1, 1 / 4, 'D'), at(1, 3 / 4, 'D')] },
  // שלוש נקודות בצד הפלמרי של האצבע הרביעית, במקטע השני על קו D. מחלקים לארבעה.
  '11.20': { finger: 4, side: 'palmar', pts: div(2, 4, 'D') },
  // שלוש נקודות בצד הפלמרי של האצבע הרביעית, במקטע הראשון על קו B. מחלקים לארבעה.
  '11.21': { finger: 4, side: 'palmar', pts: div(1, 4, 'B') },
  // שלוש נקודות בצד הפלמרי של האצבע הרביעית, במקטע הראשון על קו D. מחלקים לארבעה.
  '11.22': { finger: 4, side: 'palmar', pts: div(1, 4, 'D') },
  // שתי נקודות בצד הפלמרי של הזרת על קו C. Yi: אמצע המקטע השני. Er: אמצע המקטע הראשון.
  '11.23': { finger: 5, side: 'palmar', pts: [at(2, 0.5, 'C'), at(1, 0.5, 'C')] },
  // שתי נקודות על המקטע הראשון של האגודל, על הקו האולנרי. מחלקים לשלושה.
  // (קו אולנרי = מינוח גבי; גם הגרסה של Hu Wen Zhi בצד הגבי. חמש הנקודות שלו לא נכללו)
  '11.24': { finger: 1, side: 'dorsal', pts: div(1, 3, 'ulnar') },
  // שתי נקודות על המקטע הראשון של האגודל, על הקו הרדיאלי. מחלקים לשלושה.
  '11.25': { finger: 1, side: 'dorsal', pts: div(1, 3, 'radial') },
  // שלוש נקודות על גב האגודל, באמצע המקטע הפרוקסימלי. מחלקים לארבעה.
  '11.26': { finger: 1, side: 'dorsal', pts: div(1, 4, 'mid') },
  // חמש נקודות בצד הפלמרי של האצבע הראשונה, במקטע הראשון על קו A. מחלקים לשישה.
  '11.27': { finger: 1, side: 'palmar', pts: div(1, 6, 'A') },
  // שמונה נקודות בקצות האצבעות, גבי. Yi אגודל, Er מורה, San רדיאלי אמצעית, Si אולנרי אמצעית,
  // Wu טבעת, Liu רדיאלי זרת, Qi אולנרי זרת, Ba צד אולנרי של בסיס כף היד.
  // (בקצה = בגובה בסיס הציפורן על המקטע הדיסטלי; Ba על שפת הזרת של עקב כף היד)
  BaGuan: {
    finger: [1, 2, 3, 4, 5], side: 'dorsal', segment: 3, pts: [
      at(2, NAIL_BASE, 'mid', { finger: 1 }),
      at(3, NAIL_BASE, 'mid', { finger: 2 }),
      at(3, NAIL_BASE, 'radial', { finger: 3 }),
      at(3, NAIL_BASE, 'ulnar', { finger: 3 }),
      at(3, NAIL_BASE, 'mid', { finger: 4 }),
      at(3, NAIL_BASE, 'radial', { finger: 5 }),
      at(3, NAIL_BASE, 'ulnar', { finger: 5 }),
      { special: 'palmBaseUlnar' },
    ],
  },
  // בין DaJian (11.01) ל-XiaoJian (11.02), בצד הרדיאלי של המקטע הפרוקסימלי של האצבע המורה, פלמרי.
  // (באמצע ביניהן לאורך, על הדופן הרדיאלית עצמה)
  CeJian: { finger: 2, side: 'palmar', pts: [at(1, 0.5, 'radialSide', { dcun: 0.1 })] },
  // Nei Yin: אצבע מורה, קו A, בשליש התחתון (הפרוקסימלי) של המקטע השלישי.
  // Chen Yin: אצבע מורה, קו A, בשליש העליון (הדיסטלי) של המקטע הראשון. (באמצע השליש)
  ChenYinNeiYin: { finger: 2, side: 'palmar', pts: [at(3, 1 / 6, 'A'), at(1, 5 / 6, 'A')] },
  // Yi: פלמרי, אצבע מורה, בקפל שבין המקטע הראשון לשני, קו D. Er: אותו קפל, קו B.
  FeiLing: { finger: 2, side: 'palmar', pts: [at(1, 1, 'D'), at(1, 1, 'B')] },
  // שלוש נקודות בצד הפלמרי של המקטע השני של האצבע הרביעית (טבעת), קו B. שלושת קווי החלוקה לארבעה.
  DingChuan: { finger: 4, side: 'palmar', pts: div(2, 4, 'B') },
  // שלוש נקודות בצד הפלמרי של המקטע הראשון של הזרת, קו B. שלושת קווי החלוקה לארבעה.
  FenShui: { finger: 5, side: 'palmar', pts: div(1, 4, 'B') },
  // שלוש נקודות על המקטע הראשון של אצבע הטבעת, לאורך קו A. שלושת קווי החלוקה לארבעה.
  FengChao: { finger: 4, side: 'palmar', pts: div(1, 4, 'A') },
  // שלוש נקודות בצד הפלמרי של האצבע האמצעית, המקטע הראשון, קו B. שלושת קווי החלוקה לארבעה.
  HuoLong: { finger: 3, side: 'palmar', pts: div(1, 4, 'B') },
  // שתי נקודות בצד הפלמרי של האצבע האמצעית, קו C. Xia: אמצע המקטע השני. Shang: אמצע המקטע הראשון.
  HuoXing: { finger: 3, side: 'palmar', pts: [at(2, 0.5, 'C'), at(1, 0.5, 'C')] },
  // שלוש נקודות בצד הגבי של המקטע הראשון של אצבע הטבעת, על הקו הרדיאלי. חלוקה לארבעה.
  JianPi: { finger: 4, side: 'dorsal', pts: div(1, 4, 'radial') },
  // בצד הפלמרי של האצבע האמצעית, באמצע המקטע השלישי (דיסטלי).
  KaiPi: { finger: 3, side: 'palmar', pts: [at(3, 0.5, 'C')] },
  // שתי נקודות בצד הפלמרי של האצבע האמצעית, באמצע המקטע השני. Yi: קו A. Er: קו E.
  MuHua: { finger: 3, side: 'palmar', pts: [at(2, 0.5, 'A'), at(2, 0.5, 'E')] },
  // Yi: פלמרי, אצבע הטבעת, בקפל הראשון (בין המקטע הראשון לשני), קו B. Er: אותו קפל, קו D.
  MuLing: { finger: 4, side: 'palmar', pts: [at(1, 1, 'B'), at(1, 1, 'D')] },
  // באמצע המקטע השני של אצבע הטבעת, על קו E. (זהה ל-11.06 לפי הטקסט הראשי שלה)
  PianJian11: { finger: 4, side: 'palmar', pts: [at(2, 0.5, 'E')] },
  // שבע נקודות: שתיים על כל אחת מהאצבעות 2, 3, 4 ואחת על 5, בצד הגבי, במפרק שבין המקטע
  // הראשון לשני, על הקווים הרדיאלי והאולנרי. על האצבע החמישית - רק הקו האולנרי.
  QiHua: {
    finger: [2, 3, 4, 5], side: 'dorsal', pts: [
      at(1, 1, 'radial', { finger: 2 }), at(1, 1, 'ulnar', { finger: 2 }),
      at(1, 1, 'radial', { finger: 3 }), at(1, 1, 'ulnar', { finger: 3 }),
      at(1, 1, 'radial', { finger: 4 }), at(1, 1, 'ulnar', { finger: 4 }),
      at(1, 1, 'ulnar', { finger: 5 }),
    ],
  },
  // שתי נקודות בצד הפלמרי של האצבע האמצעית, בקפל שבין המקטע הראשון לשני. Yi: קו B. Er: קו D.
  ShuangLing: { finger: 3, side: 'palmar', pts: [at(1, 1, 'B'), at(1, 1, 'D')] },
  // בצד הגבי של הזרת, במפרק שבין המקטע הראשון לשני, על הקו הרדיאלי.
  ShaoBai: { finger: 5, side: 'dorsal', pts: [at(1, 1, 'radial')] },
  // פלמרי, המקטע השני של הזרת, 0.2 צון אולנרית ודיסטלית ל-11.23 Yan Huang, בין קווים C ו-D.
  // (0.2 צון לרוחב היו מוציאים אותה מעבר לקו D; נבחר "בין C ל-D")
  ShiZhen: { finger: 5, side: 'palmar', pts: [at(2, 0.5, { f: -0.2 }, { dcun: 0.2 })] },
  // שלוש נקודות בצד הפלמרי של המקטע השני של הזרת, קו D. חלוקה לארבעה.
  ShuiHai: { finger: 5, side: 'palmar', pts: div(2, 4, 'D') },
  // שלוש נקודות בצד הפלמרי של המקטע השני של הזרת, קו B. חלוקה לארבעה.
  ShuiQing: { finger: 5, side: 'palmar', pts: div(2, 4, 'B') },
  // שלוש נקודות בצד הגבי של הזרת, באמצע המקטע השני. Yi רדיאלי, Er אמצע, San אולנרי.
  ShuiYao: { finger: 5, side: 'dorsal', pts: [at(2, 0.5, 'radial'), at(2, 0.5, 'mid'), at(2, 0.5, 'ulnar')] },
  // שלוש נקודות בצד הפלמרי של המקטע הראשון של הזרת, קו D. חלוקה לארבעה.
  ShuiYuan: { finger: 5, side: 'palmar', pts: div(1, 4, 'D') },
  // שלוש נקודות בצד הגבי של המקטע הראשון של האצבע המורה, על הקו האמצעי. חלוקה לארבעה.
  SanXian: { finger: 2, side: 'dorsal', pts: div(1, 4, 'mid') },
  // שלוש נקודות על האצבע המורה, לאורך קו A, במקטע השני. חלוקה לארבעה.
  SanYang: { finger: 2, side: 'palmar', pts: div(2, 4, 'A') },
  // Yi: פלמרי, הזרת, בקפל הראשון (בין המקטע הראשון לשני), קו D. Er: אותו קפל, קו B.
  TongGu: { finger: 5, side: 'palmar', pts: [at(1, 1, 'D'), at(1, 1, 'B')] },
  // Yi: פלמרי, אצבע הטבעת, אמצע המקטע השני, קו C. Er: אמצע המקטע הראשון, קו C.
  TuHang: { finger: 4, side: 'palmar', pts: [at(2, 0.5, 'C'), at(1, 0.5, 'C')] },
  // שתי נקודות בצד הפלמרי של האצבע האמצעית, המקטע הראשון, קו C, חלוקה לארבעה.
  // Yi: בצומת הרבעון הראשון והשני. Er: בצומת הרבעון השלישי והרביעי.
  TuXing: { finger: 3, side: 'palmar', pts: [at(1, 1 / 4, 'C'), at(1, 3 / 4, 'C')] },
  // בצד הפלמרי של האצבע המורה, באמצע המקטע השני, על קו C.
  XiaJian: { finger: 2, side: 'palmar', pts: [at(2, 0.5, 'C')] },
  // בצד הגבי של האצבע האמצעית, בצדדים הלטרלי והמדיאלי, 0.2 צון פוסטריורית לפינת הציפורן.
  // (פינת הציפורן = בסיס הציפורן בשולי הגב; 0.2 צון פרוקסימלית לה)
  XiLing: {
    finger: 3, side: 'dorsal', pts: [
      at(3, NAIL_BASE, { f: 0.75 }, { dcun: -0.2 }),
      at(3, NAIL_BASE, { f: -0.75 }, { dcun: -0.2 }),
    ],
  },
  // שלוש נקודות בצד הגבי של הזרת, באמצע המקטע הראשון. Yi רדיאלי, Er אמצע, San אולנרי.
  ZhengShui: { finger: 5, side: 'dorsal', pts: [at(1, 0.5, 'radial'), at(1, 0.5, 'mid'), at(1, 0.5, 'ulnar')] },
  // שלוש נקודות בצד הגבי של המקטע האמצעי של אצבע הטבעת, לאורך הקו הרדיאלי. חלוקה לארבעה.
  ZhengTu: { finger: 4, side: 'dorsal', pts: div(2, 4, 'radial') },
  // שתי נקודות על האגודל, בין המקטע הראשון לשני, משני צדי הקפל, קרוב לעצם.
  // (בקצות קפל ה-IP הפלמרי: קווים A ו-E)
  ZhuYuan: { finger: 1, side: 'palmar', pts: [at(1, 1, 'A'), at(1, 1, 'E')] },
  // שלוש נקודות על הקו הרדיאלי, בצד הגבי של המקטע הראשון של האצבע המורה. חלוקה לארבעה.
  ZhiFei: { finger: 2, side: 'dorsal', pts: div(1, 4, 'radial') },
  // שלוש נקודות בצד הפלמרי של האגודל, במקטע הראשון, לאורך קו D. חלוקה לארבעה.
  ZhiSanHuang: { finger: 1, side: 'palmar', pts: div(1, 4, 'D') },
  // שלוש נקודות על הקו הרדיאלי, בצד הגבי של המקטע השני של האצבע המורה. חלוקה לארבעה.
  ZhiWei: { finger: 2, side: 'dorsal', pts: div(2, 4, 'radial') },
}

// ─────────────────────────────── גיאומטריה ───────────────────────────────

/** משולשי כף היד בלבד (x חיובי, מתחת לאמה) - בלי הירך, ועם חיתוך קרניים מהיר משלנו */
function handMesh(m, tipY) {
  const g = m.mesh.geometry, P = g.attributes.position, I = g.index
  const ok = i => P.getX(i) > 0.3 * m.s && P.getY(i) < tipY + 0.30 * m.s
  const tris = []
  for (let f = 0; f < I.count; f += 3) {
    const a = I.getX(f), b = I.getX(f + 1), c = I.getX(f + 2)
    if (!(ok(a) && ok(b) && ok(c))) continue
    const A = V(P.getX(a), P.getY(a), P.getZ(a)), B = V(P.getX(b), P.getY(b), P.getZ(b)), C = V(P.getX(c), P.getY(c), P.getZ(c))
    const e1 = B.clone().sub(A), e2 = C.clone().sub(A)
    tris.push({ A, B, C, e1, e2, n: e1.clone().cross(e2).normalize() })
  }
  const verts = []
  for (let i = 0; i < P.count; i++) if (ok(i)) verts.push(V(P.getX(i), P.getY(i), P.getZ(i)))
  return { tris, verts }
}

/** כל החיתוכים של קרן עם רשימת משולשים (Möller–Trumbore), ממוינים לפי מרחק */
function rayTris(tris, o, d, far) {
  const out = []
  const dx = d.x, dy = d.y, dz = d.z
  for (const t of tris) {
    const { A, e1, e2 } = t
    const px = dy * e2.z - dz * e2.y, py = dz * e2.x - dx * e2.z, pz = dx * e2.y - dy * e2.x
    const det = e1.x * px + e1.y * py + e1.z * pz
    if (Math.abs(det) < 1e-14) continue
    const inv = 1 / det
    const tx = o.x - A.x, ty = o.y - A.y, tz = o.z - A.z
    const u = (tx * px + ty * py + tz * pz) * inv
    if (u < 0 || u > 1) continue
    const qx = ty * e1.z - tz * e1.y, qy = tz * e1.x - tx * e1.z, qz = tx * e1.y - ty * e1.x
    const v = (dx * qx + dy * qy + dz * qz) * inv
    if (v < 0 || u + v > 1) continue
    const dist = (e2.x * qx + e2.y * qy + e2.z * qz) * inv
    if (dist < 0 || dist > far) continue
    out.push({ distance: dist, tri: t })
  }
  out.sort((a, b) => a.distance - b.distance)
  return out.map(h => ({ distance: h.distance, point: o.clone().addScaledVector(d, h.distance), face: { normal: h.tri.n.clone() } }))
}

function makeTools(hand) {
  const hits = (o, d, far = 1, tris = hand.tris) => rayTris(tris, o, d.clone().normalize(), far)
  /** חתך מישורי: שורות לאורך U, קרניים לאורך D מנקודה origin - 0.15D. מחזיר רכיבים קשירים */
  const slice = (origin, U, D, half = 0.09, step = 0.0005) => {
    // רק משולשים שחוצים את מישור החתך
    const N = U.clone().cross(D).normalize()
    const near = hand.tris.filter(t => {
      const a = t.A.clone().sub(origin).dot(N), b = t.B.clone().sub(origin).dot(N), c = t.C.clone().sub(origin).dot(N)
      return Math.min(a, b, c) <= 1e-9 && Math.max(a, b, c) >= -1e-9
    })
    const rows = []
    for (let u = half; u > -half; u -= step) {
      const o = origin.clone().addScaledVector(U, u).addScaledVector(D, -0.15)
      const h = hits(o, D, 1, near).map(q => q.distance - 0.15)
      const iv = []
      for (let k = 0; k + 1 < h.length; k += 2) iv.push([h[k], h[k + 1]])
      rows.push({ u, iv })
    }
    return components(rows, step)
  }
  return { hits, slice }
}

/** רכיבים קשירים בחתך: מקטעים בשורות סמוכות שחופפים בעומק שייכים לאותו רכיב */
function components(rows, step) {
  const parent = []
  const find = a => (parent[a] === a ? a : (parent[a] = find(parent[a])))
  const items = []
  const ids = rows.map(row => row.iv.map(v => { parent.push(items.length); items.push({ u: row.u, v }); return items.length - 1 }))
  for (let i = 1; i < rows.length; i++) {
    rows[i].iv.forEach((v, j) => rows[i - 1].iv.forEach((w, k) => {
      if (v[0] < w[1] && w[0] < v[1]) parent[find(ids[i][j])] = find(ids[i - 1][k])
    }))
  }
  const groups = new Map()
  items.forEach((it, k) => { const r = find(k); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(it) })
  return [...groups.values()].map(list => {
    let A = 0, cu = 0, cd = 0, u0 = 9, u1 = -9, d0 = 9, d1 = -9
    for (const it of list) {
      const w = it.v[1] - it.v[0]
      A += w * step; cu += w * it.u; cd += w * (it.v[0] + it.v[1]) / 2
      u0 = Math.min(u0, it.u); u1 = Math.max(u1, it.u); d0 = Math.min(d0, it.v[0]); d1 = Math.max(d1, it.v[1])
    }
    const W = A / step
    return { A, u: cu / W, d: cd / W, u0, u1, d0, d1, width: u1 - u0 + step }
  })
}

/** מעקב אחרי אצבעות בחתכים ניצבים ל-T, מהקצה כלפי שורש כף היד */
function trackDigits(tools, frame, tTop, tBottom, step = 0.001) {
  const { O, T, R, P } = frame
  const tracks = []
  for (let t = tTop; t > tBottom; t -= step) {
    const comps = tools.slice(O.clone().addScaledVector(T, t), R, P).filter(c => c.A > 4e-6)
    const claims = new Map()
    for (const tr of tracks) {
      if (tr.done) continue
      const last = tr.sec[tr.sec.length - 1]
      const c = comps.find(q => q.u0 <= last.u && last.u <= q.u1 && q.d0 - 0.004 <= last.d && last.d <= q.d1 + 0.004)
      if (!c) { tr.done = true; continue }
      if (!claims.has(c)) claims.set(c, [])
      claims.get(c).push(tr)
    }
    for (const [c, trs] of claims) {
      for (const tr of trs) {
        const widths = tr.sec.map(q => q.width).sort((a, b) => a - b)
        const med = widths[Math.floor(widths.length / 2)]
        if (trs.length > 1 || (tr.sec.length > 8 && c.width > 1.6 * med)) { tr.done = true; tr.baseT = t + step / 2; continue }
        tr.sec.push({ t, ...c })
      }
    }
    for (const c of comps) {
      if (claims.has(c)) continue
      if (c.width < 0.012) tracks.push({ sec: [{ t, ...c }], done: false })
    }
  }
  return tracks.filter(tr => tr.sec.length >= 8)
}

/** קו אמצע של אצבע: מרכזי החתכים בתלת ממד, מוחלקים, עם אורך קשת ומסגרת מקומית */
function centerline(pts, halfR, halfU, tipPoint) {
  // pts: מהבסיס לקצה
  const sm = pts.map((p, i) => {
    const w = pts.slice(Math.max(0, i - 2), i + 3)
    return w.reduce((a, b) => a.clone().add(b), V(0, 0, 0)).multiplyScalar(1 / w.length)
  })
  sm[0] = pts[0].clone()
  if (tipPoint) sm.push(tipPoint.clone())
  const arc = [0]
  for (let i = 1; i < sm.length; i++) arc.push(arc[i - 1] + sm[i].distanceTo(sm[i - 1]))
  const total = arc[arc.length - 1]
  // כיוון הבסיס להמשכה פרוקסימלית: ממוצע על 15 מ"מ ראשונים
  let k = 1
  while (k < sm.length - 1 && arc[k] < 0.015) k++
  const baseDir = sm[k].clone().sub(sm[0]).normalize()
  const idx = s => { let i = 1; while (i < arc.length - 1 && arc[i] < s) i++; return i }
  const at = s => {
    if (s <= 0) return { c: sm[0].clone().addScaledVector(baseDir, s), a: baseDir.clone(), hr: halfR[0], hu: halfU[0] }
    const i = idx(Math.min(s, total))
    const f = Math.min(Math.max((s - arc[i - 1]) / Math.max(arc[i] - arc[i - 1], 1e-9), 0), 1)
    const c = sm[i - 1].clone().lerp(sm[i], f)
    const j0 = Math.max(i - 3, 0), j1 = Math.min(i + 2, sm.length - 1)
    const a = sm[j1].clone().sub(sm[j0]).normalize()
    const hi = Math.min(i, halfR.length - 1)
    // קרוב לקצה החתכים נחתכים באלכסון - הרוחב נלקח מהחתך השלם האחרון
    const safe = Math.min(hi, Math.max(0, halfR.length - 4))
    return { c, a, hr: halfR[safe], hu: halfU[safe] }
  }
  return { total, at, sm, arc }
}

// ─────────────────────────────── פתרון גוף אחד ───────────────────────────────

function solveBody(m, sex) {
  const pos = m.positions
  let tipY = Infinity
  for (let i = 0; i < pos.count; i++) if (pos.getX(i) > 0.3 * m.s && pos.getY(i) < tipY) tipY = pos.getY(i)
  const hand = handMesh(m, tipY)
  const tools = makeTools(hand)
  const log = (...a) => DEBUG && console.log(`[${sex}]`, ...a)

  // ---- מסגרת ראשונית: T כלפי מטה, R מאחורי-הזרת אל המורה בגובה 3 ס"מ מהקצה ----
  let frame = (() => {
    const y = tipY + 0.03
    const comps = tools.slice(V(0.45 * m.s, y, 0.15), V(0, 0, 1), V(1, 0, 0), 0.25).filter(c => c.A > 2e-5).sort((a, b) => b.u - a.u)
    const first = comps[0], last = comps[comps.length - 1]
    const T = V(0, -1, 0)
    const R = V(first.d - last.d, 0, first.u - last.u).normalize()
    const P = T.clone().cross(R).normalize()
    const O = V(0.45 * m.s + (first.d + last.d) / 2, tipY + 0.15, 0.15 + (first.u + last.u) / 2)
    return { O, T, R, P }
  })()

  let digits
  for (let pass = 0; pass < 3; pass++) {
    const { O, T, R, P } = frame
    // שורש כף היד: החתך הצר ביותר (ברוחב הרדיאלי) בין כף היד לאמה
    const tOf = v => v.clone().sub(O).dot(T)
    let tTop = -9
    for (const v of hand.verts) tTop = Math.max(tTop, tOf(v))
    const widths = []
    for (let t = tTop - 0.10; t > tTop - 0.24; t -= 0.002) {
      const c = tools.slice(O.clone().addScaledVector(T, t), R, P, 0.12, 0.001).sort((a, b) => b.A - a.A)[0]
      if (c) widths.push({ t, c })
    }
    const minW = Math.min(...widths.map(q => q.c.width))
    const wr = widths.find(q => q.c.width <= minW + 0.003)
    const wrist = O.clone().addScaledVector(T, wr.t).addScaledVector(R, wr.c.u).addScaledVector(P, wr.c.d)

    const tracks = trackDigits(tools, frame, tTop - 0.0005, wr.t + 0.02)
    const to3 = q => O.clone().addScaledVector(T, q.t).addScaledVector(R, q.u).addScaledVector(P, q.d)
    // האגודל: המסלול הרדיאלי ביותר בקצהו; ארבע האצבעות: ארבעת הארוכים מהשאר, לפי R יורד
    const byLen = tracks.slice().sort((a, b) => b.sec.length - a.sec.length)
    const thumb = byLen.slice(0, 5).sort((a, b) => b.sec[0].u - a.sec[0].u)[0]
    const four = byLen.filter(t => t !== thumb).slice(0, 4).sort((a, b) => b.sec[0].u - a.sec[0].u)
    if (four.length < 4 || !thumb) throw new Error(`${sex}: found ${tracks.length} digit tracks`)
    const bases = four.map(tr => to3(tr.sec[tr.sec.length - 1]))
    const baseMid = bases.reduce((a, b) => a.add(b), V(0, 0, 0)).multiplyScalar(0.25)
    const T2 = baseMid.clone().sub(wrist).normalize()
    const R2 = bases[0].clone().sub(bases[3])
    R2.addScaledVector(T2, -R2.dot(T2)).normalize()
    const P2 = T2.clone().cross(R2).normalize()
    log(`pass ${pass}: wrist t=${wr.t.toFixed(3)} y-tip=${(wrist.y - tipY).toFixed(3)} width=${(minW * 1000).toFixed(0)}mm tracks=${tracks.length}`,
      'T', T2.toArray().map(v => v.toFixed(3)), 'R', R2.toArray().map(v => v.toFixed(3)), 'P', P2.toArray().map(v => v.toFixed(3)))
    digits = { four, thumb, wrist, frame }
    const moved = T2.angleTo(frame.T) + R2.angleTo(frame.R)
    frame = { O: wrist, T: T2, R: R2, P: P2 }
    if (pass > 0 && moved < 0.01) break
  }
  // מסגרת סופית - הרצה אחרונה של המעקב במסגרת הזו
  {
    const { O, T } = frame
    let tTop = -9
    for (const v of hand.verts) tTop = Math.max(tTop, v.clone().sub(O).dot(T))
    const tracks = trackDigits(tools, frame, tTop - 0.0005, 0.02)
    const byLen = tracks.slice().sort((a, b) => b.sec.length - a.sec.length)
    const thumb = byLen.slice(0, 5).sort((a, b) => b.sec[0].u - a.sec[0].u)[0]
    const four = byLen.filter(t => t !== thumb).slice(0, 4).sort((a, b) => b.sec[0].u - a.sec[0].u)
    digits = { four, thumb, wrist: O, frame }
  }
  const { O, T, R, P } = frame
  const to3 = q => O.clone().addScaledVector(T, q.t).addScaledVector(R, q.u).addScaledVector(P, q.d)

  // ---- אצבעות 2-5 ----
  const fingers = {}
  digits.four.forEach((tr, k) => {
    const n = k + 2
    const sec = tr.sec.slice().reverse() // מהבסיס לקצה
    const pts = sec.map(to3)
    // הקצה: הקודקוד הרחוק ביותר בכיוון הציר המקומי, קרוב לחתך האחרון
    const last = pts[pts.length - 1], prev = pts[Math.max(0, pts.length - 6)]
    const dir = last.clone().sub(prev).normalize()
    let tip = null, best = -9
    for (const v of hand.verts) {
      const d = v.clone().sub(last)
      if (d.length() > 0.02) continue
      const along = d.dot(dir)
      if (d.clone().addScaledVector(dir, -along).length() > 0.009) continue
      if (along > best) { best = along; tip = v }
    }
    // הקצה עצמו על פני העור; קו האמצע נגמר מעט לפניו
    const tipC = tip ? tip.clone().addScaledVector(dir, -0.002) : null
    const halfR = sec.map(q => ({ pos: q.u1 - q.u, neg: q.u - q.u0 }))
    const halfU = sec.map(q => (q.d1 - q.d0) / 2)
    const cl = centerline(pts, halfR, halfU, tipC)
    const Lv = cl.total
    fingers[n] = {
      n, cl, Lv, baseT: sec[0].t,
      joints: { mcp: JOINTS.mcp * Lv, base: 0, pip: JOINTS.pip * Lv, dip: JOINTS.dip * Lv, tip: Lv },
    }
    log(`finger ${n}: base t=${sec[0].t.toFixed(3)} Lv=${(Lv * 1000).toFixed(1)}mm width=${((halfR[Math.floor(halfR.length / 2)].pos + halfR[Math.floor(halfR.length / 2)].neg) * 1000).toFixed(1)}mm`)
  })

  // ---- האגודל: חתכים ניצבים לציר שלו ----
  {
    const sec = digits.thumb.sec
    const tipEnd = to3(sec[0]), baseEnd = to3(sec[sec.length - 1])
    let a = tipEnd.clone().sub(baseEnd).normalize()
    // קצה האגודל: הקודקוד הרחוק ביותר לאורך הציר
    let tip = null, best = -9
    for (const v of hand.verts) {
      const d = v.clone().sub(tipEnd)
      if (d.length() > 0.025) continue
      const along = d.dot(a)
      if (d.clone().addScaledVector(a, -along).length() > 0.01) continue
      if (along > best) { best = along; tip = v }
    }
    // שתי איטרציות: חתכים ניצבים לציר, מעקב מהקצה אל כף היד
    let track = null
    for (let it = 0; it < 2; it++) {
      const D = P.clone().addScaledVector(a, -P.dot(a)).normalize()
      const U = a.clone().cross(D).normalize()
      const list = []
      let cur = tip.clone().addScaledVector(a, -0.003)
      for (let k = 0; k < 90; k++) {
        const comps = tools.slice(cur, U, D, 0.05, 0.0005).filter(c => c.A > 3e-6)
        // הרכיב שמכיל את מרכז החתך הקודם (u,d ≈ 0 כי החתך ממורכז עליו)
        const c = comps.sort((p, q) => Math.hypot(p.u, p.d) - Math.hypot(q.u, q.d))[0]
        if (!c || Math.hypot(c.u, c.d) > 0.008) break
        const widths = list.map(q => q.c.width).sort((x, y) => x - y)
        const med = widths[Math.floor(widths.length / 2)] ?? c.width
        if (list.length > 8 && (c.width > 1.6 * med || c.d1 - c.d0 > 1.6 * (list[Math.floor(list.length / 2)].c.d1 - list[Math.floor(list.length / 2)].c.d0))) break
        const center = cur.clone().addScaledVector(U, c.u).addScaledVector(D, c.d)
        list.push({ c, center, U: U.clone(), D: D.clone() })
        cur = center.clone().addScaledVector(a, -0.001)
      }
      track = list
      const n = list.length
      if (n > 10) a = list[0].center.clone().sub(list[n - 1].center).normalize()
    }
    const pts = track.map(q => q.center).reverse()
    // באגודל הכיוון הרדיאלי הוא D (הצד הפלמרי של כף היד), ולכן חצי הרוחב נמדד לאורכו
    const halfR = track.map(q => ({ pos: q.c.d1 - q.c.d, neg: q.c.d - q.c.d0 })).reverse()
    const halfU = track.map(q => (q.c.u1 - q.c.u0) / 2).reverse()
    const cl = centerline(pts, halfR, halfU, tip.clone().addScaledVector(a, -0.002))
    const Lv = cl.total
    fingers[1] = {
      n: 1, cl, Lv, axis: a, uAxis: track[0].U, dAxis: track[0].D, halfR, halfU,
      joints: { mcp: 0, base: 0, pip: THUMB_IP * Lv, dip: Lv, tip: Lv },
    }
    log(`thumb: sections=${track.length} L=${(Lv * 1000).toFixed(1)}mm axis`, a.toArray().map(v => v.toFixed(3)))
  }

  // צון האצבע = המקטע האמצעי של האצבע האמצעית (צון האצבע האמצעית הקלאסי). כך גם 11.18 -
  // "1/3 ו-2/3 צון מהקפל הדיסטלי" של אותו מקטע - יוצא בדיוק שלישים שלו
  const cun = fingers[3].joints.dip - fingers[3].joints.pip
  const ipHalf = fingers[1].cl.at(fingers[1].joints.pip).hr
  log(`cun (middle finger, middle segment) = ${(cun * 1000).toFixed(1)}mm; thumb width at IP = ${((ipHalf.pos + ipHalf.neg) * 1000).toFixed(1)}mm`)
  return { m, hand, tools, frame, fingers, cun, tipY, log }
}

// ─────────────────────────────── הצבת נקודות ───────────────────────────────

/** מסגרת מקומית של אצבע בנקודת קשת s: c מרכז, a ציר (אל הקצה), pal פלמרי, rad רדיאלי */
function localFrame(body, n, s) {
  const f = body.fingers[n]
  const q = f.cl.at(s)
  const a = q.a
  let pal
  if (n === 1) {
    // האגודל מסובב: הכרית פונה אל האצבעות (-R), הדופן הרדיאלית פונה לצד הפלמרי של כף היד (+P)
    pal = body.frame.R.clone().negate()
  } else pal = body.frame.P.clone()
  pal.addScaledVector(a, -pal.dot(a)).normalize()
  const rad = pal.clone().cross(a).normalize()
  return { c: q.c, a, pal, rad, hr: q.hr }
}

function segRange(f, seg, side) {
  const J = f.joints
  if (f.n === 1) return seg === 1 ? [J.mcp, J.pip] : [J.pip, J.tip]
  const start = side === 'dorsal' ? J.mcp : J.base
  return seg === 1 ? [start, J.pip] : seg === 2 ? [J.pip, J.dip] : [J.dip, J.tip]
}

function placeSub(body, spec, sp) {
  if (sp.special === 'palmBaseUlnar') return palmBaseUlnar(body)
  const n = sp.finger ?? spec.finger
  const side = sp.side ?? spec.side
  const f = body.fingers[n]
  const [s0, s1] = segRange(f, sp.seg, side)
  let s = s0 + sp.along * (s1 - s0) + (sp.dcun ?? 0) * body.cun
  s = Math.min(s, f.Lv - 0.002)
  const L = localFrame(body, n, s)
  let dir, origin
  if (sp.line === 'radialSide') {
    dir = L.rad.clone()
    origin = L.c.clone()
  } else {
    let frac
    if (sp.line) frac = side === 'palmar' ? PALMAR_LINE[sp.line] : DORSAL_LINE[sp.line]
    else if (sp.lat.f != null) frac = sp.lat.f
    else frac = sp.lat.cun * body.cun / (sp.lat.cun >= 0 ? L.hr.pos : L.hr.neg)
    frac = Math.max(-0.85, Math.min(0.85, frac))
    if (frac === undefined || Number.isNaN(frac)) throw new Error('bad line ' + JSON.stringify(sp))
    const half = frac >= 0 ? L.hr.pos : L.hr.neg
    origin = L.c.clone().addScaledVector(L.rad, frac * half * 0.9)
    dir = side === 'palmar' ? L.pal.clone() : L.pal.clone().negate()
  }
  const h = body.tools.hits(origin, dir, 0.06)[0]
  if (!h?.face) throw new Error(`no surface hit for finger ${n} seg ${sp.seg}`)
  const nrm = h.face.normal.clone().normalize()
  if (nrm.dot(dir) < 0) nrm.negate()
  return { p: h.point.clone().addScaledVector(nrm, SURFACE_OFFSET), n: nrm, meta: { finger: n, s, side, seg: sp.seg } }
}

/** Ba Guan Ba: שפת הזרת של עקב כף היד, רבע הדרך משורש כף היד אל בסיס הזרת */
function palmBaseUlnar(body) {
  const { O, T, R, P } = body.frame
  const little = body.fingers[5]
  const tBase = little.cl.sm[0].clone().sub(O).dot(T)
  const t = 0.25 * tBase
  const c = body.tools.slice(O.clone().addScaledVector(T, t), R, P, 0.12, 0.0005).sort((a, b) => b.A - a.A)[0]
  const origin = O.clone().addScaledVector(T, t).addScaledVector(R, c.u).addScaledVector(P, c.d)
  const dir = R.clone().negate().addScaledVector(P, -0.35).normalize()
  const h = body.tools.hits(origin, dir, 0.1)[0]
  const nrm = h.face.normal.clone().normalize()
  if (nrm.dot(dir) < 0) nrm.negate()
  return { p: h.point.clone().addScaledVector(nrm, SURFACE_OFFSET), n: nrm, meta: { finger: 5, s: null, side: 'dorsal', seg: 0 } }
}

export async function solveAll() {
  const out = {}
  for (const sex of ['female', 'male']) {
    const m = measure(await loadBody(`public/models/body-${sex}.glb`))
    const body = solveBody(m, sex)
    const res = {}
    for (const [id, spec] of Object.entries(SPECS)) res[id] = spec.pts.map(sp => placeSub(body, spec, sp))
    out[sex] = { body, res }
  }
  return out
}

// ─────────────────────────────── main ───────────────────────────────

const isMain = (process.argv[1] ?? '').split('\\').join('/').endsWith('scripts/body-model/finger-solver.mjs')

if (isMain) {
  const out = await solveAll()
  const r = v => +v.toFixed(4)
  const vec = v => `[${r(v.x)}, ${r(v.y)}, ${r(v.z)}]`
  const ids = Object.keys(SPECS)
  const body = sex => ids.map(id => `    '${id}': [\n${out[sex].res[id].map(q => `      { p: ${vec(q.p)}, n: ${vec(q.n)} },`).join('\n')}\n    ],`).join('\n')
  // המקטע של היחידה: מה שנקבע במפורש, אחרת המקטע של תת-הנקודה הראשונה ברשימה
  const segOf = spec => spec.segment ?? spec.pts[0].seg
  const specs = ids.map(id => {
    const sp = SPECS[id]
    const finger = Array.isArray(sp.finger) ? `[${sp.finger.join(', ')}]` : sp.finger
    return `  '${id}': { finger: ${finger}, segment: ${segOf(sp)}, side: '${sp.side}' },`
  }).join('\n')
  const frame = sex => {
    const { O, T, R, P } = out[sex].body.frame
    return `  ${sex}: { wrist: ${vec(O)}, palmNormal: ${vec(P)}, fingerDir: ${vec(T)}, radialDir: ${vec(R)} },`
  }
  fs.writeFileSync('src/data/bodyModel/fingerPoints.ts', `// נוצר על ידי scripts/body-model/finger-solver.mjs - לא לערוך ביד.
// נקודות האצבעות של מאסטר דונג (אזור 11), לפי תיאורי המיקום בעברית שב-src/data/zones/zone11*.ts.
import type { BodySex, SurfacePoint, Vec3 } from './meridians'

export type Finger = 1 | 2 | 3 | 4 | 5
export interface FingerPointSpec { finger: Finger | Finger[]; segment: 1 | 2 | 3; side: 'palmar' | 'dorsal' }

/** מיקומי תת-הנקודות של כל נקודת אצבע, בצד שמאל של המטופל */
export const fingerPointPositions: Record<BodySex, Record<string, SurfacePoint[]>> = {
  female: {
${body('female')}
  },
  male: {
${body('male')}
  },
}

/** האצבע, המקטע והצד של כל נקודה (לסינון ולתצוגה) */
export const fingerPointSpecs: Record<string, FingerPointSpec> = {
${specs}
}

/** מערכת צירים של כף היד, להצגת יד מוגדלת: מרכז שורש כף היד ושלושה כיוונים יחידה */
export const handFrame: Record<BodySex, { wrist: Vec3; palmNormal: Vec3; fingerDir: Vec3; radialDir: Vec3 }> = {
${frame('female')}
${frame('male')}
}
`)
  console.log('wrote src/data/bodyModel/fingerPoints.ts:', ids.length, 'points,',
    ids.reduce((a, id) => a + SPECS[id].pts.length, 0), 'sub-points per body')
}
