export interface Zone {
  id: string
  name: string
  nameEn: string
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
}
