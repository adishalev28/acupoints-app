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
  indications: string[]
  additionalInfo: string
  imageId?: string
  sources: SourceInfo[]
  daoMaGroup?: string
}
