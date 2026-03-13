import type { Point } from '../types'
import { zone11Points } from './zones/zone11'
import { zone22Points } from './zones/zone22'
import { zone11ExtraPoints } from './zones/zone11extra'
import { zone22ExtraPoints } from './zones/zone22extra'
import { zone33Points } from './zones/zone33'
import { zone33ExtraPoints } from './zones/zone33extra'
import { zone44Points } from './zones/zone44'
import { zone44ExtraPoints } from './zones/zone44extra'
import { zone55Points } from './zones/zone55'
import { zone55ExtraPoints } from './zones/zone55extra'
import { zone66Points } from './zones/zone66'
import { zone66ExtraPoints } from './zones/zone66extra'
import { zone77Points } from './zones/zone77'
import { zone88Points } from './zones/zone88'
import { zone99Points } from './zones/zone99'
import { zone1010Points } from './zones/zone1010'
import { zoneVTPoints } from './zones/zoneVT'
import { zoneDTPoints } from './zones/zoneDT'

export const points: Point[] = [
  ...zone11Points,
  ...zone11ExtraPoints,
  ...zone22Points,
  ...zone22ExtraPoints,
  ...zone33Points,
  ...zone33ExtraPoints,
  ...zone44Points,
  ...zone44ExtraPoints,
  ...zone55Points,
  ...zone55ExtraPoints,
  ...zone66Points,
  ...zone66ExtraPoints,
  ...zone77Points,
  ...zone88Points,
  ...zone99Points,
  ...zone1010Points,
  ...zoneVTPoints,
  ...zoneDTPoints,
]
