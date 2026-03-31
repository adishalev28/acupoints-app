/**
 * Pathogenesis (病機 Bing Ji) — Root Cause Diagnosis
 * Based on Master Tung / Sean Goodman's principles
 *
 * When a patient presents with symptoms, the root cause determines
 * which points to use. Same symptom, different root = different points.
 */

export interface RootCause {
  id: string
  name: string           // Hebrew display name
  nameEn: string         // English name
  organ?: string         // Primary organ involved
  phase?: string         // Five Phase element
  description: string    // Clinical description in Hebrew
  signs: string[]        // Observable signs that indicate this root
  tongue?: string        // Tongue diagnosis clue
  pulse?: string         // Pulse diagnosis clue
  handDiagnosis?: string // Master Tung hand palm diagnosis
}

export interface PathogenesisMap {
  symptom: string              // The presenting symptom (Hebrew)
  symptomEn: string
  icon: string
  question: string             // Follow-up question to ask
  matchKeywords: string[]      // Keywords to match rubric indications (broader matching)
  roots: {
    rootId: string             // Reference to RootCause.id
    pointIds: string[]         // Recommended points for this root
    daoMa?: string             // Dao Ma group name
    protocol?: string          // Clinical protocol description
    needleSide?: 'contralateral' | 'ipsilateral' | 'bilateral'
    priority: number           // 1=first choice, 2=second choice
  }[]
}

// ── Root Causes ──────────────────────────────────────────────────────────────

export const rootCauses: RootCause[] = [
  {
    id: 'lung-deficiency',
    name: 'חולשת ריאות',
    nameEn: 'Lung Qi Deficiency',
    organ: 'ריאות',
    phase: 'מתכת',
    description: 'חולשה בצ\'י של הריאות. הריאות שולטות על העור, על הפתיחה והסגירה של נקבוביות העור, ועל הירידה של הצ\'י למטה.',
    signs: ['קוצר נשימה', 'שיעול כרוני', 'קול חלש', 'הזעת יתר ספונטנית', 'נטייה להצטננות'],
    tongue: 'לשון חיוורת עם ציפוי לבן דק',
    pulse: 'דופק חלש במיקום הריאות',
    handDiagnosis: 'חיוורון באזור תנא הכף (Thenar)',
  },
  {
    id: 'kidney-deficiency',
    name: 'חולשת כליות',
    nameEn: 'Kidney Deficiency',
    organ: 'כליות',
    phase: 'מים',
    description: 'חולשה בכליות. הכליות שולטות על העצמות, על הגב התחתון, ועל ה-Jing (מהות חיונית).',
    signs: ['כאב גב תחתון כרוני', 'חולשה בברכיים', 'טינטון', 'הטלת שתן תכופה', 'עייפות כרונית'],
    tongue: 'לשון חיוורת או אדומה עם ציפוי דק',
    pulse: 'דופק חלש וטובע במיקום הכליות',
    handDiagnosis: 'כהות באזור Hypothenar',
  },
  {
    id: 'liver-stagnation',
    name: 'סטגנציית כבד',
    nameEn: 'Liver Qi Stagnation',
    organ: 'כבד',
    phase: 'עץ',
    description: 'קיפאון צ\'י הכבד. הכבד שולט על זרימה חלקה של הצ\'י, על הגידים, ועל הרגשות.',
    signs: ['כאב בצלעות', 'עצבנות', 'מתח רגשי', 'PMS', 'נדודי שינה', 'עיניים אדומות'],
    tongue: 'לשון אדומה בצדדים',
    pulse: 'דופק מתוח כמו מיתר (Wiry)',
    handDiagnosis: 'אדמומיות באזור Thenar או בין האצבעות',
  },
  {
    id: 'blood-stagnation',
    name: 'סטגנציית דם',
    nameEn: 'Blood Stasis',
    organ: 'לב',
    phase: 'אש',
    description: 'קיפאון בזרימת הדם. גורם לכאב קבוע במקום מוגדר, סגלגלות, והחמרה בלילה.',
    signs: ['כאב דוקר קבוע', 'כאב שמחמיר בלילה', 'עור סגלגל', 'ורידים בולטים'],
    tongue: 'לשון סגולה עם נקודות כהות',
    pulse: 'דופק חתוך או לא סדיר',
    handDiagnosis: 'ורידים כהים בולטים בגב היד',
  },
  {
    id: 'cold-damp',
    name: 'קור ולחות',
    nameEn: 'Cold-Dampness',
    description: 'חדירת קור ולחות חיצוניים. גורמת לכאב כבד, נוקשות, והחמרה במזג אוויר קר ולח.',
    signs: ['כאב כבד', 'נוקשות בבוקר', 'החמרה בגשם/קור', 'תחושת כבדות בגפיים'],
    tongue: 'לשון עם ציפוי לבן ודביק',
    pulse: 'דופק איטי וחלקלק',
  },
  {
    id: 'damp-heat',
    name: 'לחות-חום',
    nameEn: 'Damp-Heat',
    description: 'שילוב של לחות וחום פנימי. גורם לדלקתיות, נפיחות, אדמומיות.',
    signs: ['נפיחות אדומה', 'תחושת חום באזור', 'כבדות עם חום', 'שתן כהה'],
    tongue: 'לשון אדומה עם ציפוי צהוב ודביק',
    pulse: 'דופק מהיר וחלקלק',
  },
  {
    id: 'wind-invasion',
    name: 'חדירת רוח',
    nameEn: 'Wind Invasion',
    description: 'חדירת רוח חיצונית. גורמת לכאב נודד שמשתנה מקום, שיתוק פתאומי.',
    signs: ['כאב נודד', 'סחרחורת', 'שיתוק פתאומי', 'עוויתות', 'גרד נודד'],
    tongue: 'לשון עם ציפוי דק',
    pulse: 'דופק צף (Floating)',
    handDiagnosis: 'צבע משתנה באצבעות',
  },
  {
    id: 'spleen-deficiency',
    name: 'חולשת טחול',
    nameEn: 'Spleen Qi Deficiency',
    organ: 'טחול',
    phase: 'אדמה',
    description: 'חולשת הטחול. הטחול שולט על העיכול, שרירי הגפיים, וייצור הדם.',
    signs: ['עייפות אחרי אכילה', 'נפיחות בבטן', 'שלשולים', 'חולשה בגפיים', 'דימום חוזר'],
    tongue: 'לשון חיוורת ונפוחה עם סימני שיניים',
    pulse: 'דופק חלש',
    handDiagnosis: 'חיוורון במרכז כף היד',
  },
  {
    id: 'heart-fire',
    name: 'אש לב',
    nameEn: 'Heart Fire',
    organ: 'לב',
    phase: 'אש',
    description: 'עודף אש בלב. גורם לחרדה, נדודי שינה, אפטות, דפיקות לב.',
    signs: ['נדודי שינה', 'חרדה', 'דפיקות לב', 'אפטות בפה', 'פנים אדומות'],
    tongue: 'לשון אדומה בקצה',
    pulse: 'דופק מהיר',
  },
]

