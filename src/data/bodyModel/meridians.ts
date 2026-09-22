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

export const heartMeridian: MeridianDef = {
  id: 'heart',
  hebrewName: 'ערוץ הלב',
  chineseName: '手少陰心經',
  color: '#ff6b6b',
  explanation: [
    'ערוץ הלב מתחיל במרכז בית השחי, יורד לאורך הצד הפנימי של היד בצד הזרת, ומסתיים בקצה הזרת.',
    'ברפואה הסינית הלב קשור לא רק לפעימות ולזרימת הדם, אלא גם לשינה, לרוגע ולמצב הרוח.',
    'לכן נקודה בקפל שורש כף היד, בצד הזרת, משמשת לחרדה, לדפיקות לב ולקושי להירדם.',
  ],
  controlPoints: [
    { id: 'HT1', pinyin: 'Jiquan', hint: 'במרכז בית השחי, במקום הדופק' },
    { id: 'HT2', pinyin: 'Qingling', hint: '3 צון מעל קפל המרפק, בצד הפנימי של הזרוע' },
    { id: 'HT3', pinyin: 'Shaohai', hint: 'בקצה הפנימי של קפל המרפק, בצד הזרת' },
    { id: 'HT4', pinyin: 'Lingdao', hint: '1.5 צון מעל קפל שורש כף היד, בצד הזרת' },
    { id: 'HT5', pinyin: 'Tongli', hint: '1 צון מעל קפל שורש כף היד, בצד הזרת' },
    { id: 'HT6', pinyin: 'Yinxi', hint: '0.5 צון מעל קפל שורש כף היד, בצד הזרת' },
    { id: 'HT7', pinyin: 'Shenmen', hint: 'בקפל שורש כף היד, בצד הזרת, בשקע ליד הגיד' },
    { id: 'HT8', pinyin: 'Shaofu', hint: 'בכף היד, בין עצמות המסרק הרביעית והחמישית, איפה שהזרת נוגעת באגרוף' },
    { id: 'HT9', pinyin: 'Shaochong', hint: 'בפינת ציפורן הזרת, בצד הקמיצה' },
  ],
  segments: [['HT1', 'HT2', 'HT3', 'HT4', 'HT5', 'HT6', 'HT7', 'HT8', 'HT9']],
}

export const smallIntestineMeridian: MeridianDef = {
  id: 'smallIntestine',
  hebrewName: 'ערוץ המעי הדק',
  chineseName: '手太陽小腸經',
  color: '#ffd166',
  explanation: [
    'ערוץ המעי הדק מתחיל בקצה הזרת, עולה לאורך הצד החיצוני של היד בצד הזרת, עובר על השכמה ומסתיים בפנים, ממש לפני האוזן.',
    'הוא הערוץ השותף של ערוץ הלב: שניהם מתחילים בזרת, אחד בצד הפנימי של היד ואחד בצד החיצוני.',
    'בגלל שהוא עובר על השכמה ובצוואר, משתמשים בנקודות שלו ביד לכאבי צוואר, שכמות וכתפיים.',
  ],
  controlPoints: [
    { id: 'SI1', pinyin: 'Shaoze', hint: 'בפינת ציפורן הזרת, בצד החיצוני' },
    { id: 'SI3', pinyin: 'Houxi', hint: 'בשפת כף היד בצד הזרת, מאחורי מפרק הבסיס של הזרת' },
    { id: 'SI4', pinyin: 'Wangu', hint: 'בשפת כף היד בצד הזרת, בשקע לפני שורש כף היד' },
    { id: 'SI5', pinyin: 'Yanggu', hint: 'בשורש כף היד בצד הזרת, בשקע ליד בליטת עצם האמה' },
    { id: 'SI6', pinyin: 'Yanglao', hint: '1 צון מעל שורש כף היד, בגב האמה בצד הזרת' },
    { id: 'SI7', pinyin: 'Zhizheng', hint: '5 צון מעל שורש כף היד, בצד הזרת של האמה' },
    { id: 'SI8', pinyin: 'Xiaohai', hint: 'בגב המרפק, בשקע שבין עצם המרפק לבליטה הפנימית' },
    { id: 'SI9', pinyin: 'Jianzhen', hint: '1 צון מעל קפל בית השחי האחורי' },
    { id: 'SI10', pinyin: 'Naoshu', hint: 'מעל SI9, מתחת לרכס השכמה' },
    { id: 'SI11', pinyin: 'Tianzong', hint: 'במרכז השכמה, מתחת לרכס' },
    { id: 'SI12', pinyin: 'Bingfeng', hint: 'באמצע השכמה, מעל הרכס' },
    { id: 'SI13', pinyin: 'Quyuan', hint: 'בקצה הפנימי של השקע שמעל רכס השכמה' },
    { id: 'SI14', pinyin: 'Jianwaishu', hint: '3 צון מהקו האמצעי, בגובה החוליה הראשונה של הגב' },
    { id: 'SI15', pinyin: 'Jianzhongshu', hint: '2 צון מהקו האמצעי, בגובה החוליה הבולטת בבסיס הצוואר' },
    { id: 'SI16', pinyin: 'Tianchuang', hint: 'בצד הצוואר, בגובה בליטת הגרון, מאחורי השריר הגדול של הצוואר' },
    { id: 'SI17', pinyin: 'Tianrong', hint: 'מאחורי זווית הלסת' },
    { id: 'SI18', pinyin: 'Quanliao', hint: 'מתחת לעצם הלחי, בקו של זווית העין החיצונית' },
    { id: 'SI19', pinyin: 'Tinggong', hint: 'לפני האוזן, בשקע שנפתח כשפותחים את הפה' },
  ],
  segments: [['SI1', 'SI3', 'SI4', 'SI5', 'SI6', 'SI7', 'SI8', 'SI9', 'SI10', 'SI11', 'SI12', 'SI13', 'SI14', 'SI15', 'SI16', 'SI17', 'SI18', 'SI19']],
}

