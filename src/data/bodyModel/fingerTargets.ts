// על מה משפיעה בעיקר כל נקודת אצבע של דונג (אזור 11) - לפי ההתוויה הראשונה של דונג
// ואזור התגובה. זה מה שנדלק על הגוף כשבוחרים את הנקודה. טיוטה - עדי מאשר.

import type { OrganId } from './tungGroups'

/** אזורים שאינם אחד מחמשת האיברים, ומקבלים הילה על הגוף */
export type RegionId =
  | 'knee' | 'neck' | 'lowerBack' | 'upperBack' | 'spine' | 'head' | 'brain' | 'eyes'
  | 'throat' | 'face' | 'chest' | 'abdomen' | 'lowerAbdomen' | 'wholeBody'

export type FingerTarget = OrganId | RegionId

export const regionNames: Record<FingerTarget, string> = {
  lungs: 'הריאות', heart: 'הלב', liver: 'הכבד', kidneys: 'הכליות', spleen: 'הטחול',
  knee: 'הברכיים', neck: 'הצוואר', lowerBack: 'הגב התחתון', upperBack: 'הגב העליון',
  spine: 'עמוד השדרה', head: 'הראש', brain: 'המוח', eyes: 'העיניים', throat: 'הגרון',
  face: 'הפנים', chest: 'החזה', abdomen: 'הבטן', lowerAbdomen: 'הבטן התחתונה', wholeBody: 'כל הגוף',
}

export const fingerTargets: Record<string, FingerTarget> = {
  '11.01': 'heart', // מחלות לב, כאב בברך
  '11.02': 'throat', // יובש בגרון, דלקת שקדים
  '11.03': 'abdomen', // בקע מפשעתי, גזים, כאבי בטן
  '11.04': 'abdomen',
  '11.05': 'heart', // דפיקות לב, לחץ בחזה
  '11.06': 'lowerAbdomen', // כאב ברחם, מחזור לא סדיר
  '11.07': 'lungs', // דלקת צדר, כאבי חזה
  '11.08': 'abdomen', // דלקת מעיים, נפיחות בטנית
  '11.09': 'knee', // כאבי ברכיים
  '11.10': 'brain', // המיפלגיה
  '11.11': 'spine', // כאבי עמוד שדרה וצוואר
  '11.12': 'lowerBack', // לומבגו
  '11.13': 'liver', // אזור תגובה כיס מרה
  '11.14': 'face', // שיתוק פנים
  '11.15': 'kidneys', // חסר כליה
  '11.16': 'knee', // כאבי ברכיים
  '11.17': 'liver', // עודף אש כבד
  '11.18': 'spleen', // הגדלת טחול
  '11.19': 'heart', // דפיקות לב
  '11.20': 'liver', // דלקת כבד
  '11.21': 'abdomen', // מחזקת, כמו ST36
  '11.22': 'wholeBody', // נפיחות עצמות
  '11.23': 'eyes', // צהבת בלחמית העין
  '11.24': 'lowerAbdomen', // גינקולוגיה
  '11.25': 'face', // ריור אצל ילדים
  '11.26': 'wholeBody', // פצעים ומורסות
  '11.27': 'wholeBody', // מפרקים בכל הגוף
  BaGuan: 'brain', // שבץ מוחי
  CeJian: 'lungs', // ברונכיטיס
  ChenYinNeiYin: 'lowerAbdomen',
  DingChuan: 'lungs', // אסתמה
  FeiLing: 'lungs', // אסתמה, ברונכיטיס
  FenShui: 'kidneys', // דלקת כליות, בצקת
  FengChao: 'lowerAbdomen', // רחם
  HuoLong: 'heart', // הגדלת לב
  HuoXing: 'heart', // דפיקות לב
  JianPi: 'face', // נפיחות פנים
  KaiPi: 'spleen', // תיאבון ירוד
  MuHua: 'abdomen', // כאב ונפיחות בקיבה ובמעיים
  MuLing: 'liver', // דלקת כבד
  PianJian11: 'upperBack', // כאב גב עליון וצוואר
  QiHua: 'head', // כאב ראש
  ShuangLing: 'heart', // אזור תגובה לב
  ShaoBai: 'spine', // דורבנות בעמוד השדרה
  ShiZhen: 'neck', // נקע צוואר
  ShuiHai: 'neck', // כאב צוואר
  ShuiQing: 'head', // מיגרנה
  ShuiYao: 'head', // מיגרנה
  ShuiYuan: 'neck', // עמוד שדרה צווארי
  SanXian: 'wholeBody', // רגישות עור
  SanYang: 'lowerAbdomen',
  TongGu: 'lowerBack', // לומבגו
  TuHang: 'abdomen', // הקאות, דלקת קיבה
  TuXing: 'abdomen', // דלקת קיבה ומעיים
  XiaJian: 'heart', // דפיקות לב, לחץ בחזה
  XiLing: 'knee', // כאב ברכיים
  ZhengShui: 'lowerBack', // כאב גב תחתון
  ZhengTu: 'abdomen', // כאב בטן
  ZhuYuan: 'eyes', // גלאוקומה
  ZhiFei: 'throat', // דלקת גרון
  ZhiSanHuang: 'liver', // דלקת כבד
  ZhiWei: 'abdomen', // דלקת קיבה, כיב קיבה
}
