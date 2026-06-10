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
    id: '1419363969955087',
    title: 'נקישות בלסת - שחרור השריר',
    category: 'לסת',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1419363969955087/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '2117863588786151',
    title: 'יציבה קדמית - שחרור שריר ה-SCM',
    category: 'שריר SCM ויציבה',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/2117863588786151/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1243845177851696',
    title: 'כאבי כתף - להפסיק לעסות',
    category: 'כתף וזרוע',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1243845177851696/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1642199213685733',
    title: 'תחושת אוזן סתומה ומלאה - שחרור',
    category: 'אוזן ודיגסטריק',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1642199213685733/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1277800063907287',
    title: 'יציבת ראש קדמית',
    category: 'שריר SCM ויציבה',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1277800063907287/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '798998143267660',
    title: 'כאב מקרין - לא למתוח',
    category: 'כאב כרוני ומערכת העצבים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/798998143267660/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1811866786164750',
    title: 'כאבי צוואר - לא למתוח',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1811866786164750/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1590849698820551',
    title: 'כאבי כתף וצוואר',
    category: 'כתף וזרוע',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1590849698820551/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1644529426569949',
    title: 'כאבי צוואר וסחרחורת',
    category: 'סחרחורות',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1644529426569949/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '754775526909267',
    title: 'כאב צוואר מקרין',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/754775526909267/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '846015088348396',
    title: 'טיפול בכאב ונוקשות צוואר',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/846015088348396/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1780942502720838',
    title: 'סחרחורת בתנועה',
    category: 'סחרחורות',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1780942502720838/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1411243791032130',
    title: 'כאבי צוואר - תיקון דרך מערכת העצבים',
    category: 'כאב כרוני ומערכת העצבים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1411243791032130/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '4207195016169083',
    title: 'כאב בחלק העליון של הצוואר',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/4207195016169083/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1446509273288827',
    title: 'להפסיק למתוח ככה - מתיחת צוואר וכתף',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1446509273288827/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '26298133483214186',
    title: 'שחרור הפאשיה העמוקה',
    category: 'שרירים וקשרים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/26298133483214186/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1520019419687014',
    title: 'תיקון צוואר וכתף ב-2 דקות ביום',
    category: 'כתף וזרוע',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1520019419687014/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1410086794198687',
    title: 'האמת על פיצוח הצוואר',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1410086794198687/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1983782389215044',
    title: 'כאבי צוואר וכתף - תיקון בשני שלבים',
    category: 'כתף וזרוע',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1983782389215044/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1939481916633527',
    title: 'סחרחורת וכאבי ראש - תיקון בשלושה שלבים',
    category: 'סחרחורות',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1939481916633527/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1161831552809083',
    title: 'כאב לאורך השכמה',
    category: 'שרירים וקשרים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1161831552809083/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '3314634312016854',
    title: 'כאבי ירך',
    category: 'שרירים וקשרים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/3314634312016854/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '809574078885945',
    title: 'קפיצות בלסת - תיקון בשלושה חלקים',
    category: 'לסת',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/809574078885945/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1218669427030427',
    title: 'איך לתקן כאב בשכמה',
    category: 'כתף וזרוע',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1218669427030427/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '4071793909631539',
    title: 'האם הירכיים גורמות לכאבי צוואר',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/4071793909631539/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '939168928904949',
    title: 'סחרחורת - שחרור שריר ה-SCM',
    category: 'שריר SCM ויציבה',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/939168928904949/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1426687282543320',
    title: 'תיקון צוואר צבאי - יישור עקמומיות',
    category: 'שריר SCM ויציבה',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1426687282543320/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1247923570875619',
    title: 'כאב צוואר מקרין',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1247923570875619/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1306110371286115',
    title: 'כאב ירך בהליכה',
    category: 'שרירים וקשרים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1306110371286115/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1370542517782266',
    title: 'כאב כתף',
    category: 'כתף וזרוע',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1370542517782266/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '830415636467961',
    title: 'שחרור צוואר תפוס',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/830415636467961/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1277739584545258',
    title: 'כאב בבסיס הגולגולת, כאבי ראש וערפול - פתרון דו-שלבי',
    category: 'כאבי ראש',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1277739584545258/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '889617727008014',
    title: 'תיקון כתפיים מעוגלות',
    category: 'שריר SCM ויציבה',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/889617727008014/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '4338535243133400',
    title: 'מתח בכופפי הירך הקדמיים',
    category: 'שרירים וקשרים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/4338535243133400/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '766138093016994',
    title: 'כאב ונוקשות בלסת',
    category: 'לסת',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/766138093016994/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1202083891539549',
    title: 'הקלה על חרדה - 3 טכניקות לעצב הוואגוס',
    category: 'כאב כרוני ומערכת העצבים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1202083891539549/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1243525991244562',
    title: 'נקישות בלסת - פתרון דו-שלבי',
    category: 'לסת',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1243525991244562/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '920192174264779',
    title: '3 פתרונות לכאב, מלאות וצפצוף באוזן',
    category: 'אוזן ודיגסטריק',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/920192174264779/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '902501959302106',
    title: 'תחושת משיכה בצוואר',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/902501959302106/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1586407602706090',
    title: '3 טכניקות לעצב הוואגוס לכאב צוואר ולסת',
    category: 'כאב כרוני ומערכת העצבים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1586407602706090/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1545584130316541',
    title: 'סחרחורת בתנועה',
    category: 'סחרחורות',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1545584130316541/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1603553277556284',
    title: 'תיקון הירך לשיפור היציבה',
    category: 'שריר SCM ויציבה',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1603553277556284/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1466554547767167',
    title: 'יציבה לקויה - הפסיקו למתוח',
    category: 'שריר SCM ויציבה',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1466554547767167/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '3775321235977771',
    title: 'כאב בצוואר עליון',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/3775321235977771/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1510266487105335',
    title: 'הסיבה המפתיעה לצוואר התפוס',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1510266487105335/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '25805377055787155',
    title: 'כאב בלסת - איפה ללחוץ',
    category: 'לסת',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/25805377055787155/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1744945752844968',
    title: 'ישנים על הצד - איך לבנות את הכרית המושלמת',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1744945752844968/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '2404961236674288',
    title: 'סחרחורת - בדקו את הלסת',
    category: 'סחרחורות',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/2404961236674288/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '2106862350154863',
    title: 'צוואר תפוס - שחרור הפאשיה',
    category: 'צוואר',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/2106862350154863/',
    source: 'Dr. Joe Damiani',
  },
  {
    id: '1659186888792393',
    title: 'חולשת שרירי העכוז - 4 סיבות נפוצות',
    category: 'שרירים וקשרים',
    platform: 'facebook',
    url: 'https://www.facebook.com/reel/1659186888792393/',
    source: 'Dr. Joe Damiani',
  },
]

/** רשימת הקטגוריות הקיימות (נגזרת אוטומטית מהסרטונים) */
export function getVideoCategories(videos: TreatmentVideo[]): string[] {
  return Array.from(new Set(videos.map(v => v.category)))
}
