# תוכנית: מערכת אבחון וטיפול מתקדמת

## מה נבנה

**דף חדש `/smart-diagnosis`** — "אבחון חכם" שמחליף את האבחון הקליני הנוכחי.
שני מסלולים מאותו דף:

### מסלול א׳: "אני יודע מה האיבר" (בחירה ישירה)
### מסלול ב׳: "עזור לי לזהות" (שאלון מודרך)

---

## מסלול א׳ — בחירה ישירה של איבר

**שלב 1:** המשתמש בוחר איבר (לב / כבד / טחול / ריאות / כליות)

**שלב 2:** המערכת מציגה נקודות מומלצות **בהיררכיה**:

### סדר עדיפויות להצגת נקודות:

**1. קומבינציות דאו-מא של האיבר** (עדיפות ראשונה)
- לב → 88.01-03 (Tong Guan), Zu San Tong
- טחול → 77.08-11 (Si Hua), 77.05-07 (San Zhong)
- ריאות → 88.17-19 (Si Ma), 22.05+22.04 (Ling Gu + Da Bai)
- כליות → 77.18-21 (Xia San Huang), Tong Shen
- כבד → 88.12-14 (Shang San Huang)
- מקור: `organToDaoMa` + `daoMaClinicalGroups`

**2. נקודות עם עצבוב ראשי של האיבר** (`ראשי:X` ב-reactionAreas)
- למשל לכבד: נקודות עם `ראשי:כבד`
- 24 נקודות ראשיות קיימות במערכת

**3. נקודות עם עצבוב עצב של האיבר** (`עצב:X`)
- 150 נקודות עם רמת "עצב"

**4. נקודות ששמן מעיד על האיבר**
- 11.17 Mu (עץ) → כבד
- 11.19 Xin Chang (לב תקין) → לב
- Si Ma (ארבעה סוסים, 4 = ריאות)
- 11.12 Er Jiao (שתי פינות, 2 = לב)
- מקור: מיפוי ידני חדש `pointNameOrganMap`

**5. נקודות מחזקות דרך מעגל ההזנה (Mother-Child)**
- כליות חלשות? → חזק מתכת (ריאות = אם) דרך Si Ma
- כבד חלש? → חזק מים (כליות = אם) דרך Xia San Huang
- מקור: `fivePhasesNourishing`

**6. 72 מחטים מוחלטות + 32 נותנות פתרון**
- תמיד מודגשות עם באדג׳ מיוחד

### שלב 3: בחירת צד דיקור
- שאלה: "באיזה צד הבעיה?" (ימין / שמאל / דו-צדדי)
- חישוב אוטומטי לפי:
  - כבד (ימין) → יד שמאל, רגל ימין
  - טחול (שמאל) → יד ימין, רגל שמאל
  - כליות/ריאות (דו-צדדי) → דו-צדדי
- מקור: `treatmentPrinciples.ts`

### שלב 4: פרוטוקול טיפול
- הצגת: נקודות + צד + עומק + טכניקה + אזהרות
- דגש על מעגל הזנה (חיזוק) או מעגל שליטה (פיזור)
- המלצה: הקזה במידת הצורך

---

## מסלול ב׳ — שאלון מודרך ("עזור לי למצוא")

### שלב 1: מה הבעיה? (סימפטום)
- שדה חיפוש חופשי (כמו היום)
- או בחירה מקטגוריות

### שלב 2: באיזו רקמה הבעיה? (Wu Xing Tissue)
- **עצם / מח עצם** → כליות (מים)
- **גידים / רצועות** → כבד (עץ)
- **כלי דם / אדמומיות** → לב (אש)
- **שרירים / בשר** → טחול (אדמה)
- **עור / נשימה** → ריאות (מתכת)
- כפתורי בחירה עם אייקונים ותיאור

### שלב 3: איפה הכאב? (מיקום + הדמיה)
- עליון / תחתון (לקביעת זונה)
- ימין / שמאל / דו-צדדי (לקביעת צד)
- מקור: `mirrorMap.ts` + עקרונות הדמיה

### שלב 4 (אופציונלי): אבחון כף יד
- תמונה של כף היד עם אזורים מסומנים
- שאלה: "האם אתה רואה שינויים באזורים הבאים?"
  - אגודל (טחול) — צבע חיוור?
  - אצבע 2 (ריאות) — ורידים כחולים?
  - אצבע 3 (לב) — אדמומיות?
  - אצבע 4 (כבד) — שינוי צבע?
  - אצבע 5 (כליות) — כהות?
