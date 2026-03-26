/**
 * Treatment Principles — Side selection and needling guidance
 * Based on Master Tung / Sean Goodman's principles
 *
 * Key principles:
 * 1. Contralateral: pain right → needle left (and vice versa)
 * 2. Upper↔Lower: pain above navel → needle legs; pain below → needle hands
 * 3. Organs: liver(R)→hand:L,leg:R | spleen(L)→hand:R,leg:L | bilateral organs→bilateral
 * 4. External expression overrides all rules
 */

import type { Point } from '../types'

export type NeedleSide = 'contralateral' | 'ipsilateral' | 'bilateral' | 'painful-side' | 'healthy-side' | 'unknown'
export type BodyLevel = 'upper' | 'lower' | 'head' | 'trunk' | 'ear'

export interface TreatmentPrinciple {
  side: NeedleSide
  sideHebrew: string
  sideEmoji: string
  level: BodyLevel
  levelHebrew: string
  levelPrinciple: string   // e.g. "כאב למעלה → דקור למטה"
  notes: string[]
}

const UPPER_ZONES = new Set(['11', '22', '33', '44'])
const LOWER_ZONES = new Set(['55', '66', '77', '88'])
const HEAD_ZONES = new Set(['99', '1010'])
const TRUNK_ZONES = new Set(['VT', 'DT'])

function getBodyLevel(zone: string): BodyLevel {
  // Handle extra zones like "88extra", "77extra"
  const baseZone = zone.replace(/extra.*/, '').replace(/[a-zA-Z]+$/, '')
  if (UPPER_ZONES.has(baseZone)) return 'upper'
  if (LOWER_ZONES.has(baseZone)) return 'lower'
  if (HEAD_ZONES.has(baseZone) || baseZone.startsWith('1010')) return 'head'
  if (TRUNK_ZONES.has(baseZone) || baseZone.startsWith('DT') || baseZone.startsWith('VT')) return 'trunk'
  return 'lower'
}

function parseSideFromNeedling(needling: string): NeedleSide {
  const text = needling.toLowerCase()

  // Check for specific patterns
  if (text.includes('דו-צדדי') || text.includes('דו צדדי') || text.includes('bilateral')) {
    return 'bilateral'
  }
  if (text.includes('בצד הנגדי') || text.includes('צד נגדי') || text.includes('contralateral')) {
    return 'contralateral'
  }
  if (text.includes('בצד הכואב') || text.includes('צד כואב')) {
    return 'painful-side'
  }
  if (text.includes('בצד הבריא') || text.includes('צד בריא')) {
    return 'healthy-side'
  }

  return 'unknown'
}

const SIDE_LABELS: Record<NeedleSide, { hebrew: string; emoji: string }> = {
  contralateral: { hebrew: 'צד נגדי', emoji: '↔️' },
  ipsilateral: { hebrew: 'אותו צד', emoji: '➡️' },
  bilateral: { hebrew: 'דו-צדדי', emoji: '⟺' },
  'painful-side': { hebrew: 'צד כואב', emoji: '🎯' },
  'healthy-side': { hebrew: 'צד בריא', emoji: '✋' },
  unknown: { hebrew: 'צד נגדי (ברירת מחדל)', emoji: '↔️' },
}

const LEVEL_LABELS: Record<BodyLevel, string> = {
  upper: 'גפיים עליונות (ידיים)',
  lower: 'גפיים תחתונות (רגליים)',
  head: 'ראש',
  trunk: 'גזע',
  ear: 'אוזניים',
}

export function getTreatmentPrinciples(point: Point): TreatmentPrinciple {
  const level = getBodyLevel(point.zone)
  const parsedSide = parseSideFromNeedling(point.needling)

  // Default side: Master Tung mostly used contralateral
  const side = parsedSide === 'unknown' ? 'contralateral' : parsedSide
  const sideInfo = SIDE_LABELS[side]

  // Build level principle based on zone
  let levelPrinciple = ''
  const notes: string[] = []

  if (level === 'upper') {
    levelPrinciple = 'נקודה בידיים ← כאב בגפיים תחתונות / גוף תחתון'
    notes.push('נקודות באזורים 11-44 מטפלות בכאב למטה מהטבור')
  } else if (level === 'lower') {
    levelPrinciple = 'נקודה ברגליים ← כאב בגפיים עליונות / גוף עליון'
    notes.push('נקודות באזורים 55-88 מטפלות בכאב למעלה מהטבור')
  } else if (level === 'head') {
    levelPrinciple = 'נקודה בראש ← טיפול מקומי / מצבים כלליים'
  } else if (level === 'trunk') {
    levelPrinciple = 'נקודה בגזע ← טיפול מקומי / איברים פנימיים'
  }

  // Add organ-specific notes based on reaction areas
  const reactionAreas = point.reactionAreas.join(' ')
  if (reactionAreas.includes('כבד')) {
    notes.push('כבד (ימין): יד שמאל, רגל ימין')
  }
  if (reactionAreas.includes('טחול')) {
    notes.push('טחול (שמאל): יד ימין, רגל שמאל')
  }
  if (reactionAreas.includes('כליה')) {
    notes.push('כליות (דו-צדדי): דקור דו-צדדי, אלא אם צד אחד מושפע')
  }
  if (reactionAreas.includes('ריאה')) {
    notes.push('ריאות (דו-צדדי): דקור דו-צדדי, אלא אם צד אחד מושפע')
  }

  // Always add the master principle
  notes.push('הביטוי החיצוני של המחלה גובר על כל הכללים')

  return {
    side,
    sideHebrew: sideInfo.hebrew,
    sideEmoji: sideInfo.emoji,
    level,
    levelHebrew: LEVEL_LABELS[level],
    levelPrinciple,
    notes,
  }
}

/**
 * Compact badge text for display in lists
 */
export function getSideBadge(point: Point): { text: string; emoji: string; color: string } {
  const principles = getTreatmentPrinciples(point)

  const colorMap: Record<NeedleSide, string> = {
    contralateral: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    ipsilateral: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    bilateral: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'painful-side': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    'healthy-side': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    unknown: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  }

  return {
    text: principles.sideHebrew,
    emoji: principles.sideEmoji,
    color: colorMap[principles.side],
  }
}
