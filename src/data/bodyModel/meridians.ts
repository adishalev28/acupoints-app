// מרידיאנים במודל התלת ממדי למטופלים.
// המיקומים עצמם נמצאים ב-meridianPaths.ts, בנפרד לגבר ולאישה.

export type BodySex = 'female' | 'male'
export type Vec3 = [number, number, number]

/** נקודה על פני הגוף: מיקום במטרים (צד שמאל של המטופל, x חיובי) והנורמל של המשטח */
export interface SurfacePoint {
  p: Vec3
  n: Vec3
}

export interface ControlPoint {
  id: string // 'ST36'
  pinyin: string
  hint: string // תזכורת למטפל במצב עריכה
}

export interface MeridianDef {
  id: string
  hebrewName: string
  chineseName: string
  color: string
  /** הסבר למטופל - עברית פשוטה, בלי מונחים מקצועיים */
  explanation: string[]
  controlPoints: ControlPoint[]
  /** קווים רציפים. נקודה יכולה להופיע בשני קווים (פיצול) */
  segments: string[][]
}

export const stomachMeridian: MeridianDef = {
  id: 'stomach',
  hebrewName: 'ערוץ הקיבה',
  chineseName: '足陽明胃經',
  color: '#ffb547',
  explanation: [
    'ערוץ הקיבה הוא אחד מ-12 הערוצים הראשיים בגוף. הוא מתחיל מתחת לעין, יורד דרך הפנים, החזה והבטן, וממשיך לאורך קדמת הרגל עד האצבע השנייה בכף הרגל.',
    'ברפואה הסינית הערוץ קשור לעיכול, לתיאבון ולאנרגיה שהגוף מפיק מהמזון.',
    'בגלל שהערוץ עובר לאורך כל הגוף, דיקור ברגל יכול להשפיע על הבטן, גם כשהנקודה רחוקה מהמקום שמטריד.',
  ],
  controlPoints: [
    { id: 'ST1', pinyin: 'Chengqi', hint: 'מתחת לאישון, על שולי ארובת העין' },
    { id: 'ST3', pinyin: 'Juliao', hint: 'מתחת לאישון, בגובה כנף האף' },
    { id: 'ST4', pinyin: 'Dicang', hint: 'לצד זווית הפה' },
    { id: 'ST5', pinyin: 'Daying', hint: 'לפני זווית הלסת, בקצה הקדמי של שריר הלעיסה' },
    { id: 'ST6', pinyin: 'Jiache', hint: 'על שריר הלעיסה, מעל זווית הלסת' },
    { id: 'ST7', pinyin: 'Xiaguan', hint: 'בשקע מתחת לקשת הלחי, לפני האוזן' },
    { id: 'ST8', pinyin: 'Touwei', hint: 'בפינת קו השיער במצח' },
    { id: 'ST9', pinyin: 'Renying', hint: 'לצד בליטת הגרון' },
    { id: 'ST11', pinyin: 'Qishe', hint: 'מעל הקצה הפנימי של עצם הבריח' },
    { id: 'ST12', pinyin: 'Quepen', hint: 'בשקע מעל אמצע עצם הבריח' },
    { id: 'ST13', pinyin: 'Qihu', hint: 'מתחת לאמצע עצם הבריח' },
    { id: 'ST15', pinyin: 'Wuyi', hint: 'במרווח הבין צלעי השני, בקו הפטמה' },
    { id: 'ST17', pinyin: 'Ruzhong', hint: 'מרכז הפטמה' },
    { id: 'ST18', pinyin: 'Rugen', hint: 'מתחת לפטמה, במרווח החמישי' },
    { id: 'ST19', pinyin: 'Burong', hint: '6 צון מעל הטבור, 2 צון מהקו האמצעי' },
    { id: 'ST21', pinyin: 'Liangmen', hint: '4 צון מעל הטבור, 2 צון מהקו האמצעי' },
    { id: 'ST25', pinyin: 'Tianshu', hint: 'בגובה הטבור, 2 צון מהקו האמצעי' },
    { id: 'ST27', pinyin: 'Daju', hint: '2 צון מתחת לטבור, 2 צון מהקו האמצעי' },
    { id: 'ST30', pinyin: 'Qichong', hint: 'בגובה עצם הערווה, 2 צון מהקו האמצעי' },
    { id: 'ST31', pinyin: 'Biguan', hint: 'בקדמת הירך, בגובה קפל המפשעה' },
    { id: 'ST32', pinyin: 'Futu', hint: '6 צון מעל הפיקה, בקדמת הירך' },
    { id: 'ST34', pinyin: 'Liangqiu', hint: '2 צון מעל הפינה החיצונית של הפיקה' },
    { id: 'ST35', pinyin: 'Dubi', hint: 'עין הברך החיצונית' },
    { id: 'ST36', pinyin: 'Zusanli', hint: '3 צון מתחת לעין הברך, אצבע אחת מחוץ לעצם השוק' },
    { id: 'ST38', pinyin: 'Tiaokou', hint: 'באמצע השוק, אצבע אחת מחוץ לעצם השוק' },
    { id: 'ST41', pinyin: 'Jiexi', hint: 'באמצע קפל הקרסול מלפנים' },
    { id: 'ST42', pinyin: 'Chongyang', hint: 'בגב כף הרגל, במקום הדופק' },
    { id: 'ST44', pinyin: 'Neiting', hint: 'בין האצבע השנייה לשלישית' },
    { id: 'ST45', pinyin: 'Lidui', hint: 'בפינה החיצונית של ציפורן האצבע השנייה' },
  ],
  segments: [
    ['ST1', 'ST3', 'ST4', 'ST5', 'ST6', 'ST7', 'ST8'],
    ['ST5', 'ST9', 'ST11', 'ST12', 'ST13', 'ST15', 'ST17', 'ST18', 'ST19', 'ST21', 'ST25', 'ST27', 'ST30',
      'ST31', 'ST32', 'ST34', 'ST35', 'ST36', 'ST38', 'ST41', 'ST42', 'ST44', 'ST45'],
  ],
}

