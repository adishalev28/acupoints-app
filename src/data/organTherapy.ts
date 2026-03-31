/**
 * Organ Therapy Profiles (פרופילי איברים לטיפול)
 * Based on Master Tung / Sean Goodman's principles
 *
 * Central knowledge hub: maps each Zang organ to its Five Phases associations,
 * tissue type, primary Dao Ma groups, nourishing/controlling cycles,
 * named points, palm diagnosis, side rules, and treatment techniques.
 */

export interface OrganProfile {
  id: string
  hebrew: string
  phase: string
  phaseHebrew: string
  icon: string
  color: { bg: string; text: string; border: string; darkBg: string; darkText: string }

  // Wu Xing tissue association
  tissue: string
  tissueDescription: string

  // Emotion & sense organ
  emotion: string
  senseOrgan: string

  // Primary Dao Ma groups for direct treatment
  primaryDaoMa: string[]

  // Nourishing cycle (mother strengthens child)
  motherOrgan: string
  motherPhase: string
  motherDaoMa: string[]
  motherNote: string

  // Controlling cycle (controller restrains target)
  controllerOrgan: string
  controllerPhase: string
  controllerNote: string

  // Child organ (for dispersing excess via child)
  childOrgan: string
  childPhase: string
  childDaoMa: string[]
  childNote: string

  // Points whose NAME indicates this organ
  namedPoints: { id: string; name: string; reason: string }[]

  // Diagnostic points (check for sensitivity)
  diagnosticPoints: { id: string; name: string; what: string }[]

  // Palm diagnosis signs
  palmDiagnosis: {
    finger: number
    fingerName: string
    area: string
    signs: { sign: string; meaning: string }[]
  }

  // Needling side rules (based on organ location)
  sideRule: {
    hand: 'left' | 'right' | 'bilateral'
    leg: 'left' | 'right' | 'bilateral'
    note: string
  }

  // Treatment technique by condition type
  technique: {
    deficiency: string
    excess: string
    stagnation: string
  }

  // reactionAreas search keys (for finding points by innervation)
  reactionAreaKeys: string[]

  // Key clinical notes
  clinicalNotes: string[]
}

// ══════════════════════════════════════════════════════════════════════════
// TISSUE → ORGAN MAP (Wu Xing)
// ══════════════════════════════════════════════════════════════════════════

export interface TissueOption {
  id: string
  hebrew: string
  description: string
  icon: string
  organId: string
}

export const tissueOrganMap: TissueOption[] = [
  {
    id: 'bone',
    hebrew: 'עצם / מח עצם',
    description: 'שברים, אוסטאופורוזיס, כאב עצמות, בעיות שיניים',
    icon: '🦴',
    organId: 'kidneys',
  },
  {
    id: 'tendon',
    hebrew: 'גידים / רצועות',
    description: 'נקעים, דלקות גידים, נוקשות, התכווצויות',
    icon: '🦵',
    organId: 'liver',
  },
  {
    id: 'blood-vessel',
    hebrew: 'כלי דם / דם',
    description: 'אדמומיות, דפיקות, בעיות כלי דם, חום',
    icon: '❤️',
    organId: 'heart',
  },
  {
    id: 'muscle',
    hebrew: 'שרירים / בשר',
    description: 'חולשה, נפיחות, כבדות, ניוון שרירי',
    icon: '💪',
    organId: 'spleen',
  },
  {
    id: 'skin',
    hebrew: 'עור / נשימה',
    description: 'בעיות עור, אלרגיות, קוצר נשימה, הזעה',
    icon: '🫁',
    organId: 'lungs',
  },
]

// ══════════════════════════════════════════════════════════════════════════
// ORGAN PROFILES
// ══════════════════════════════════════════════════════════════════════════

