// קבוצות נקודות דונג להדגמה במצב "שיטת דונג".
// המיקומים ב-tungPoints.ts. ההסברים הם טיוטה - עדי מאשר את הניסוח.

export type OrganId = 'lungs' | 'heart' | 'liver'

export interface TungGroup {
  id: string // מזהה הקבוצה בנתוני האפליקציה, למשל '88.17-19'
  hebrewName: string
  chineseName: string
  pointIds: string[] // מפתחות ב-tungPoints.ts
  organ: OrganId
  organName: string
  color: string
  explanation: string[]
}

export const tungGroups: TungGroup[] = [
  {
    id: '88.17-19',
    hebrewName: 'סוס דוהר',
    chineseName: '駟馬',
    pointIds: ['88.17', '88.18', '88.19'],
    organ: 'lungs',
    organName: 'הריאות',
    color: '#6fe3ff',
    explanation: [
      'הנקודות שדקרתי נמצאות בירך, אבל הן קשורות לריאות.',
      'בשיטה של מאסטר דונג כל נקודה משפיעה על אזור מסוים בגוף, גם כשהוא רחוק ממנה. לכן אני לא תמיד דוקר במקום שמטריד.',
      'קו האור מראה את החיבור בין הנקודות לאזור שהן משפיעות עליו.',
    ],
  },
  {
    id: '88.01-03',
    hebrewName: 'שלושת חודרי הרגל',
    chineseName: '通關 通山 通天',
    pointIds: ['88.01', '88.02', '88.03'],
    organ: 'heart',
    organName: 'הלב',
    color: '#ff7a8a',
    explanation: [
      'הנקודות בקדמת הירך קשורות ללב.',
      'בשיטה של מאסטר דונג משתמשים בהן בבעיות לב, למשל דפיקות לב והפרעות קצב, וגם בסחרחורת.',
      'קו האור מראה את החיבור בין הנקודות ללב.',
    ],
  },
  {
    id: '88.12-14',
    hebrewName: 'שלושה צהובים עליונים',
    chineseName: '明黃 天黃 其黃',
    pointIds: ['88.12', '88.13', '88.14'],
    organ: 'liver',
    organName: 'הכבד',
    color: '#c7a3ff',
    explanation: [
      'הנקודות בצד הפנימי של הירך קשורות לכבד.',
      'בשיטה של מאסטר דונג משתמשים בהן כשהכבד צריך תמיכה, למשל בעייפות, בסחרחורת ובכאבי עיניים.',
      'קו האור מראה את החיבור בין הנקודות לכבד.',
    ],
  },
]