- Thenar חיוור → חולשת ריאות
- Hypothenar כהה → חולשת כליות
- ורידים בולטים בגב היד → סטגנציית דם
- אם לא רואים כלום → דלג (לא משפיע על האבחנה)
- מקור: `principles.ts` section 6

### שלב 5: שורש המחלה (פתוגנזיס)
- כמו היום (חולשת ריאות / סטגנציית דם / קור-לחות וכו׳)
- מוצג רק אם יש מפה רלוונטית
- מקור: `pathogenesis.ts`

### שלב 6: תוצאות
- נקודות ממויינות לפי ההיררכיה של מסלול א׳
- + עצבוב הדדי (reciprocal innervation) כבונוס
  - למשל: 77.01 ↔ Shiba Xing DT (שניהם עצבוב מוח)
- + נקודות אימות דיאגנוסטיות ("בדוק רגישות ב-X")

---

## קבצים חדשים

### 1. `src/data/organTherapy.ts` (חדש)
מיפוי מרכזי של כל הידע:

```typescript
interface OrganProfile {
  id: string                    // 'liver' | 'heart' | 'spleen' | 'lungs' | 'kidneys'
  hebrew: string                // 'כבד'
  phase: string                 // 'wood'
  phaseHebrew: string           // 'עץ'
  tissue: string                // 'גידים ורצועות'
  emotion: string               // 'כעס'
  icon: string                  // '🟤'

  // Primary Dao Ma groups for this organ
  primaryDaoMa: string[]        // ['shang-san-huang']

  // Nourishing: which organ strengthens this one (mother)
  motherOrgan: string           // 'kidneys'
  motherDaoMa: string[]         // ['xia-san-huang']

  // Controlling: which organ controls excess
  controllerOrgan: string       // 'lungs' (metal controls wood)

  // Points whose NAME indicates this organ
  namedPoints: string[]         // ['11.17'] (Mu = wood)

  // Diagnostic points (check sensitivity)
  diagnosticPoints: string[]    // reaction area validation points

  // Palm diagnosis signs
  palmSigns: {
    finger: number              // 4 (ring finger for liver)
    area: string                // 'צד ימין של Thenar'
    signs: string[]             // ['אדמומיות', 'ורידים']
  }

  // Bie Ge (cross-organ) relationships
  bieGe: { organ: string; points: string[] }[]

  // Needling side rules
  sideRule: {
    hand: 'left' | 'right' | 'bilateral'
    leg: 'left' | 'right' | 'bilateral'
  }

  // Default technique recommendations
  technique: {
    excess: string              // 'הקזה / פיזור'
    deficiency: string          // 'חיזוק / מעגל הזנה'
  }
}
```

### 2. `src/data/tissueOrganMap.ts` (חדש)
מיפוי רקמה → איבר (Wu Xing)

### 3. `src/data/reciprocalInnervation.ts` (חדש)
מיפוי השפעה הדדית בין נקודות עם אותו עצבוב

### 4. `src/pages/SmartDiagnosis.tsx` (חדש)
הדף עצמו — wizard מתקדם

---

## קבצים קיימים שישתנו

- `src/pages/Home.tsx` — הלינק ישתנה מ-/diagnosis ל-/smart-diagnosis
- `src/App.tsx` — route חדש
- `src/data/pathogenesis.ts` — ללא שינוי (יובא כ-is)
- `src/utils/treatmentPrinciples.ts` — ללא שינוי
- `src/data/daoMaGroups.ts` — ללא שינוי

---

## סדר עבודה

1. **בניית `organTherapy.ts`** — ליבת הידע (5 פרופילי איברים)
2. **בניית `SmartDiagnosis.tsx`** — UI של שני המסלולים
3. **חיבור לנתונים קיימים** — reactionAreas, daoMa, pathogenesis
4. **אבחון כף יד** — אופציונלי עם תמונה
5. **בדיקה ושיפור** — לפי פידבק

---

## מה לא ייבנה (כרגע)

- אבחון לשון / דופק (לא פרקטי באפליקציה)
- שמירת היסטוריית אבחונים (אפשר בעתיד)
- חיבור לטיפולון (אפשר בעתיד)