export const organProfiles: OrganProfile[] = [
  // ── HEART — Fire (אש) ──────────────────────────────────────────────
  {
    id: 'heart',
    hebrew: 'לב',
    phase: 'fire',
    phaseHebrew: 'אש',
    icon: '❤️',
    color: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', darkBg: 'dark:bg-red-900/20', darkText: 'dark:text-red-300' },

    tissue: 'כלי דם',
    tissueDescription: 'הלב שולט על כלי הדם ועל זרימת הדם. בעיות של חום, אדמומיות, כלי דם בולטים',
    emotion: 'שמחה / חרדה',
    senseOrgan: 'לשון',

    primaryDaoMa: ['zu-san-tong'],
    // 88.01-03 — Tong Guan/Shan/Tian: 6 נקודות על ערוץ הלב בירך

    motherOrgan: 'liver',
    motherPhase: 'wood',
    motherDaoMa: ['shang-san-huang'],
    motherNote: 'אימא של אש = עץ. חיזוק הכבד (Shang San Huang 88.12-14) מחזק את הלב',

    controllerOrgan: 'kidneys',
    controllerPhase: 'water',
    controllerNote: 'מים שולטים על אש. לעודף אש בלב — חזק כליות (Xia San Huang)',

    childOrgan: 'spleen',
    childPhase: 'earth',
    childDaoMa: ['si-hua'],
    childNote: 'בן של אש = אדמה. פיזור עודף אש דרך הטחול (Si Hua)',

    namedPoints: [
      { id: '11.19', name: 'Xin Chang (心常) — לב תקין', reason: 'שם הנקודה מכיל "לב" — משפיעה ישירות על הלב' },
      { id: '11.12', name: 'Er Jiao (二角) — שתי פינות', reason: 'המספר 2 קשור ללב בחמש הפאזות' },
    ],

    diagnosticPoints: [
      { id: '11.19', name: 'Xin Chang', what: 'רגישות מעידה על מעורבות הלב' },
    ],

    palmDiagnosis: {
      finger: 3,
      fingerName: 'אצבע אמצעית',
      area: 'אצבע אמצעית + מרכז כף היד',
      signs: [
        { sign: 'אדמומיות בקצה האצבע האמצעית', meaning: 'עודף אש בלב' },
        { sign: 'ורידים אדומים-סגולים בכף היד', meaning: 'סטגנציית דם בלב' },
        { sign: 'ורידים כהים בולטים בגב היד', meaning: 'סטגנציית דם' },
      ],
    },

    sideRule: {
      hand: 'bilateral',
      leg: 'bilateral',
      note: 'הלב במרכז — בדרך כלל דיקור דו-צדדי. 88.01-03 כולן על ערוץ הלב בירך',
    },

    technique: {
      deficiency: 'חיזוק: 88.01-03 דיקור עמוק + חיזוק אם (כבד, Shang San Huang)',
      excess: 'פיזור אש: הקזה ב-Si Hua 77.08-11 + חיזוק מים (כליות, Xia San Huang)',
      stagnation: 'הזזת דם: הקזה באזור Si Hua — חפש ורידים כהים',
    },

    reactionAreaKeys: ['לב'],

    clinicalNotes: [
      '88.01 = מחמם עליון, 88.02 = אמצעי, 88.03 = תחתון — כל השלוש יחד מכסות את כל הגוף',
      'כאב ומחלות עם גרד ופצעים — שורש: לב',
      'נדודי שינה, חרדה, דפיקות לב — בדוק לב כשורש',
    ],
  },

  // ── LIVER — Wood (עץ) ──────────────────────────────────────────────
  {
    id: 'liver',
    hebrew: 'כבד',
    phase: 'wood',
    phaseHebrew: 'עץ',
    icon: '🌿',
    color: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', darkBg: 'dark:bg-green-900/20', darkText: 'dark:text-green-300' },

    tissue: 'גידים ורצועות',
    tissueDescription: 'הכבד שולט על הגידים. בעיות של נוקשות, התכווצויות, דלקות גידים',
    emotion: 'כעס / תסכול',
    senseOrgan: 'עיניים',

    primaryDaoMa: ['shang-san-huang'],
    // 88.12-14 — Ming Huang/Tian Huang/Qi Huang

    motherOrgan: 'kidneys',
    motherPhase: 'water',
    motherDaoMa: ['xia-san-huang'],
    motherNote: 'אימא של עץ = מים. חיזוק הכליות (Xia San Huang 77.17-21) מחזק את הכבד. שילוב קלאסי: Xia San Huang + Shang San Huang',

    controllerOrgan: 'lungs',
    controllerPhase: 'metal',
    controllerNote: 'מתכת שולטת על עץ. לעודף כבד — Si Ma או Ling Gu (ריאות/מתכת)',

    childOrgan: 'heart',
    childPhase: 'fire',
    childDaoMa: ['zu-san-tong'],
    childNote: 'בן של עץ = אש. פיזור עודף כבד דרך הלב (Zu San Tong)',

    namedPoints: [
      { id: '11.17', name: 'Mu (木) — עץ', reason: 'שם הנקודה = עץ, הפאזה של הכבד. מחט מוחלטת (72)' },
      { id: '33.11', name: 'Gan Men (肝門) — שער הכבד', reason: 'שם הנקודה מכיל "כבד" — נקודה ישירה לכבד' },
    ],

    diagnosticPoints: [
      { id: '11.17', name: 'Mu (עץ)', what: 'רגישות = מעורבות כבד. נקודה מוחלטת 72' },
      { id: '33.11', name: 'Gan Men', what: 'רגישות באזור = בעיית כבד' },
    ],

    palmDiagnosis: {
      finger: 4,
      fingerName: 'אצבע קמיצה',
      area: 'אצבע קמיצה + צד ימין של Thenar',
      signs: [
        { sign: 'שינוי צבע באצבע הקמיצה', meaning: 'מעורבות כבד' },
        { sign: 'אדמומיות באזור Thenar או בין האצבעות', meaning: 'סטגנציית צ\'י כבד' },
        { sign: 'כתם ירוק-כהה באזור כבד בכף היד', meaning: 'בעיה כרונית בכבד (מקרה קליני: שחפת)' },
      ],
    },

    sideRule: {
      hand: 'left',
      leg: 'right',
      note: 'הכבד באיבר ימין → יד שמאל (צד נגדי), רגל ימין (אותו צד). דיקור Shang San Huang בצד ימין למחלות כבד',
    },

    technique: {
      deficiency: 'חיזוק: Shang San Huang 88.12-14 + חיזוק אם (כליות, Xia San Huang)',
      excess: 'פיזור: Si Ma (מתכת שולטת על עץ) + הקזה',
      stagnation: 'החלקת צ\'י: Shang San Huang + 33.11 Gan Men + 66.05 Mu',
    },

    reactionAreaKeys: ['כבד'],

    clinicalNotes: [
      'רוח פנימית (תנועות לא רצוניות, סחרחורת, רעד) — שורש: כבד',
      'כבד שולט על הגידים — כל בעיית גידים/רצועות קשורה לכבד',
      'כבד שולט על זרימת הצ\'י — סטגנציה = כעס, מתח, PMS, כאב צלעות',
      'שילוב קלאסי: Xia San Huang (מים) + Shang San Huang (עץ) = חיזוק יין ודם כבד',
    ],
  },

  // ── SPLEEN — Earth (אדמה) ──────────────────────────────────────────
  {
    id: 'spleen',
    hebrew: 'טחול',
    phase: 'earth',
    phaseHebrew: 'אדמה',
    icon: '🟡',
    color: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', darkBg: 'dark:bg-yellow-900/20', darkText: 'dark:text-yellow-300' },

    tissue: 'שרירים ובשר',
    tissueDescription: 'הטחול שולט על השרירים ועל הבשר. חולשה, ניוון שרירי, נפיחות',
    emotion: 'דאגה / חשיבת יתר',
    senseOrgan: 'פה / שפתיים',

    primaryDaoMa: ['si-hua', 'sanzhong'],
    // Si Hua 77.08-11, San Zhong 77.05-07

    motherOrgan: 'heart',
    motherPhase: 'fire',
    motherDaoMa: ['zu-san-tong'],
    motherNote: 'אימא של אדמה = אש. חיזוק הלב (Zu San Tong 88.01-03) מחזק את הטחול',

    controllerOrgan: 'liver',
    controllerPhase: 'wood',
    controllerNote: 'עץ שולט על אדמה. כבד תוקף טחול — "כבד תוקף קיבה"',

    childOrgan: 'lungs',
    childPhase: 'metal',
    childDaoMa: ['si-ma'],
    childNote: 'בן של אדמה = מתכת. פיזור עודף טחול דרך הריאות (Si Ma)',

    namedPoints: [
      { id: '77.08', name: 'Si Hua Shang (四花上)', reason: 'ארבעת הפרחים — 4 = ריאות אבל הקבוצה שייכת לטחול/אדמה' },
    ],

    diagnosticPoints: [
      { id: '22.06', name: 'Zhong Bai', what: 'שקיעה/חלל באזור = חולשת טחול' },
    ],

    palmDiagnosis: {
      finger: 1,
      fingerName: 'אגודל',
      area: 'אגודל + מרכז כף היד',
      signs: [
        { sign: 'חיוורון במרכז כף היד', meaning: 'חולשת טחול' },
        { sign: 'נפיחות באגודל', meaning: 'לחות/טחול' },
        { sign: 'שקיעה באזור 22.06-07', meaning: 'חולשת טחול (tissue wasting)' },
      ],
    },

    sideRule: {
      hand: 'right',
      leg: 'left',
      note: 'הטחול באיבר שמאל → יד ימין (צד נגדי), רגל שמאל (אותו צד)',
    },

    technique: {
      deficiency: 'חיזוק: Si Hua 77.08-11 + חיזוק אם (לב, 88.01-03)',
      excess: 'פיזור לחות: San Zhong 77.05-07 + הקזה ב-Si Hua',
      stagnation: 'הזזת לחות: Si Hua + San Zhong יחד. הקזה אם יש ורידים כהים',
    },

    reactionAreaKeys: ['טחול'],

    clinicalNotes: [
      'Si Hua = הקבוצה החשובה ביותר לטחול: 77.08 (מחמם עליון), 77.09 (אמצעי), 77.11 (תחתון)',
      'הקזה באזור Si Hua יעילה במיוחד',
      'לחות/נפיחות — שורש: טחול',
      'עייפות אחרי אכילה, נפיחות בבטן — סימני חולשת טחול',
    ],
  },

  // ── LUNGS — Metal (מתכת) ──────────────────────────────────────────
  {
    id: 'lungs',
    hebrew: 'ריאות',
    phase: 'metal',
    phaseHebrew: 'מתכת',
    icon: '🫁',
    color: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', darkBg: 'dark:bg-slate-800/30', darkText: 'dark:text-slate-300' },

    tissue: 'עור',
    tissueDescription: 'הריאות שולטות על העור ועל נקבוביות העור. בעיות עור, הזעה, אלרגיות',
    emotion: 'עצב / אבל',
    senseOrgan: 'אף',

    primaryDaoMa: ['si-ma', 'linggu-dabai'],
    // Si Ma 88.17-19, Ling Gu + Da Bai 22.05+22.04

    motherOrgan: 'spleen',
    motherPhase: 'earth',
    motherDaoMa: ['si-hua', 'sanzhong'],
    motherNote: 'אימא של מתכת = אדמה. חיזוק הטחול (Si Hua / San Zhong) מחזק את הריאות',

    controllerOrgan: 'heart',
    controllerPhase: 'fire',
    controllerNote: 'אש שולטת על מתכת. לעודף ריאות — חזק לב (88.01-03)',

    childOrgan: 'kidneys',
    childPhase: 'water',
    childDaoMa: ['xia-san-huang', 'san-tong-shen'],
    childNote: 'בן של מתכת = מים. Tong Shen מפזר עודף ריאות דרך הכליות',

    namedPoints: [
      { id: '88.17', name: 'Si Ma (駟馬) — ארבעה סוסים', reason: 'המספר 4 קשור למתכת/ריאות בחמש הפאזות' },
      { id: '22.01', name: 'Chong Zi (重子)', reason: 'אזור תגובה ריאות — על ערוץ מתכת' },
    ],

    diagnosticPoints: [
      { id: '22.01', name: 'Chong Zi', what: 'רגישות = מעורבות ריאות' },
    ],

    palmDiagnosis: {
      finger: 2,
      fingerName: 'אצבע מורה',
      area: 'אצבע מורה + Thenar (תנא)',
      signs: [
        { sign: 'חיוורון באזור Thenar', meaning: 'חולשת ריאות' },
        { sign: 'ורידים כחולים באצבע המורה', meaning: 'קור בריאות' },
        { sign: 'יובש בעור כף היד', meaning: 'חוסר יין ריאות' },
      ],
    },

    sideRule: {
      hand: 'bilateral',
      leg: 'bilateral',
      note: 'הריאות דו-צדדיות — בדרך כלל דיקור דו-צדדי. Si Ma ו-Ling Gu ביד הנגדית לצד הכאב',
    },

    technique: {
      deficiency: 'חיזוק: Si Ma 88.17-19 + חיזוק אם (טחול, Si Hua 77.08-11)',
      excess: 'פיזור: Tong Shen 88.09-11 (מים מפזר מתכת) + הקזה',
      stagnation: 'Ling Gu 22.05 + Da Bai 22.04 — מניע צ\'י ומשחרר חסימה',
    },

    reactionAreaKeys: ['ריאה'],

    clinicalNotes: [
      'Si Ma: 88.17 אמצעי, 88.18 עליון, 88.19 תחתון — שלוש יחד = כל הריאות',
      'סיאטיקה על רקע ריאות → Ling Gu + Da Bai (בניגוד ל-22.06 Zhong Bai לסיאטיקה על רקע כליות)',
      'הריאות שולטות על העור — כל בעיית עור קשורה לריאות',
      'מקרה קליני: קושי להרים יד → Si Ma + Tong Shen (רוח-קור בריאות)',
    ],
  },

  // ── KIDNEYS — Water (מים) ──────────────────────────────────────────
  {
    id: 'kidneys',
    hebrew: 'כליות',
    phase: 'water',
    phaseHebrew: 'מים',
    icon: '💧',
    color: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', darkBg: 'dark:bg-blue-900/20', darkText: 'dark:text-blue-300' },

    tissue: 'עצמות ומח עצם',
    tissueDescription: 'הכליות שולטות על העצמות, מח העצם, והשיניים. כאבי גב תחתון, ברכיים חלשות',
    emotion: 'פחד',
    senseOrgan: 'אוזניים',

    primaryDaoMa: ['xia-san-huang', 'san-tong-shen'],
    // Xia San Huang 77.17-21, Tong Shen 88.09-11

    motherOrgan: 'lungs',
    motherPhase: 'metal',
    motherDaoMa: ['si-ma'],
    motherNote: 'אימא של מים = מתכת. חיזוק הריאות (Si Ma) מחזק את הכליות',

    controllerOrgan: 'spleen',
    controllerPhase: 'earth',
    controllerNote: 'אדמה שולטת על מים. לעודף כליות (נדיר) — חזק טחול',

    childOrgan: 'liver',
    childPhase: 'wood',
    childDaoMa: ['shang-san-huang'],
    childNote: 'בן של מים = עץ. Xia San Huang + Shang San Huang = שילוב קלאסי לחיזוק יין כבד',

    namedPoints: [
      { id: '77.18', name: 'Shen Guan (腎關) — שער הכליה', reason: 'שם הנקודה מכיל "כליה" — נקודה חיונית לכליות' },
      { id: '22.06', name: 'Zhong Bai (中白)', reason: 'סיאטיקה על רקע כליות (בניגוד ל-Ling Gu על רקע ריאות)' },
    ],

    diagnosticPoints: [
      { id: '77.18', name: 'Shen Guan', what: 'רגישות = מעורבות כליות' },
      { id: '22.08', name: 'area 22.08-09', what: 'שקיעה/חלל = חולשת כליות' },
    ],

    palmDiagnosis: {
      finger: 5,
      fingerName: 'זרת (אצבע קטנה)',
      area: 'זרת + Hypothenar',
      signs: [
        { sign: 'כהות באזור Hypothenar', meaning: 'חולשת כליות' },
        { sign: 'שקיעה באזור 22.08-09', meaning: 'חוסר כליות (tissue wasting)' },
        { sign: 'צבע כהה/שחור בזרת', meaning: 'קור-לחות בכליות' },
      ],
    },

    sideRule: {
      hand: 'bilateral',
      leg: 'bilateral',
      note: 'הכליות דו-צדדיות — בדרך כלל דיקור דו-צדדי. 77.18 Shen Guan — אסור בהריון!',
    },

    technique: {
      deficiency: 'חיזוק: Xia San Huang 77.17-21 + Shen Guan 77.18 + חיזוק אם (ריאות, Si Ma)',
      excess: 'נדיר. אם יש לחות-חום — San Zhong 77.05-07 לניקוי',
      stagnation: 'קור-לחות: 88.01-03 (חימום) + Xia San Huang + מוקסה',
    },

    reactionAreaKeys: ['כליה'],

    clinicalNotes: [
      'Xia San Huang: 77.17 שמיים, 77.19 אדמה, 77.21 אדם — שלושת הקיסרים',
      '77.18 Shen Guan — נקודה חיונית לכליות, אסור בהריון',
      'כאב גב תחתון כרוני, חולשת ברכיים, טינטון — בדוק כליות',
      'סיאטיקה על רקע כליות → 22.06 Zhong Bai (לא Ling Gu)',
      'שילוב קלאסי: Xia San Huang (מים) + Shang San Huang (עץ) = חיזוק יין ודם',
    ],
  },
]

// ══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

export function getOrganProfile(id: string): OrganProfile | undefined {
  return organProfiles.find(o => o.id === id)
}

export function getOrganByTissue(tissueId: string): OrganProfile | undefined {
  const tissue = tissueOrganMap.find(t => t.id === tissueId)
  if (!tissue) return undefined
  return getOrganProfile(tissue.organId)
}

export function getOrganByPhase(phase: string): OrganProfile | undefined {
  return organProfiles.find(o => o.phase === phase)
}
