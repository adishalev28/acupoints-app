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

export interface VideoCategory {
  /** חייב להתאים בדיוק ל-category של הסרטונים */
  name: string
  emoji: string
  description: string
}

/** רשימת הקטגוריות הקבועה - מקור האמת לתפריט הקטגוריות */
export const videoCategories: VideoCategory[] = [
  { name: 'לסת', emoji: '🦷', description: 'כאבי לסת, נקישות, מתח לסת-גרון' },
  { name: 'צוואר', emoji: '🦴', description: 'כאבי צוואר, צוואר תפוס, תרגילי תנועה' },
  { name: 'סחרחורות', emoji: '💫', description: 'סחרחורת וחוסר יציבות' },
  { name: 'כתף וזרוע', emoji: '💪', description: 'כאב כתף וזרוע מוקרן' },
  { name: 'כאבי ראש', emoji: '🤕', description: 'מיגרנות וכאבי ראש כרוניים' },
  { name: 'שרירים וקשרים', emoji: '🔴', description: 'מתח שרירי וקשרים (trigger points)' },
  { name: 'אוזן ודיגסטריק', emoji: '👂', description: 'כאב אוזן ושריר הדיגסטריק' },
  { name: 'שריר SCM ויציבה', emoji: '🎯', description: 'שחרור SCM, יציבה ונשימה' },
  { name: 'כאב כרוני ומערכת העצבים', emoji: '🧠', description: 'כאב מתמשך וויסות עצבי' },
]

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