export const pericardiumMeridian: MeridianDef = {
  id: 'pericardium',
  hebrewName: 'ערוץ קרום הלב',
  chineseName: '手厥陰心包經',
  color: '#ff9ecb',
  explanation: [
    'ערוץ קרום הלב מתחיל בחזה ליד הפטמה, יורד באמצע הצד הפנימי של היד ומסתיים בקצה האצבע האמצעית.',
    'ברפואה הסינית קרום הלב הוא מעטפת שמגינה על הלב, והערוץ קשור לחזה, לבטן העליונה ולרגשות.',
    'לכן נקודה באמה, מעט מעל שורש כף היד, משמשת לבחילה, ללחץ בחזה ולמתח.',
  ],
  controlPoints: [
    { id: 'PC1', pinyin: 'Tianchi', hint: '1 צון מחוץ לפטמה, במרווח הבין צלעי הרביעי' },
    { id: 'PC2', pinyin: 'Tianquan', hint: '2 צון מתחת לקפל בית השחי הקדמי, בין שני ראשי הדו-ראשי' },
    { id: 'PC3', pinyin: 'Quze', hint: 'בקפל המרפק, בצד הזרת של גיד הדו-ראשי' },
    { id: 'PC4', pinyin: 'Ximen', hint: '5 צון מעל קפל שורש כף היד, בין שני הגידים' },
    { id: 'PC5', pinyin: 'Jianshi', hint: '3 צון מעל קפל שורש כף היד, בין שני הגידים' },
    { id: 'PC6', pinyin: 'Neiguan', hint: '2 צון מעל קפל שורש כף היד, בין שני הגידים' },
    { id: 'PC7', pinyin: 'Daling', hint: 'באמצע קפל שורש כף היד, בין שני הגידים' },
    { id: 'PC8', pinyin: 'Laogong', hint: 'במרכז כף היד, איפה שהאצבע האמצעית נוגעת באגרוף' },
    { id: 'PC9', pinyin: 'Zhongchong', hint: 'בקצה האצבע האמצעית' },
  ],
  segments: [['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6', 'PC7', 'PC8', 'PC9']],
}

