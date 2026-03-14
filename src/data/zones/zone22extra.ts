import type { Point } from '../../types'
import { zone22ExtraAPoints } from './zone22extraA'
import { zone22ExtraBPoints } from './zone22extraB'

// Extra hand points — נקודות נוספות בכף היד (מאסטר דונג)
export const zone22ExtraPoints: Point[] = [
  ...zone22ExtraAPoints,
  ...zone22ExtraBPoints,
]
