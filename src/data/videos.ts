// ──────────────────────────────────────────────────────────────────────────
// סרטוני טיפול - הטמעות (embed) של סרטונים חיצוניים לעיון מהיר
//
// ⚠️ חשוב: אנחנו לא מורידים ולא מאחסנים את הסרטונים - רק מטמיעים קישור למקור.
//    הסרטון ממשיך "לחיות" בפייסבוק/יוטיוב, עם קרדיט ליוצר. קליל וחוקי.
//
// כדי להוסיף סרטון חדש - מוסיפים אובייקט אחד למערך למטה:
//   {
//     id: 'unique-id',                    // מזהה ייחודי (אנגלית, בלי רווחים)
//     title: 'טיפול בכאבי לסת',            // כותרת מסודרת בעברית
//     category: 'לסת ופנים',              // קטגוריה לסינון
//     platform: 'facebook',               // facebook | youtube
//     url: 'https://www.facebook.com/reel/...',  // הקישור המקורי לסרטון
//     source: 'Dr. Joe Damiani',          // שם היוצר (קרדיט)
//     description: 'שחרור שריר ...',       // (אופציונלי) תיאור קצר
//   }
// ──────────────────────────────────────────────────────────────────────────

export type VideoPlatform = 'facebook' | 'youtube'

export interface TreatmentVideo {
  id: string
  title: string
  category: string
  platform: VideoPlatform
  url: string
  source: string
  description?: string
}

export const treatmentVideos: TreatmentVideo[] = [
  {
    id: 'jaw-popping-release-muscle',
    title: 'נקישות בלסת? שחרור השריר',
    category: 'לסת',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1419363969955087/',
    source: 'Dr. Joe Damiani',
    description: 'שחרור השריר שאחראי לנקישות בלסת',
  },
]

/** רשימת הקטגוריות הקיימות (נגזרת אוטומטית מהסרטונים) */
export function getVideoCategories(videos: TreatmentVideo[]): string[] {
  return Array.from(new Set(videos.map(v => v.category)))
}
