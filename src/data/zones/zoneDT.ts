import type { Point } from '../../types'
import { zoneDTaPoints } from './zoneDTa'
import { zoneDTbPoints } from './zoneDTb'
import { zoneDTcPoints } from './zoneDTc'

// Zone DT — 後背部位 — Back & Neck (גב וצוואר)
export const zoneDTPoints: Point[] = [
  ...zoneDTaPoints,
  ...zoneDTbPoints,
  ...zoneDTcPoints,
]