// ── Pathogenesis Maps (Symptom → Root Cause → Points) ─────────────────────────

export const pathogenesisMaps: PathogenesisMap[] = [
  {
    symptom: 'סיאטיקה',
    symptomEn: 'Sciatica',
    icon: '🦵',
    question: 'מה שורש הבעיה?',
    matchKeywords: ['סיאטיקה', 'ישיאס'],
    roots: [
      {
        rootId: 'lung-deficiency',
        pointIds: ['22.05', '22.04'],
        daoMa: 'Ling Gu + Da Bai',
        protocol: 'דיקור ב-Ling Gu 22.05 + Da Bai 22.04 ביד הנגדית. הנקודות על מרידיאן המעי הגס (מתכת) מטפלות בשורש הריאות.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'kidney-deficiency',
        pointIds: ['22.06', '77.18', '77.19', '77.21'],
        daoMa: 'Zhong Bai + Xia San Huang',
        protocol: 'דיקור ב-Zhong Bai 22.06 ביד הנגדית + Xia San Huang 77.17/19/21 ברגל. חיזוק הכליות והגב התחתון.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'blood-stagnation',
        pointIds: ['77.08', '77.09', '77.11'],
        daoMa: 'Si Hua',
        protocol: 'הקזה באזור Si Hua 77.08/09/11 לפיזור סטגנציית דם. לחפש ורידים כהים.',
        needleSide: 'ipsilateral',
        priority: 2,
      },
      {
        rootId: 'cold-damp',
        pointIds: ['88.01', '88.02', '88.03', '66.05', '66.06'],
        daoMa: 'Tong Guan/Shan/Tian',
        protocol: 'חימום וייבוש. Tong Guan/Shan/Tian 88.01-03 + Mu 66.05-06. אפשר להוסיף מוקסה.',
        needleSide: 'contralateral',
        priority: 1,
      },
    ],
  },
  {
    symptom: 'כאב גב תחתון',
    symptomEn: 'Lower Back Pain',
    icon: '🔙',
    question: 'מה אופי הכאב?',
    matchKeywords: ['כאב גב תחתון', 'לומבגו', 'כאב גב', 'כאבי גב', 'פריצת דיסק'],
    roots: [
      {
        rootId: 'kidney-deficiency',
        pointIds: ['77.18', '77.19', '77.21', '88.12', '88.13', '88.14'],
        daoMa: 'Xia San Huang + Shang San Huang',
        protocol: 'חיזוק כליות עם Xia San Huang 77.17/19/21. אפשר להוסיף Shang San Huang 88.12-14 לחיזוק הכבד (עץ מזין את המים).',
        needleSide: 'bilateral',
        priority: 1,
      },
      {
        rootId: 'blood-stagnation',
        pointIds: ['22.05', '22.04', '11.02'],
        daoMa: 'Ling Gu + Da Bai',
        protocol: 'Ling Gu 22.05 + Da Bai 22.04 ביד הנגדית. מניע דם ומשחרר חסימה. מאוד יעיל לכאב חד.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'cold-damp',
        pointIds: ['88.01', '88.02', '88.03'],
        daoMa: 'Tong Guan/Shan/Tian',
        protocol: 'מחמם ומייבש. 88.01-03 + מוקסה על הגב התחתון.',
        needleSide: 'bilateral',
        priority: 2,
      },
    ],
  },
  {
    symptom: 'כאב כתף',
    symptomEn: 'Shoulder Pain',
    icon: '💪',
    question: 'היכן הכאב בדיוק?',
    matchKeywords: ['כאב כתף', 'כאבי כתף', 'כתף קפואה', 'כתף', 'שכמה'],
    roots: [
      {
        rootId: 'wind-invasion',
        pointIds: ['66.07', '77.01', '77.02'],
        protocol: 'כאב כתף קדמי: Mu 66.07 ברגל הנגדית. כאב כתף אחורי: Zheng Jin/Zheng Zong 77.01-02.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'blood-stagnation',
        pointIds: ['22.05', '22.04', '44.06'],
        protocol: 'כתף קפואה עם סטגנציית דם: Ling Gu 22.05 + Da Bai 22.04 ביד הנגדית + Shui Jin 44.06.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'liver-stagnation',
        pointIds: ['88.12', '88.13', '88.14'],
        protocol: 'כאב כתף מסטגנציית כבד: Shang San Huang 88.12-14. הכבד שולט על הגידים.',
        needleSide: 'contralateral',
        priority: 2,
      },
    ],
  },
  {
    symptom: 'מיגרנה',
    symptomEn: 'Migraine',
    icon: '🤯',
    question: 'מה מאפיין את הכאב?',
    matchKeywords: ['מיגרנה', 'כאב ראש', 'כאבי ראש', 'כאב ראש כרוני', 'כאב ראש חד'],
    roots: [
      {
        rootId: 'liver-stagnation',
        pointIds: ['66.05', '66.06', '88.12', '88.13', '88.14'],
        daoMa: 'Mu + Shang San Huang',
        protocol: 'מיגרנה צדית (כבד-כיס מרה): Mu 66.05-06 ברגל הנגדית + Shang San Huang 88.12-14.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'blood-stagnation',
        pointIds: ['77.08', '77.09', '77.11', '1010.06'],
        daoMa: 'Si Hua',
        protocol: 'מיגרנה כרונית עם סטגנציית דם: הקזה ב-Si Hua 77.08/09/11.',
        needleSide: 'ipsilateral',
        priority: 1,
      },
      {
        rootId: 'kidney-deficiency',
        pointIds: ['77.18', '77.19', '77.21'],
        daoMa: 'Xia San Huang',
        protocol: 'מיגרנה עם כאב עורפי (כליות): Xia San Huang 77.17/19/21 לחיזוק כליות.',
        needleSide: 'bilateral',
        priority: 2,
      },
      {
        rootId: 'wind-invasion',
        pointIds: ['33.01', '33.02', '33.03'],
        protocol: 'מיגרנה חדה מחדירת רוח: נקודות אזור 33 לפיזור רוח.',
        needleSide: 'contralateral',
        priority: 2,
      },
    ],
  },
  {
    symptom: 'פציאליס',
    symptomEn: 'Facial Paralysis',
    icon: '😶',
    question: 'מה הגורם?',
    matchKeywords: ['פציאליס', 'שיתוק פנים', 'פנים מעוותים', 'בל\'ס'],
    roots: [
      {
        rootId: 'wind-invasion',
        pointIds: ['22.05', '22.04', '11.17', '33.01'],
        daoMa: 'Ling Gu + Da Bai',
        protocol: 'שיתוק פנים מחדירת רוח: Ling Gu 22.05 + Da Bai 22.04 ביד הנגדית לצד השיתוק + Mu 11.17.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'blood-stagnation',
        pointIds: ['77.08', '77.09', '77.11', '22.05', '22.04'],
        protocol: 'פציאליס כרוני עם סטגנציה: הקזה ב-Si Hua + Ling Gu/Da Bai.',
        needleSide: 'contralateral',
        priority: 1,
      },
    ],
  },
  {
    symptom: 'בעיות עיכול',
    symptomEn: 'Digestive Issues',
    icon: '🫃',
    question: 'מה הסימפטום העיקרי?',
    matchKeywords: ['עיכול', 'קיבה', 'כאבי קיבה', 'כאבי בטן', 'גסטריטיס', 'שלשול', 'עצירות', 'בחילה', 'הקאה', 'נפיחות בטן', 'רפלוקס', 'מעי', 'כאב בטן'],
    roots: [
      {
        rootId: 'spleen-deficiency',
        pointIds: ['77.08', '77.09', '77.11', '88.01', '88.02', '88.03'],
        daoMa: 'Si Hua + Tong Guan',
        protocol: 'חולשת טחול עם עייפות ונפיחות: Si Hua 77.08/09/11 (אדמה) + Tong Guan 88.01-03 (אש מזינה אדמה).',
        needleSide: 'bilateral',
        priority: 1,
      },
      {
        rootId: 'liver-stagnation',
        pointIds: ['33.11', '88.12', '88.13', '88.14'],
        protocol: 'כבד תוקף את הקיבה: Gan Men 33.11 + Shang San Huang 88.12-14 להחלקת הכבד.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'damp-heat',
        pointIds: ['77.05', '77.06', '77.07'],
        daoMa: 'San Zhong',
        protocol: 'לחות-חום במעיים: San Zhong 77.05-07 לניקוי לחות וחום.',
        needleSide: 'bilateral',
        priority: 2,
      },
    ],
  },
  {
    symptom: 'נדודי שינה',
    symptomEn: 'Insomnia',
    icon: '😴',
    question: 'מה מפריע לשינה?',
    matchKeywords: ['נדודי שינה', 'אינסומניה', 'שינה', 'קושי להירדם'],
    roots: [
      {
        rootId: 'heart-fire',
        pointIds: ['88.01', '88.02', '88.03', '22.10'],
        daoMa: 'Tong Guan/Shan/Tian',
        protocol: 'נדודי שינה מעודף חשיבה/חרדה: Tong Guan 88.01-03 (אש-לב) + Shou Jie 22.10 (מים בוקרים אש).',
        needleSide: 'bilateral',
        priority: 1,
      },
      {
        rootId: 'liver-stagnation',
        pointIds: ['88.12', '88.13', '88.14', '66.05'],
        protocol: 'נדודי שינה ממתח/כעס: Shang San Huang 88.12-14 + Mu 66.05 להחלקת הכבד.',
        needleSide: 'bilateral',
        priority: 1,
      },
      {
        rootId: 'kidney-deficiency',
        pointIds: ['77.18', '77.19', '77.21', '88.17', '88.18', '88.19'],
        daoMa: 'Xia San Huang + Si Ma',
        protocol: 'נדודי שינה מחולשת כליות: Xia San Huang 77.17/19/21 + Si Ma 88.17-19.',
        needleSide: 'bilateral',
        priority: 2,
      },
    ],
  },
  {
    symptom: 'אסתמה',
    symptomEn: 'Asthma',
    icon: '🫁',
    question: 'מה סוג האסתמה?',
    matchKeywords: ['אסתמה', 'קוצר נשימה', 'שיעול כרוני', 'ברונכיטיס'],
    roots: [
      {
        rootId: 'lung-deficiency',
        pointIds: ['77.08', '77.09', '77.11', '88.17', '88.18', '88.19'],
        daoMa: 'Si Hua + Si Ma',
        protocol: 'אסתמה מחולשת ריאות: Si Hua 77.08/09/11 (אדמה מזינה מתכת) + Si Ma 88.17-19 (חיזוק ריאות וכליות).',
        needleSide: 'bilateral',
        priority: 1,
      },
      {
        rootId: 'kidney-deficiency',
        pointIds: ['88.17', '88.18', '88.19', '77.18', '77.19', '77.21'],
        daoMa: 'Si Ma + Xia San Huang',
        protocol: 'אסתמה מחולשת כליות (קושי בשאיפה): Si Ma 88.17-19 + Xia San Huang.',
        needleSide: 'bilateral',
        priority: 1,
      },
    ],
  },
  {
    symptom: 'כאב ברכיים',
    symptomEn: 'Knee Pain',
    icon: '🦿',
    question: 'מה אופי הכאב?',
    matchKeywords: ['כאב ברכיים', 'כאבי ברכיים', 'כאב ברך', 'ברכיים', 'ברך'],
    roots: [
      {
        rootId: 'kidney-deficiency',
        pointIds: ['22.05', '22.04', '44.05'],
        daoMa: 'Ling Gu + Da Bai',
        protocol: 'כאב ברכיים כרוני מחולשת כליות: Ling Gu 22.05 + Da Bai 22.04 ביד + Hou Ji 44.05.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'cold-damp',
        pointIds: ['33.04', '33.05', '33.06'],
        protocol: 'ברכיים נוקשות מקור-לחות: Huo Ying 33.04 + Huo Zhu 33.05 + Huo Ling 33.06.',
        needleSide: 'contralateral',
        priority: 1,
      },
      {
        rootId: 'blood-stagnation',
        pointIds: ['11.02', '22.05', '22.04'],
        protocol: 'כאב ברך חד אחרי פציעה: Xiao Jian 11.02 + Ling Gu/Da Bai.',
        needleSide: 'contralateral',
        priority: 2,
      },
    ],
  },
  {
    symptom: 'בעיות עור',
    symptomEn: 'Skin Problems',
    icon: '🩹',
    question: 'מה סוג הבעיה?',
    matchKeywords: ['עור', 'אקנה', 'אקזמה', 'פסוריאזיס', 'גרד', 'אורטיקריה', 'דרמטיטיס', 'ויטיליגו'],
    roots: [
      {
        rootId: 'lung-deficiency',
        pointIds: ['22.01', '22.02', '88.17', '88.18', '88.19'],
        daoMa: 'Chong Zi/Xian + Si Ma',
        protocol: 'עור יבש/אקזמה מחולשת ריאות: Chong Zi/Xian 22.01-02 + Si Ma 88.17-19. הריאות שולטות על העור.',
        needleSide: 'bilateral',
        priority: 1,
      },
      {
        rootId: 'damp-heat',
        pointIds: ['77.08', '77.09', '77.11', '77.05', '77.06', '77.07'],
        daoMa: 'Si Hua + San Zhong',
        protocol: 'אקנה/פסוריאזיס מלחות-חום: הקזה ב-Si Hua 77.08/09/11 + San Zhong 77.05-07.',
        needleSide: 'bilateral',
        priority: 1,
      },
      {
        rootId: 'blood-stagnation',
        pointIds: ['77.08', '77.09', '77.11'],
        daoMa: 'Si Hua',
        protocol: 'בעיות עור כרוניות מסטגנציית דם: הקזה ב-Si Hua.',
        needleSide: 'bilateral',
        priority: 2,
      },
    ],
  },
]

// ── Helper Functions ──────────────────────────────────────────────────────────

export function getRootCause(rootId: string): RootCause | undefined {
  return rootCauses.find(r => r.id === rootId)
}

export function getPathogenesisForSymptom(symptom: string): PathogenesisMap | undefined {
  // First try matchKeywords (broader matching)
  const normalized = symptom.trim()
  return pathogenesisMaps.find(p =>
    p.matchKeywords.some(kw => normalized.includes(kw) || kw.includes(normalized)) ||
    normalized.includes(p.symptom) || p.symptom.includes(normalized)
  )
}

export function getAllMappedSymptoms(): string[] {
  return pathogenesisMaps.map(p => p.symptom)
}
