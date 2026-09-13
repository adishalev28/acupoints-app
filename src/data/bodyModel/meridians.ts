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

export const meridians: MeridianDef[] = [stomachMeridian]

export const BODY_MODEL_CREDIT =
  'Body: "Male & Female Base Mesh Pack" by FormForge3D, CC BY 4.0 (sketchfab.com). Modified for modesty.'
