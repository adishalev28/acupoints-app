export interface Zone {
  id: string
  name: string
  nameEn: string
}

export type PointSource = 'tung-study' | 'sean-goodman' | 'mccann-atlas' | 'other'

export interface SourceInfo {
  source: PointSource
  notes?: string
}

export interface DaoMaGroup {
  groupName: string
  groupNameChinese?: string
  pointIds: string[]
}

export interface IndicationGroup {
  category: string
  items: string[]
}

export function isGroupedIndications(
  indications: string[] | IndicationGroup[],
): indications is IndicationGroup[] {
  return indications.length > 0 && typeof indications[0] !== 'string'
}

export function flattenIndications(indications: string[] | IndicationGroup[]): string[] {
  if (!indications.length) return []
  if (isGroupedIndications(indications)) {
    return indications.flatMap(g => g.items)
  }
  return indications as string[]
}

export interface Point {
  id: string
  zone: string
  pinyinName: string
  chineseName: string
  hebrewName: string
  englishName: string
  location: string
  needling: string
  reactionAreas: string[]
  /** כל ההתוויות — של דונג ושל מטפלים מאוחרים יחד. מזין את החיפוש והרובריקה. */
  indications: string[] | IndicationGroup[]
  /**
   * ההתוויות של מאסטר דונג עצמו.
   * בספרו של שון גודמן הן **מודגשות** ומופיעות ראשונות;
   * באפליקציה של שון הן הכרטיס הראשון ברשימת ההתוויות.
   * קודמות בעדיפות קלינית על התוויות של מטפלים מאוחרים.
   * היעדר השדה = טרם אומת מול המקור. אין משמעותו "לדונג אין התוויות לנקודה".
   */
  dongIndications?: string[]
  additionalInfo: string
  imageId?: string
  sources: SourceInfo[]
  daoMaGroup?: string
  absoluteNeedle?: '72' | '32'
}
