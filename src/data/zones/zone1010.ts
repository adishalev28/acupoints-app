import type { Point } from '../../types'
import { zone1010aPoints } from './zone1010a'
import { zone1010bPoints } from './zone1010b'
import { zone1010cPoints } from './zone1010c'

// Zone 1010 — 十十部位 — Head and Face (ראש ופנים)
export const zone1010Points: Point[] = [
  ...zone1010aPoints,
  ...zone1010bPoints,
  ...zone1010cPoints,
]
