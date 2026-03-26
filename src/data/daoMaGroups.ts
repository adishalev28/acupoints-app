/**
 * Dao Ma (倒馬) Clinical Groups
 * Based on Sean Goodman's book and Master Tung's system
 *
 * Each group maps to organ/Five Phases associations and clinical indications
 */

export interface DaoMaClinicalGroup {
  id: string
  nameHebrew: string
  namePinyin: string
  nameChinese: string
  pointIds: string[]
  organ: string              // Primary organ association
  phase: string              // Five Phases element
  phaseHebrew: string
  organHebrew: string
  tripleWarmer: 'upper' | 'middle' | 'lower' | 'all'
  tripleWarmerHebrew: string
  clinicalFocus: string[]    // Main clinical domains
  rootIndications: string[]  // When used for root (שורש) treatment
  branchIndications: string[] // When used for branch (ענף) / symptomatic treatment
  fivePhasesStrategy?: string // Five Phases treatment strategy
  keyNotes: string           // Clinical pearl / important note
  bookReference?: string     // Page/section reference from the book
}

export const daoMaClinicalGroups: DaoMaClinicalGroup[] = [
  // ══════════════════════════════════════
  //  HEART — Fire (אש)
  // ══════════════════════════════════════
  {
    id: 'zu-san-tong',
    nameHebrew: 'שלושת חודרי הרגל',
    namePinyin: 'Zú Sān Tōng',
    nameChinese: '足三通',
    pointIds: ['88.01-03'],
    organ: 'heart',
    phase: 'fire',
    phaseHebrew: 'אש',
    organHebrew: 'לב',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['מחלות לב', 'הפרעות קצב', 'סחרחורת', 'כאב בחזה'],
    rootIndications: [
      'חולשת לב (חוסר בצ\'י/יין/יאנג של הלב)',
      'סטגנציית דם בלב',
      'כאב ומחלות עם גרד ופצעים (שורש: לב)',
    ],
    branchIndications: [
      'דפיקות לב',
      'כאב בחזה',
      'אי-ספיקת לב',
      'מחלות לב ראומטיות',
      'אנמיה מוחית',
    ],
    fivePhasesStrategy: 'אימא של אש = עץ. חיזוק הכבד (Shang San Huang) מחזק את הלב',
    keyNotes: '6 נקודות על קו אמצע הירך — כולן מעצבבות את הלב. הקו משקף את ערוץ הלב בירך. 88.01 = מחמם עליון, 88.02 = אמצעי, 88.03 = תחתון.',
    bookReference: 'עמ\' 1-3, אבחון שורש: פרק 74 שאלות פשוטות',
  },

  // ══════════════════════════════════════
  //  SPLEEN — Earth (אדמה)
  // ══════════════════════════════════════
  {
    id: 'si-hua',
    nameHebrew: 'ארבעת הפרחים',
    namePinyin: 'Sì Huā',
    nameChinese: '四花',
    pointIds: ['77.08', '77.09', '77.11'],
    organ: 'spleen',
    phase: 'earth',
    phaseHebrew: 'אדמה',
    organHebrew: 'טחול',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['הפרעות טחול', 'בעיות עיכול', 'אסתמה', 'מחלות לב'],
    rootIndications: [
      'חולשת טחול',
      'לחות הגורמת לנפיחות ומלאות (שורש: טחול)',
      'הפרעות עיכול כרוניות',
    ],
    branchIndications: [
      'אסתמה',
      'כיב קיבה',
      'גסטריטיס',
      'בחילות והקאות',
      'דפיקות לב',
      'כאב כתף',
    ],
    fivePhasesStrategy: 'אימא של אדמה = אש. חיזוק הלב (Zu San Tong) מחזק את הטחול',
    keyNotes: 'Si Hua Shang (77.08) = מחמם עליון/ריאה, Si Hua Zhong (77.09) = מחמם אמצעי/טחול, Si Hua Xia (77.11) = מחמם תחתון/כליה. הקזת דם באזור יעילה במיוחד.',
    bookReference: 'נקודות ראשיות לטיפול במנגנון המחלה, עמ\' 6',
  },
  {
    id: 'sanzhong',
    nameHebrew: 'שלושת המשקלות',
    namePinyin: 'Sān Zhòng',
    nameChinese: '三重',
    pointIds: ['77.05-07'],
    organ: 'spleen',
    phase: 'earth',
    phaseHebrew: 'אדמה',
    organHebrew: 'טחול',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['לחות/נפיחות', 'גרון', 'טחול', 'שבץ מוחי'],
    rootIndications: [
      'לחות הגורמת לנפיחות ומלאות (שורש: טחול)',
      'סטגנציית דם (שורש: לב)',
      'שלבים מוקדמים של סרטן',
    ],
    branchIndications: [
      'עצם דג תקועה בגרון',
      'בעיות גרון',
      'נפיחות',
      'שבץ מוחי',
      'סרטן שד/ושט/לשון (שלבים מוקדמים)',
    ],
    keyNotes: 'מאסטר דונג השתמש בקבוצה זו לטיפול בגרון (מקרה קליני: עצם דג תקועה). חיוניים לטיפול בשבץ (Hu Wen Zhi). נדקרים יחד בטכניקת דאו-מא.',
    bookReference: 'עמ\' 5 — מקרה קליני: עצם דג תקועה בגרון',
  },

  // ══════════════════════════════════════
  //  LUNGS — Metal (מתכת)
  // ══════════════════════════════════════
  {
    id: 'si-ma',
    nameHebrew: 'ארבעה סוסים',
    namePinyin: 'Sì Mǎ',
    nameChinese: '駟馬',
    pointIds: ['88.17', '88.18', '88.19'],
    organ: 'lungs',
    phase: 'metal',
    phaseHebrew: 'מתכת',
    organHebrew: 'ריאות',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['מחלות ריאה', 'עור', 'אף', 'כתף'],
    rootIndications: [
      'חולשת ריאות',
      'רוח קור בריאות (מצב חיצוני)',
      'דיכוי צ\'י וסטגנציה (שורש: ריאות)',
    ],
    branchIndications: [
      'קושי להרים את היד',
      'סטייה בזווית הפה (שיתוק פנים)',
      'מחלות עור',
      'אסתמה',
      'נזלת',
      'כאב כתף',
    ],
    fivePhasesStrategy: 'אימא של מתכת = אדמה. חיזוק הטחול (San Zhong / Si Hua) מחזק את הריאות. בן של מתכת = מים — Tong Shen מפזר עודף ריאות.',
    keyNotes: '88.17 Sima Zhong = אמצעי (ריאה אמצעית), 88.18 Sima Shang = עליון (ריאה עליונה), 88.19 Sima Xia = תחתון (ריאה תחתונה). שלוש נקודות יחד = כל הריאות + כל המחממים. מקרה קליני: מאסטר דונג דקר Si Ma + Tong Shen לרוח-קור בריאות.',
    bookReference: 'עמ\' 5-7, מקרי קליניים: קושי להרים יד, סטייה בזווית הפה',
  },
  {
    id: 'linggu-dabai',
    nameHebrew: 'לינג גו + דא באי',
    namePinyin: 'Líng Gǔ + Dà Bái',
    nameChinese: '靈骨 + 大白',
    pointIds: ['22.05', '22.04'],
    organ: 'lungs',
    phase: 'metal',
    phaseHebrew: 'מתכת',
    organHebrew: 'ריאות',
    tripleWarmer: 'upper',
    tripleWarmerHebrew: 'מחמם עליון',
    clinicalFocus: ['סטגנציית צ\'י', 'סיאטיקה', 'כאב גב תחתון', 'ריאות'],
    rootIndications: [
      'דיכוי צ\'י וסטגנציה (שורש: ריאות)',
      'סיאטיקה על רקע חולשת ריאות',
    ],
    branchIndications: [
      'סיאטיקה',
      'כאב גב תחתון',
      'כאבי שרירים ושלד',
      'שיתוק פנים',
      'כאב ראש',
    ],
    fivePhasesStrategy: 'Ling Gu לכיוון 22.09 Wan Shun Er = גב תחתון. Ling Gu לכיוון 22.02 Chong Xian = חזה וריאות.',
    keyNotes: 'השילוב הנפוץ ביותר באקופונקטורה של מאסטר דונג. סיאטיקה על רקע ריאות (בניגוד ל-22.06 Zhong Bai לסיאטיקה על רקע כליות). זווית הדיקור משנה את ההתוויה!',
    bookReference: 'עמ\' 3-4, סיאטיקה: שני סוגים',
  },

  // ══════════════════════════════════════
  //  KIDNEYS — Water (מים)
  // ══════════════════════════════════════
  {
    id: 'xia-san-huang',
    nameHebrew: 'שלושת הקיסרים התחתונים',
    namePinyin: 'Xià Sān Huáng',
    nameChinese: '下三皇',
    pointIds: ['77.17', '77.19', '77.21'],
    organ: 'kidneys',
    phase: 'water',
    phaseHebrew: 'מים',
    organHebrew: 'כליות',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['כליות', 'יאנג צ\'י', 'עצמות', 'פוריות'],
    rootIndications: [
      'חוסר ביאנג של הכליות',
      'קור הגורם להתכווצות ומשיכה (שורש: כליות)',
      'חוסר ביין ודם של הכבד (אימא של עץ = מים)',
    ],
    branchIndications: [
      'כאב גב תחתון',
      'בעיות פוריות',
      'בעיות שתן',
      'חולשת ברכיים',
      'סוכרת',
    ],
    fivePhasesStrategy: 'אימא של מים = מתכת. חיזוק הריאות (Si Ma) מחזק את הכליות. משמש גם כאימא לחיזוק הכבד (עץ): Xia San Huang + Shang San Huang.',
    keyNotes: 'Tian Huang 77.17 = קיסר השמיים (מחמם עליון), Di Huang 77.19 = קיסר האדמה (מחמם אמצעי), Ren Huang 77.21 = קיסר האדם (מחמם תחתון). שמיים-אדמה-אדם משקפים את Dao De Jing פרק 25. Shen Guan 77.18 — נקודה ראשית נוספת לכליות.',
    bookReference: 'עמ\' 2, 6-7, מעגל חמש הפאזות',
  },
  {
    id: 'san-tong-shen',
    nameHebrew: 'שלושת החודרים',
    namePinyin: 'Tōng Shén Sān Zhēn',
    nameChinese: '通腎三針',
    pointIds: ['88.09', '88.10', '88.11'],
    organ: 'kidneys',
    phase: 'water',
    phaseHebrew: 'מים',
    organHebrew: 'כליות',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['כליות', 'יובש בפה', 'בלוטות הפרשה', 'גב תחתון'],
    rootIndications: [
      'חולשת כליות',
      'חוסר ביאנג של הכליות (משלים Si Ma לרוח-קור)',
    ],
    branchIndications: [
      'יובש בפה',
      'בעיות בלוטות הפרשה',
      'כאב גב תחתון',
      'בעיות שתן',
      'הפרעות שינה',
    ],
    fivePhasesStrategy: 'בן של מתכת = מים. כשיש עודף בריאות, Tong Shen מפזר את הריאות דרך הכליות (מעגל הזנה).',
    keyNotes: 'מקרה קליני: מאסטר דונג טיפל ביובש בפה עם 88.09 — נקודה ראשית לכליות + התוויה לפה יבש. משלים את Si Ma (ריאות) בטיפול ברוח-קור: "כשיש מחלה במערכת הריאות, Tong Shen יגביר את יעילות הטיפול".',
    bookReference: 'עמ\' 4-5, מקרי קליניים: יובש בפה, קושי להרים יד',
  },

  // ══════════════════════════════════════
  //  LIVER — Wood (עץ)
  // ══════════════════════════════════════
  {
    id: 'shang-san-huang',
    nameHebrew: 'שלושת הקיסרים העליונים',
    namePinyin: 'Shàng Sān Huáng',
    nameChinese: '上三皇',
    pointIds: ['88.12', '88.13', '88.14'],
    organ: 'liver',
    phase: 'wood',
    phaseHebrew: 'עץ',
    organHebrew: 'כבד',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['כבד', 'רוח פנימית', 'סחרחורת', 'תנועות לא רצוניות'],
    rootIndications: [
      'רוח פנימית הגורמת לתנועות לא רצוניות עם סחרחורות (שורש: כבד)',
      'חולשת כבד',
      'סטגנציית צ\'י של הכבד',
    ],
    branchIndications: [
      'סחרחורת',
      'תנועות לא רצוניות',
      'רעד',
      'בעיות עיניים',
      'כאב צלעות',
      'PMS',
    ],
    fivePhasesStrategy: 'אימא של עץ = מים. חיזוק הכליות (Xia San Huang) מחזק את הכבד. שילוב קלאסי: Xia San Huang 77.17,19,21 (מים) + Shang San Huang 88.12-14 (עץ) = חיזוק יין ודם כבד.',
    keyNotes: 'מקרה קליני: מטופל עם שחפת ישנה + קושי להרים יד. מאסטר דונג ראה כתם ירוק-כהה באזור כבד-טחול בכף היד ודקר Shang San Huang — טיפול בשורש (כבד) בלבד. קבוצת ה-Dao Ma העיקרית לרוח פנימית.',
    bookReference: 'עמ\' 2, 5, מקרה קליני: שחפת + קושי להרים יד',
  },

  // ══════════════════════════════════════
  //  Additional Important Groups
  // ══════════════════════════════════════
  {
    id: 'san-jiemei',
    nameHebrew: 'שלוש האחיות',
    namePinyin: 'Sān Jiě Mèi',
    nameChinese: '三姐妹',
    pointIds: ['88.04', '88.05', '88.06'],
    organ: 'gynecology',
    phase: 'water',
    phaseHebrew: 'מים',
    organHebrew: 'גינקולוגיה / כליות',
    tripleWarmer: 'lower',
    tripleWarmerHebrew: 'מחמם תחתון',
    clinicalFocus: ['גינקולוגיה', 'פוריות', 'מחזור', 'שתן'],
    rootIndications: ['הפרעות גינקולוגיות על רקע כליות'],
    branchIndications: [
      'כאבי מחזור',
      'אי-סדירות במחזור',
      'הפרעות פוריות',
      'דלקות דרכי שתן',
    ],
    keyNotes: 'שלוש האחיות — שם מרמז על קשר לנשיות ולמערכת הרבייה.',
  },
  {
    id: 'san-quan',
    nameHebrew: 'שלושת הכבשנים',
    namePinyin: 'Sān Quán',
    nameChinese: '三泉',
    pointIds: ['88.20', '88.21', '88.22'],
    organ: 'kidneys',
    phase: 'water',
    phaseHebrew: 'מים',
    organHebrew: 'כליות / מעיים',
    tripleWarmer: 'lower',
    tripleWarmerHebrew: 'מחמם תחתון',
    clinicalFocus: ['כליות', 'מעיים', 'גב תחתון'],
    rootIndications: ['חולשת כליות עם הפרעות עיכול'],
    branchIndications: [
      'כאב גב תחתון',
      'מעי רגיז',
      'שלשול כרוני',
    ],
    keyNotes: 'Quan (泉) = מעיין. שלושה מעיינות — מרמז על תפקוד המים (כליות) עם חיבור למעיים.',
  },
  {
    id: 'zu-jiu-li',
    nameHebrew: 'תשעת המיילים ברגל',
    namePinyin: 'Zú Jiǔ Lǐ',
    nameChinese: '足九里',
    pointIds: ['88.25', '88.26', '88.27'],
    organ: 'spleen',
    phase: 'earth',
    phaseHebrew: 'אדמה',
    organHebrew: 'טחול / קיבה',
    tripleWarmer: 'middle',
    tripleWarmerHebrew: 'מחמם אמצעי',
    clinicalFocus: ['עיכול', 'קיבה', 'כאב בטן', 'חיזוק כללי'],
    rootIndications: ['חולשת טחול/קיבה'],
    branchIndications: [
      'כאב בטן',
      'בחילות',
      'שלשול',
      'חולשה כללית',
    ],
    keyNotes: 'מקבילה ל-ST-36 Zu San Li של 14 הערוצים — אחת הנקודות החשובות ביותר לחיזוק כללי.',
  },
  {
    id: 'חודרי הרגל',
    nameHebrew: 'חודרי הרגל',
    namePinyin: 'Zú Tōng (extra)',
    nameChinese: '足通',
    pointIds: ['88-extra-tong1', '88-extra-tong2'],
    organ: 'heart',
    phase: 'fire',
    phaseHebrew: 'אש',
    organHebrew: 'לב',
    tripleWarmer: 'all',
    tripleWarmerHebrew: 'כל שלושת המחממים',
    clinicalFocus: ['לב', 'מחלות לב', 'סחרחורת'],
    rootIndications: ['מחלות לב כרוניות'],
    branchIndications: [
      'מחלות לב',
      'דפיקות לב',
      'סחרחורת',
    ],
    keyNotes: 'נקודות אקסטרה באזור 88 — חלק מקבוצת החודרות המורחבת (6 נקודות כולל 88.01-03). כל הקבוצה על ערוץ הלב.',
  },
]

