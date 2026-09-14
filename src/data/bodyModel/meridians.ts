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

export const lungMeridian: MeridianDef = {
  id: 'lung',
  hebrewName: 'ערוץ הריאות',
  chineseName: '手太陰肺經',
  color: '#6cb8ff',
  explanation: [
    'ערוץ הריאות מתחיל בחזה, מתחת לעצם הבריח, יורד לאורך הצד הפנימי של היד ומסתיים בקצה האגודל.',
    'ברפואה הסינית הוא קשור לנשימה, לעור ולהגנה של הגוף מפני הצטננות.',
    'לכן נקודות באמה ובשורש כף היד משמשות לשיעול, לגרון ולנשימה.',
  ],
  controlPoints: [
    { id: 'LU1', pinyin: 'Zhongfu', hint: 'בחזה העליון, 6 צון מקו האמצע, במרווח הבין צלעי הראשון' },
    { id: 'LU2', pinyin: 'Yunmen', hint: 'בשקע מתחת לקצה החיצוני של עצם הבריח' },
    { id: 'LU3', pinyin: 'Tianfu', hint: 'בזרוע, בצד החיצוני של שריר הדו-ראשי' },
    { id: 'LU5', pinyin: 'Chize', hint: 'בקפל המרפק, בצד האגודל של גיד הדו-ראשי' },
    { id: 'LU6', pinyin: 'Kongzui', hint: '7 צון מעל קפל שורש כף היד, בצד האגודל' },
    { id: 'LU7', pinyin: 'Lieque', hint: '1.5 צון מעל קפל שורש כף היד, מעל בליטת עצם החישור' },
    { id: 'LU9', pinyin: 'Taiyuan', hint: 'בקפל שורש כף היד, בצד האגודל, במקום הדופק' },
    { id: 'LU10', pinyin: 'Yuji', hint: 'בכרית האגודל, באמצע עצם המסרק הראשונה' },
    { id: 'LU11', pinyin: 'Shaoshang', hint: 'בפינה החיצונית של ציפורן האגודל' },
  ],
  segments: [['LU1', 'LU2', 'LU3', 'LU5', 'LU6', 'LU7', 'LU9', 'LU10', 'LU11']],
}

export const spleenMeridian: MeridianDef = {
  id: 'spleen',
  hebrewName: 'ערוץ הטחול',
  chineseName: '足太陰脾經',
  color: '#f2d45c',
  explanation: [
    'ערוץ הטחול מתחיל בבוהן הגדולה, עולה לאורך הצד הפנימי של הרגל, עובר בבטן ובצד החזה ומסתיים מתחת לבית השחי.',
    'ברפואה הסינית הטחול אחראי על העיכול ועל הפיכת המזון לאנרגיה.',
    'לכן נקודות בצד הפנימי של השוק יכולות לעזור בעיכול, בנפיחות ובעייפות.',
  ],
  controlPoints: [
    { id: 'SP1', pinyin: 'Yinbai', hint: 'בפינה הפנימית של ציפורן הבוהן הגדולה' },
    { id: 'SP3', pinyin: 'Taibai', hint: 'בצד הפנימי של כף הרגל, מאחורי מפרק הבוהן' },
    { id: 'SP4', pinyin: 'Gongsun', hint: 'בצד הפנימי של כף הרגל, לפני בסיס עצם המסרק הראשונה' },
    { id: 'SP5', pinyin: 'Shangqiu', hint: 'בשקע מלפנים ומתחת לקרסול הפנימי' },
    { id: 'SP6', pinyin: 'Sanyinjiao', hint: '3 צון מעל הקרסול הפנימי, מאחורי עצם השוק' },
    { id: 'SP9', pinyin: 'Yinlingquan', hint: 'בשקע מתחת לבליטה הפנימית של עצם השוק' },
    { id: 'SP10', pinyin: 'Xuehai', hint: '2 צון מעל הפינה הפנימית העליונה של הפיקה' },
    { id: 'SP11', pinyin: 'Jimen', hint: 'בצד הפנימי של הירך, 6 צון מעל SP10' },
    { id: 'SP12', pinyin: 'Chongmen', hint: 'בקפל המפשעה, 3.5 צון מקו האמצע' },
    { id: 'SP13', pinyin: 'Fushe', hint: '0.7 צון מעל SP12, 4 צון מקו האמצע' },
    { id: 'SP15', pinyin: 'Daheng', hint: 'בגובה הטבור, 4 צון מקו האמצע' },
    { id: 'SP16', pinyin: 'Fuai', hint: '3 צון מעל הטבור, 4 צון מקו האמצע' },
    { id: 'SP18', pinyin: 'Tianxi', hint: 'במרווח הבין צלעי הרביעי, 6 צון מקו האמצע' },
    { id: 'SP20', pinyin: 'Zhourong', hint: 'במרווח הבין צלעי השני, 6 צון מקו האמצע' },
    { id: 'SP21', pinyin: 'Dabao', hint: 'בקו האמצע של בית השחי, במרווח הבין צלעי השישי' },
  ],
  segments: [['SP1', 'SP3', 'SP4', 'SP5', 'SP6', 'SP9', 'SP10', 'SP11', 'SP12', 'SP13', 'SP15', 'SP16', 'SP18', 'SP20', 'SP21']],
}

export const meridians: MeridianDef[] = [stomachMeridian, spleenMeridian, lungMeridian, largeIntestineMeridian]

export const BODY_MODEL_CREDIT =
  'Body: "Male & Female Base Mesh Pack" by FormForge3D, CC BY 4.0 (sketchfab.com). Modified for modesty.'