export const tripleBurnerMeridian: MeridianDef = {
  id: 'tripleBurner',
  hebrewName: 'ערוץ המחמם המשולש',
  chineseName: '手少陽三焦經',
  color: '#ff8f5a',
  explanation: [
    'ערוץ המחמם המשולש מתחיל בקצה הקמיצה, עולה באמצע גב היד והאמה, עובר על הכתף ומקיף את האוזן עד קצה הגבה.',
    'ברפואה הסינית המחמם המשולש מחבר בין שלושה חלקים של הגוף - החזה, הבטן העליונה והבטן התחתונה - ואחראי על זרימת הנוזלים והחום ביניהם.',
    'בגלל שהוא מקיף את האוזן ועובר בצד הראש, משתמשים בנקודות שלו לכאבי ראש בצדדים, לבעיות אוזניים ולכאבי כתף.',
  ],
  controlPoints: [
    { id: 'TE1', pinyin: 'Guanchong', hint: 'בפינת ציפורן הקמיצה, בצד הזרת' },
    { id: 'TE2', pinyin: 'Yemen', hint: 'בגב כף היד, בקפל שבין הקמיצה לזרת' },
    { id: 'TE3', pinyin: 'Zhongzhu', hint: 'בגב כף היד, בין עצמות המסרק הרביעית והחמישית, מאחורי מפרקי הבסיס' },
    { id: 'TE4', pinyin: 'Yangchi', hint: 'בגב שורש כף היד, בשקע באמצע הקפל' },
    { id: 'TE5', pinyin: 'Waiguan', hint: '2 צון מעל שורש כף היד, באמצע גב האמה, בין שתי העצמות' },
    { id: 'TE6', pinyin: 'Zhigou', hint: '3 צון מעל שורש כף היד, באמצע גב האמה' },
    { id: 'TE8', pinyin: 'Sanyangluo', hint: '4 צון מעל שורש כף היד, באמצע גב האמה' },
    { id: 'TE10', pinyin: 'Tianjing', hint: '1 צון מעל עצם המרפק, בשקע כשהמרפק כפוף' },
    { id: 'TE13', pinyin: 'Naohui', hint: 'בגב הזרוע, 3 צון מתחת ל-TE14, בשפה האחורית של שריר הכתף' },
    { id: 'TE14', pinyin: 'Jianliao', hint: 'בשקע האחורי של הכתף, מאחורי LI15, כשמרימים את היד' },
    { id: 'TE15', pinyin: 'Tianliao', hint: 'מעל השכמה, באמצע בין ראש הכתף לבסיס הצוואר' },
    { id: 'TE17', pinyin: 'Yifeng', hint: 'מאחורי תנוך האוזן, בשקע שבין הלסת לעצם שמאחורי האוזן' },
    { id: 'TE20', pinyin: 'Jiaosun', hint: 'מעל קצה האוזן העליון, בקו השיער' },
    { id: 'TE21', pinyin: 'Ermen', hint: 'לפני האוזן, בשקע שמעל הגבשושית הקטנה שלפני תעלת האוזן' },
    { id: 'TE23', pinyin: 'Sizhukong', hint: 'בקצה החיצוני של הגבה' },
  ],
  segments: [['TE1', 'TE2', 'TE3', 'TE4', 'TE5', 'TE6', 'TE8', 'TE10', 'TE13', 'TE14', 'TE15', 'TE17', 'TE20', 'TE21', 'TE23']],
}

export const gallbladderMeridian: MeridianDef = {
  id: 'gallbladder',
  hebrewName: 'ערוץ כיס המרה',
  chineseName: '足少陽膽經',
  color: '#b9e36b',
  explanation: [
    'ערוץ כיס המרה מתחיל בזווית החיצונית של העין, מתפתל על צד הראש, יורד בצד הגוף ולאורך הצד החיצוני של הרגל, ומסתיים באצבע הרביעית בכף הרגל.',
    'ברפואה הסינית הוא קשור לכיס המרה ולכבד, לשרירים ולגידים, וגם ליכולת לקבל החלטות.',
    'לכן נקודות בכתף וברגל משמשות לכאב ראש בצדדים, לכתפיים תפוסות ולכאב בצד הירך.',
  ],
  controlPoints: [
    { id: 'GB1', pinyin: 'Tongziliao', hint: '0.5 צון מחוץ לזווית החיצונית של העין' },
    { id: 'GB2', pinyin: 'Tinghui', hint: 'בשקע לפני האוזן, מול החריץ שמתחת לבליטה הקטנה' },
    { id: 'GB8', pinyin: 'Shuaigu', hint: '1.5 צון מעל קצה האוזן' },
    { id: 'GB12', pinyin: 'Wangu', hint: 'מאחורי האוזן, בשקע מתחת ומאחורי בליטת העצם' },
    { id: 'GB14', pinyin: 'Yangbai', hint: '1 צון מעל הגבה, מעל האישון' },
    { id: 'GB15', pinyin: 'Toulinqi', hint: '0.5 צון בתוך קו השיער, מעל האישון' },
    { id: 'GB17', pinyin: 'Zhengying', hint: 'על הראש, 2.5 צון בתוך קו השיער, 2.25 צון מקו האמצע' },
    { id: 'GB19', pinyin: 'Naokong', hint: 'בגב הראש, בגובה הבליטה העורפית, 2.25 צון מקו האמצע' },
    { id: 'GB20', pinyin: 'Fengchi', hint: 'בשקע מתחת לעצם העורף, בין שני שרירי הצוואר' },
    { id: 'GB21', pinyin: 'Jianjing', hint: 'על ראש הכתף, באמצע בין הצוואר לקצה הכתף' },
    { id: 'GB22', pinyin: 'Yuanye', hint: 'בצד בית החזה, 3 צון מתחת לבית השחי' },
    { id: 'GB24', pinyin: 'Riyue', hint: 'מתחת לפטמה, במרווח הבין צלעי השביעי' },
    { id: 'GB25', pinyin: 'Jingmen', hint: 'בצד הגוף, בקצה החופשי של הצלע ה-12' },
    { id: 'GB30', pinyin: 'Huantiao', hint: 'בצד האגן, באזור הבליטה של ראש עצם הירך' },
    { id: 'GB31', pinyin: 'Fengshi', hint: 'בצד החיצוני של הירך, איפה שקצה האצבע האמצעית נוגע כשהיד צמודה לגוף' },
    { id: 'GB34', pinyin: 'Yanglingquan', hint: 'בשקע מלפנים ומתחת לראש עצם השוקית' },
    { id: 'GB39', pinyin: 'Xuanzhong', hint: '3 צון מעל הקרסול החיצוני, בקדמת עצם השוקית' },
    { id: 'GB40', pinyin: 'Qiuxu', hint: 'בשקע מלפנים ומתחת לקרסול החיצוני' },
    { id: 'GB41', pinyin: 'Zulinqi', hint: 'בגב כף הרגל, בין עצמות המסרק הרביעית והחמישית' },
    { id: 'GB44', pinyin: 'Zuqiaoyin', hint: 'בפינה החיצונית של ציפורן האצבע הרביעית ברגל' },
  ],
  segments: [
    ['GB1', 'GB2', 'GB8', 'GB12'],
    ['GB14', 'GB15', 'GB17', 'GB19', 'GB20', 'GB21', 'GB22', 'GB24', 'GB25', 'GB30',
      'GB31', 'GB34', 'GB39', 'GB40', 'GB41', 'GB44'],
  ],
}