/**
 * Organ → Dao Ma groups mapping for quick lookup
 */
export const organToDaoMa: Record<string, string[]> = {
  heart: ['zu-san-tong', 'חודרי הרגל'],
  spleen: ['si-hua', 'sanzhong', 'zu-jiu-li'],
  lungs: ['si-ma', 'linggu-dabai'],
  kidneys: ['xia-san-huang', 'san-tong-shen', 'san-jiemei', 'san-quan'],
  liver: ['shang-san-huang'],
}

/**
 * Five Phases nourishing cycle (母子) for treatment strategy
 */
export const fivePhasesNourishing: Record<string, { mother: string; child: string; motherHebrew: string; childHebrew: string }> = {
  wood: { mother: 'water', child: 'fire', motherHebrew: 'מים (כליות)', childHebrew: 'אש (לב)' },
  fire: { mother: 'wood', child: 'earth', motherHebrew: 'עץ (כבד)', childHebrew: 'אדמה (טחול)' },
  earth: { mother: 'fire', child: 'metal', motherHebrew: 'אש (לב)', childHebrew: 'מתכת (ריאות)' },
  metal: { mother: 'earth', child: 'water', motherHebrew: 'אדמה (טחול)', childHebrew: 'מים (כליות)' },
  water: { mother: 'metal', child: 'wood', motherHebrew: 'מתכת (ריאות)', childHebrew: 'עץ (כבד)' },
}