export const largeIntestineMeridian: MeridianDef = {
  id: 'largeIntestine',
  hebrewName: 'ערוץ המעי הגס',
  chineseName: '手陽明大腸經',
  color: '#8fd16a',
  explanation: [
    'ערוץ המעי הגס מתחיל בקצה האצבע המורה, עולה לאורך היד והכתף, עובר בצוואר ומסתיים ליד האף.',
    'ברפואה הסינית הוא קשור ליציאות ולפינוי של מה שהגוף לא צריך, וגם לאף, לשיניים ולפנים.',
    'לכן נקודה בכף היד יכולה לעזור בכאב ראש, בכאב שיניים או בגודש באף.',
  ],
  controlPoints: [
    { id: 'LI1', pinyin: 'Shangyang', hint: 'בפינה של ציפורן האצבע המורה, בצד האגודל' },
    { id: 'LI2', pinyin: 'Erjian', hint: 'בצד האגודל של האצבע המורה, לפני מפרק הבסיס' },
    { id: 'LI3', pinyin: 'Sanjian', hint: 'בצד האגודל של האצבע המורה, מאחורי מפרק הבסיס' },
    { id: 'LI4', pinyin: 'Hegu', hint: 'בגב כף היד, בין האגודל לאצבע המורה' },
    { id: 'LI5', pinyin: 'Yangxi', hint: 'בשקע בשורש כף היד, בצד האגודל' },
    { id: 'LI10', pinyin: 'Shousanli', hint: '2 צון מתחת לקפל המרפק, בצד האגודל' },
    { id: 'LI11', pinyin: 'Quchi', hint: 'בקצה החיצוני של קפל המרפק' },
    { id: 'LI14', pinyin: 'Binao', hint: 'בזרוע, בקצה התחתון של שריר הכתף' },
    { id: 'LI15', pinyin: 'Jianyu', hint: 'בשקע הקדמי של הכתף, כשמרימים את היד' },
    { id: 'LI16', pinyin: 'Jugu', hint: 'בשקע בין עצם הבריח לעצם השכמה' },
    { id: 'LI18', pinyin: 'Futu', hint: 'בצוואר, בגובה בליטת הגרון, על השריר הצידי' },
    { id: 'LI20', pinyin: 'Yingxiang', hint: 'לצד כנף האף' },
  ],
  segments: [['LI1', 'LI2', 'LI3', 'LI4', 'LI5', 'LI10', 'LI11', 'LI14', 'LI15', 'LI16', 'LI18', 'LI20']],
}

export const meridians: MeridianDef[] = [stomachMeridian, largeIntestineMeridian]

export const BODY_MODEL_CREDIT =
  'Body: "Male & Female Base Mesh Pack" by FormForge3D, CC BY 4.0 (sketchfab.com). Modified for modesty.'
