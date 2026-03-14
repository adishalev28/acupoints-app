export interface PrincipleSection {
  heading?: string
  body: string
  listItems?: string[]
  imageUrl?: string
}

export interface Principle {
  id: string
  number: number
  title: string
  titleEn?: string
  sections: PrincipleSection[]
}

export const principles: Principle[] = [
  {
    id: '12-zones',
    number: 1,
    title: '12 אזורים',
    titleEn: '12 Zones',
    sections: [],
  },
  {
    id: 'master-tung-acupuncture',
    number: 2,
    title: 'דיקור מאסטר דונג',
    titleEn: "Master Tung's Acupuncture",
    sections: [],
  },
  {
    id: 'innovation-shen-needling',
    number: 3,
    title: 'דיקור חדשני ודיקור שן',
    titleEn: 'Innovation Needling, Shen Needling',
    sections: [],
  },
  {
    id: 'dao-ma-technique',
    number: 4,
    title: 'טכניקת דאו מא',
    titleEn: 'Dao Ma Needling Technique',
    sections: [],
  },
  {
    id: 'imaging-holographic',
    number: 5,
    title: 'הדמיה — הולוגרפית',
    titleEn: 'Imaging — Holographic',
    sections: [],
  },
  {
    id: 'palm-diagnosis',
    number: 6,
    title: 'אבחון כף יד',
    titleEn: "Palm Diagnosis",
    sections: [],
  },
  {
    id: 'reaction-areas',
    number: 7,
    title: 'אזורי תגובה',
    titleEn: 'Reaction Areas',
    sections: [],
  },
  {
    id: 'bloodletting-needle-selection',
    number: 8,
    title: 'הקזת דם ובחירת מחטים',
    titleEn: 'Bloodletting Techniques and Needle Selection',
    sections: [],
  },
  {
    id: 'reinforcing-point-selection',
    number: 9,
    title: 'עקרונות חיזוק ובחירת נקודות',
    titleEn: 'Reinforcing Principles and Point Selection',
    sections: [],
  },
  {
    id: 'strengthening-needle-selection',
    number: 10,
    title: 'טכניקות חיזוק ובחירת מחטים',
    titleEn: 'Strengthening Techniques and Needle Selection',
    sections: [],
  },
  {
    id: 'bloodletting-master-tung',
    number: 11,
    title: 'הקזת דם בדיקור מאסטר דונג',
    titleEn: "Bloodletting in Master Tung's Acupuncture",
    sections: [],
  },
  {
    id: '72-absolute-32-solution',
    number: 12,
    title: '72 נקודות מוחלטות ו-32 נקודות פתרון',
    titleEn: "Tung's 72 Absolute Points and the 32 Solution Points",
    sections: [],
  },
]