export const liverMeridian: MeridianDef = {
  id: 'liver',
  hebrewName: 'ערוץ הכבד',
  chineseName: '足厥陰肝經',
  color: '#35c9a0',
  explanation: [
    'ערוץ הכבד מתחיל בבוהן הגדולה, עולה לאורך הצד הפנימי של הרגל, עובר במפשעה ובצד הבטן ומסתיים מתחת לחזה.',
    'ברפואה הסינית הכבד דואג לזרימה חלקה של אנרגיה ודם בגוף, ולכן הוא קשור למתח, לעצבנות ולמחזור החודשי.',
    'לכן נקודה בגב כף הרגל, בין הבוהן לאצבע השנייה, משמשת להרגעת מתח, לכאבי ראש ולכאבי מחזור.',
  ],
  controlPoints: [
    { id: 'LR1', pinyin: 'Dadun', hint: 'בפינה החיצונית של ציפורן הבוהן הגדולה' },
    { id: 'LR2', pinyin: 'Xingjian', hint: 'בין הבוהן לאצבע השנייה, בקצה העור שביניהן' },
    { id: 'LR3', pinyin: 'Taichong', hint: 'בגב כף הרגל, בשקע בין עצמות המסרק הראשונה והשנייה' },
    { id: 'LR4', pinyin: 'Zhongfeng', hint: 'לפני הקרסול הפנימי, בצד הפנימי של הגיד' },
    { id: 'LR5', pinyin: 'Ligou', hint: '5 צון מעל הקרסול הפנימי, על המשטח הפנימי של עצם השוק' },
    { id: 'LR8', pinyin: 'Ququan', hint: 'בקצה הפנימי של קפל הברך' },
    { id: 'LR9', pinyin: 'Yinbao', hint: '4 צון מעל הבליטה הפנימית של עצם הירך, בצד הפנימי של הירך' },
    { id: 'LR10', pinyin: 'Zuwuli', hint: '3 צון מתחת לגובה עצם הערווה, בצד הפנימי של הירך' },
    { id: 'LR11', pinyin: 'Yinlian', hint: '2 צון מתחת לגובה עצם הערווה, בצד הפנימי של הירך' },
    { id: 'LR12', pinyin: 'Jimai', hint: 'בקפל המפשעה, 2.5 צון מקו האמצע' },
    { id: 'LR13', pinyin: 'Zhangmen', hint: 'בצד הבטן, בקצה החופשי של הצלע ה-11' },
    { id: 'LR14', pinyin: 'Qimen', hint: 'בקו הפטמה, במרווח הבין צלעי השישי' },
  ],
  segments: [['LR1', 'LR2', 'LR3', 'LR4', 'LR5', 'LR8', 'LR9', 'LR10', 'LR11', 'LR12', 'LR13', 'LR14']],
}

export const meridians: MeridianDef[] = [
  lungMeridian,
  largeIntestineMeridian,
  stomachMeridian,
  spleenMeridian,
  heartMeridian,
  smallIntestineMeridian,
  pericardiumMeridian,
  tripleBurnerMeridian,
  gallbladderMeridian,
  liverMeridian,
]

export const BODY_MODEL_CREDIT =
  'Body: "Male & Female Base Mesh Pack" by FormForge3D, CC BY 4.0 (sketchfab.com). Modified for modesty.'
