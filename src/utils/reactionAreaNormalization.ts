import { points as allPoints } from '../data/points'
import type { Point } from '../types'

// ───────────── Types ─────────────

export type HierarchyLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface NormalizedReactionArea {
  normalized: string
  organ: string | null
  level: HierarchyLevel | null
  sourceNote: string | null
  isAnatomical: boolean
  isSpecialGroup: boolean
}

export const HIERARCHY_LEVELS: Record<HierarchyLevel, { hebrew: string; label: string; color: string; bg: string; darkBg: string; text: string; darkText: string; border: string; darkBorder: string; dot: string }> = {
  1: { hebrew: 'ראשי', label: 'ראשי', color: 'red', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20', text: 'text-red-700', darkText: 'dark:text-red-300', border: 'border-red-200', darkBorder: 'dark:border-red-800', dot: 'bg-red-500' },
  2: { hebrew: 'עצב', label: 'עצב', color: 'orange', bg: 'bg-orange-50', darkBg: 'dark:bg-orange-900/20', text: 'text-orange-700', darkText: 'dark:text-orange-300', border: 'border-orange-200', darkBorder: 'dark:border-orange-800', dot: 'bg-orange-500' },
  3: { hebrew: 'משלים', label: 'משלים', color: 'yellow', bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-900/20', text: 'text-yellow-700', darkText: 'dark:text-yellow-300', border: 'border-yellow-200', darkBorder: 'dark:border-yellow-800', dot: 'bg-yellow-500' },
  4: { hebrew: 'ענף', label: 'ענף', color: 'green', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20', text: 'text-green-700', darkText: 'dark:text-green-300', border: 'border-green-200', darkBorder: 'dark:border-green-800', dot: 'bg-green-500' },
  5: { hebrew: 'תת-ענף', label: 'תת-ענף', color: 'blue', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', text: 'text-blue-700', darkText: 'dark:text-blue-300', border: 'border-blue-200', darkBorder: 'dark:border-blue-800', dot: 'bg-blue-500' },
  6: { hebrew: 'צומת', label: 'צומת', color: 'gray', bg: 'bg-gray-50', darkBg: 'dark:bg-gray-900/20', text: 'text-gray-600', darkText: 'dark:text-gray-400', border: 'border-gray-200', darkBorder: 'dark:border-gray-700', dot: 'bg-gray-400' },
}

// ───────────── Anatomical areas (no organ hierarchy) ─────────────

const ANATOMICAL_AREAS = new Set([
  'גב', 'חזה', 'ראש', 'ראש-צדדי', 'ראש-קדמי', 'עמוד שדרה', 'חוט שדרה',
  'סקרום', 'צלעות', 'עצם החזה', 'גרון', 'פנים', 'עיניים', 'אוזניים',
  'פה', 'שיניים', 'שפתיים', 'שד', 'דאן טיאן', 'ארבע גפיים', 'גפיים',
  'קנה נשימה', 'הפרשה', 'עורק כלילי', 'רחם', 'עצבים גולגולתיים',
  'עצב סיאטי', 'עצב פנים', 'עצב גמיש-גפיים', 'עצב מוטורי-ריאה',
  'עצב רגיש כליה', 'עצב רגיש של לב וכלי דם',
  'פה ושיניים', 'תנועת ארבע הגפיים',
  'אזור טמפורלי של הראש', 'אזור פרונטלי של הראש',
  'גרון לטרלי (בלוטת התריס)',
  'נקודות אקסטרה מחוץ לערוצים',
  'Armpit', 'Calf', 'Spine', 'Spine-Nerve',
  'Back (Hu Wen Zhi adds)',
])

// ───────────── Special group terms ─────────────

// Special group names (used in normalization)
// 'ששת-הפו', 'חמשת-הזאנג'

// ───────────── Comprehensive mapping ─────────────

const NORMALIZATION_MAP: Record<string, NormalizedReactionArea> = {}

function add(raw: string, normalized: string, organ: string | null, level: HierarchyLevel | null, sourceNote: string | null = null, isAnatomical = false, isSpecialGroup = false) {
  NORMALIZATION_MAP[raw] = { normalized, organ, level, sourceNote, isAnatomical, isSpecialGroup }
}

// --- Anatomical areas ---
ANATOMICAL_AREAS.forEach(a => add(a, a, null, null, null, true))
add('עיניים (Hu Wen Zhi)', 'עיניים', null, null, 'Hu Wen Zhi', true)
add('עמוד שדרה-ראשי', 'עמוד שדרה-ראשי', 'עמוד שדרה', 1, null, false)

// --- Special groups: Six Fu ---
add('6 Fu', 'ששת-הפו', null, null, null, false, true)
add('6 פו', 'ששת-הפו', null, null, null, false, true)
add('6 יאנגים', 'ששת-הפו', null, null, null, false, true)
add('Six Fu', 'ששת-הפו', null, null, null, false, true)
add('Six-Fu', 'ששת-הפו', null, null, null, false, true)
add('שש-Fu', 'ששת-הפו', null, null, null, false, true)
add('שש-פו', 'ששת-הפו', null, null, null, false, true)
add('שש-פו (Six-Fu)', 'ששת-הפו', null, null, null, false, true)
add('שישה פו', 'ששת-הפו', null, null, null, false, true)
add('ששת הפו', 'ששת-הפו', null, null, null, false, true)
add('ששת הפו (Hu Wen Zhi)', 'ששת-הפו', null, null, 'Hu Wen Zhi', false, true)
add('שש-פו-צומת', 'ששת-הפו-צומת', null, 6, null, false, true)
add('ששת הפו-משלים', 'ששת-הפו-משלים', null, 3, null, false, true)
add('ששת הפו-עוזר', 'ששת-הפו-משלים', null, 3, null, false, true)
add('חמשת הזאנג (5 Zang)', 'חמשת-הזאנג', null, null, null, false, true)

// --- Compound/source-annotated (skip for organ finder) ---
add('Ba Guan San/Si: עצב לב, עצב כבד, ענף משנה ריאה', 'Ba Guan San/Si', null, null, null, false, false)
add('Ba Guan Wu/Liu/Qi/Ba: עצב כליה, עצב טחול, ענף משנה ריאה, ענף משנה לב', 'Ba Guan Wu/Liu/Qi/Ba', null, null, null, false, false)
add('Ba Guan Yi/Er: עצב כליה, ענף משנה ריאה, עצב לב, עצב כבד', 'Ba Guan Yi/Er', null, null, null, false, false)
add('Chen Yin: עצב לב, ענף משנה כבד, 6 פו', 'Chen Yin', null, null, null, false, false)
add('Nei Yin: עצב כבד, 6 פו', 'Nei Yin', null, null, null, false, false)

// ─── לב (Heart) ───
add('לב', 'לב', 'לב', null)
add('לב (ראשי)', 'לב-ראשי', 'לב', 1)
add('לב-ראשי', 'לב-ראשי', 'לב', 1)
add('לב-עצב', 'לב-עצב', 'לב', 2)
add('עצב לב', 'לב-עצב', 'לב', 2)
add('עצב לב (Lai Jing-Xiong מוסיף)', 'לב-עצב', 'לב', 2, 'Lai Jing-Xiong')
add('עצב הלב', 'לב-עצב', 'לב', 2)
add('עצב-לב', 'לב-עצב', 'לב', 2)
add('לב-משלים', 'לב-משלים', 'לב', 3)
add('ענף משלים לב', 'לב-משלים', 'לב', 3)
add('לב-ענף', 'לב-ענף', 'לב', 4)
add('ענף לב', 'לב-ענף', 'לב', 4)
add('Heart-branch', 'לב-ענף', 'לב', 4)
add('לב (תת-ענף)', 'לב-תת-ענף', 'לב', 5)
add('לב-ענף-משני', 'לב-תת-ענף', 'לב', 5)
add('ענף משנה לב', 'לב-תת-ענף', 'לב', 5)
add('ענף משנה לב (Hu Wen Zhi)', 'לב-תת-ענף', 'לב', 5, 'Hu Wen Zhi')
add('Heart-sub-branch', 'לב-תת-ענף', 'לב', 5)
add('לב-הצטלבות', 'לב-צומת', 'לב', 6)
add('ענף מצטלב לב', 'לב-צומת', 'לב', 6)
add('Heart-intersection', 'לב-צומת', 'לב', 6)
add('Heart-supplementary', 'לב-משלים', 'לב', 3)

// ─── כליה (Kidney) ───
add('כליה', 'כליה', 'כליה', null)
add('כליות', 'כליה', 'כליה', null)
add('כליה-ראשי', 'כליה-ראשי', 'כליה', 1)
add('כליה-עצב', 'כליה-עצב', 'כליה', 2)
add('עצב כליה', 'כליה-עצב', 'כליה', 2)
add('עצב כליה (Hu Wen Zhi)', 'כליה-עצב', 'כליה', 2, 'Hu Wen Zhi')
add('עצב הכליה', 'כליה-עצב', 'כליה', 2)
add('עצב-כליה', 'כליה-עצב', 'כליה', 2)
add('כליה-משלים', 'כליה-משלים', 'כליה', 3)
add('ענף משלים כליה', 'כליה-משלים', 'כליה', 3)
add('Kidney-supplementary', 'כליה-משלים', 'כליה', 3)
add('כליה (ענף)', 'כליה-ענף', 'כליה', 4)
add('כליה-ענף', 'כליה-ענף', 'כליה', 4)
add('ענף כליה', 'כליה-ענף', 'כליה', 4)
add('Kidney-branch', 'כליה-ענף', 'כליה', 4)
add('Kidney-branch (Hu Wen Zhi adds)', 'כליה-ענף', 'כליה', 4, 'Hu Wen Zhi')
add('Kidney-branch (Wu Wen Zi adds)', 'כליה-ענף', 'כליה', 4, 'Wu Wen Zi')
add('כליה-ענף-משני', 'כליה-תת-ענף', 'כליה', 5)
add('ענף משנה כליה', 'כליה-תת-ענף', 'כליה', 5)
add('כליה-צומת', 'כליה-צומת', 'כליה', 6)
add('ענף מצטלב כליה', 'כליה-צומת', 'כליה', 6)

// ─── כבד (Liver) ───
add('כבד', 'כבד', 'כבד', null)
add('כבד (ראשי)', 'כבד-ראשי', 'כבד', 1)
add('כבד-עצב', 'כבד-עצב', 'כבד', 2)
add('עצב כבד', 'כבד-עצב', 'כבד', 2)
add('עצב הכבד', 'כבד-עצב', 'כבד', 2)
add('עצב-כבד', 'כבד-עצב', 'כבד', 2)
add('עצב כבד (Lai Jing-Xiong מוסיף)', 'כבד-עצב', 'כבד', 2, 'Lai Jing-Xiong')
add('כבד-משלים', 'כבד-משלים', 'כבד', 3)
add('ענף משלים כבד', 'כבד-משלים', 'כבד', 3)
add('Liver-supplementary', 'כבד-משלים', 'כבד', 3)
add('Liver-auxiliary-branch', 'כבד-משלים', 'כבד', 3)
add('ענף כבד', 'כבד-ענף', 'כבד', 4)
add('Liver-branch', 'כבד-ענף', 'כבד', 4)
add('כבד (תת-ענף)', 'כבד-תת-ענף', 'כבד', 5)
add('ענף משנה כבד', 'כבד-תת-ענף', 'כבד', 5)
add('ענף משנה כבד (Hu Wen Zhi)', 'כבד-תת-ענף', 'כבד', 5, 'Hu Wen Zhi')
add('Liver-sub-branch (Hu Wen Zhi adds)', 'כבד-תת-ענף', 'כבד', 5, 'Hu Wen Zhi')
add('כבד (צומת)', 'כבד-צומת', 'כבד', 6)
add('כבד-צומת', 'כבד-צומת', 'כבד', 6)
add('ענף מצטלב כבד', 'כבד-צומת', 'כבד', 6)

// ─── ריאה (Lung) ───
add('ריאה', 'ריאה', 'ריאה', null)
add('ריאות', 'ריאה', 'ריאה', null)
add('ריאה (ראשי)', 'ריאה-ראשי', 'ריאה', 1)
add('ריאה-ראשי', 'ריאה-ראשי', 'ריאה', 1)
add('ריאה-עצב', 'ריאה-עצב', 'ריאה', 2)
add('עצב ריאה', 'ריאה-עצב', 'ריאה', 2)
add('עצב הריאה', 'ריאה-עצב', 'ריאה', 2)
add('Lung-Nerve', 'ריאה-עצב', 'ריאה', 2)
add('עצב-ריאה (ענף)', 'ריאה-ענף', 'ריאה', 4)
add('ריאה-משלים', 'ריאה-משלים', 'ריאה', 3)
add('Lung-supplementary', 'ריאה-משלים', 'ריאה', 3)
add('ריאה-אזורי-ענף-עוזר', 'ריאה-משלים', 'ריאה', 3)
add('ריאה (ענף)', 'ריאה-ענף', 'ריאה', 4)
add('ריאה-ענף', 'ריאה-ענף', 'ריאה', 4)
add('ענף ריאה', 'ריאה-ענף', 'ריאה', 4)
add('Lung-branch', 'ריאה-ענף', 'ריאה', 4)
add('ריאה-ענף-משני', 'ריאה-תת-ענף', 'ריאה', 5)
add('ענף משנה ריאה', 'ריאה-תת-ענף', 'ריאה', 5)
add('ענף משנה ריאה (Hu Wen Zhi)', 'ריאה-תת-ענף', 'ריאה', 5, 'Hu Wen Zhi')
add('Lung-sub-branch', 'ריאה-תת-ענף', 'ריאה', 5)
add('ריאה-הצטלבות', 'ריאה-צומת', 'ריאה', 6)
add('ריאה-צומת', 'ריאה-צומת', 'ריאה', 6)
add('Lung-intersection', 'ריאה-צומת', 'ריאה', 6)
add('ענף מצטלב ריאה', 'ריאה-צומת', 'ריאה', 6)

// ─── טחול (Spleen) ───
add('טחול', 'טחול', 'טחול', null)
add('טחול-ראשי', 'טחול-ראשי', 'טחול', 1)
add('טחול-עצב', 'טחול-עצב', 'טחול', 2)
add('עצב טחול', 'טחול-עצב', 'טחול', 2)
add('עצב טחול (Lai Jing-Xiong מוסיף)', 'טחול-עצב', 'טחול', 2, 'Lai Jing-Xiong')
add('עצב הטחול', 'טחול-עצב', 'טחול', 2)
add('ענף טחול', 'טחול-ענף', 'טחול', 4)
add('טחול-צומת', 'טחול-צומת', 'טחול', 6)

// ─── קיבה (Stomach) ───
add('קיבה', 'קיבה', 'קיבה', null)
add('עצב קיבה', 'קיבה-עצב', 'קיבה', 2)
add('קיבה-משלים', 'קיבה-משלים', 'קיבה', 3)
add('קיבה-עוזר', 'קיבה-משלים', 'קיבה', 3)
add('קיבה-צומת', 'קיבה-צומת', 'קיבה', 6)

// ─── כיס מרה (Gallbladder) ───
add('כיס מרה', 'כיס מרה', 'כיס מרה', null)
add('מרה', 'כיס מרה', 'כיס מרה', null)
add('כיס מרה-ראשי', 'כיס מרה-ראשי', 'כיס מרה', 1)
add('כיס מרה-עצב', 'כיס מרה-עצב', 'כיס מרה', 2)
add('עצב כיס מרה', 'כיס מרה-עצב', 'כיס מרה', 2)
add('עצב מרה', 'כיס מרה-עצב', 'כיס מרה', 2)

// ─── מוח (Brain) ───
add('מוח', 'מוח', 'מוח', null)
add('מוח-ראשי', 'מוח-ראשי', 'מוח', 1)
add('מוח-משלים', 'מוח-משלים', 'מוח', 3)
add('מוח קטן', 'מוח קטן', 'מוח', null)
add('מוח קטן (צרבלום)', 'מוח קטן', 'מוח', null)

// ─── שלפוחית (Bladder) ───
add('שלפוחית', 'שלפוחית', 'שלפוחית', null)
add('שלפוחית השתן', 'שלפוחית', 'שלפוחית', null)
add('שלפוחית שתן', 'שלפוחית', 'שלפוחית', null)
add('שלפוחית השתן-ענף', 'שלפוחית-ענף', 'שלפוחית', 4)

// ─── תריסריון (Duodenum) ───
add('תריסריון', 'תריסריון', 'תריסריון', null)

// ───────────── Functions ─────────────

const _cache = new Map<string, NormalizedReactionArea>()

export function normalizeReactionArea(raw: string): NormalizedReactionArea {
  if (_cache.has(raw)) return _cache.get(raw)!

  const mapped = NORMALIZATION_MAP[raw]
  if (mapped) {
    _cache.set(raw, mapped)
    return mapped
  }

  // Handle new normalized format "רמה:איבר" (e.g. "ראשי:ריאה", "עצב:כליה")
  const colonMatch = raw.match(/^(ראשי|עצב|מסייע|ענף|תת-ענף|הצטלבות):(.+)$/)
  if (colonMatch) {
    const levelName = colonMatch[1]
    const organ = colonMatch[2]
    const levelMap: Record<string, HierarchyLevel> = {
      'ראשי': 1, 'עצב': 2, 'מסייע': 3, 'ענף': 4, 'תת-ענף': 5, 'הצטלבות': 6
    }
    const level = levelMap[levelName] ?? null
    const result: NormalizedReactionArea = {
      normalized: raw,
      organ,
      level,
      sourceNote: null,
      isAnatomical: false,
      isSpecialGroup: false,
    }
    _cache.set(raw, result)
    return result
  }

  // Fallback: return as-is
  const fallback: NormalizedReactionArea = {
    normalized: raw,
    organ: null,
    level: null,
    sourceNote: null,
    isAnatomical: false,
    isSpecialGroup: false,
  }
  _cache.set(raw, fallback)
  return fallback
}

export function getOrgan(raw: string): string | null {
  return normalizeReactionArea(raw).organ
}

export function getHierarchyLevel(raw: string): HierarchyLevel | null {
  return normalizeReactionArea(raw).level
}

export function getNormalizedString(raw: string): string {
  return normalizeReactionArea(raw).normalized
}

// ───────────── Organ definitions for UI ─────────────

export interface OrganDef {
  name: string
  group: 'זאנג' | 'פו' | 'מיוחד'
  icon: string
}

export const ORGAN_DEFS: OrganDef[] = [
  // Zang (Yin organs)
  { name: 'לב', group: 'זאנג', icon: '❤️' },
  { name: 'כבד', group: 'זאנג', icon: '🟤' },
  { name: 'כליה', group: 'זאנג', icon: '💧' },
  { name: 'ריאה', group: 'זאנג', icon: '🫁' },
  { name: 'טחול', group: 'זאנג', icon: '🟡' },
  // Fu (Yang organs)
  { name: 'קיבה', group: 'פו', icon: '🟠' },
  { name: 'כיס מרה', group: 'פו', icon: '🟢' },
  { name: 'שלפוחית', group: 'פו', icon: '🔵' },
  { name: 'תריסריון', group: 'פו', icon: '🟣' },
  // Special
  { name: 'מוח', group: 'מיוחד', icon: '🧠' },
  { name: 'עמוד שדרה', group: 'מיוחד', icon: '🦴' },
]

// ───────────── Aggregation ─────────────

export interface PointWithHierarchy {
  point: Point
  organ: string
  level: HierarchyLevel | null
  normalizedArea: string
  sourceNote: string | null
}

let _organPointsCache: Map<string, PointWithHierarchy[]> | null = null

function buildOrganPointsCache(): Map<string, PointWithHierarchy[]> {
  const map = new Map<string, PointWithHierarchy[]>()

  for (const point of allPoints) {
    for (const rawArea of point.reactionAreas) {
      const norm = normalizeReactionArea(rawArea)
      if (!norm.organ) continue

      const organ = norm.organ
      if (!map.has(organ)) map.set(organ, [])
      map.get(organ)!.push({
        point,
        organ,
        level: norm.level,
        normalizedArea: norm.normalized,
        sourceNote: norm.sourceNote,
      })
    }
  }

  // Sort each organ's points by level (1 first, null last)
  for (const [, points] of map) {
    points.sort((a, b) => {
      const la = a.level ?? 99
      const lb = b.level ?? 99
      if (la !== lb) return la - lb
      return a.point.id.localeCompare(b.point.id)
    })
  }

  return map
}

function getCache(): Map<string, PointWithHierarchy[]> {
  if (!_organPointsCache) {
    _organPointsCache = buildOrganPointsCache()
  }
  return _organPointsCache
}

export function getAllOrgans(): string[] {
  return [...getCache().keys()].sort()
}

export function getOrganPointCount(organ: string): number {
  // Count unique points (a point may appear multiple times with different levels)
  const points = getCache().get(organ)
  if (!points) return 0
  const uniqueIds = new Set(points.map(p => p.point.id))
  return uniqueIds.size
}

const pluralToSingular: Record<string, string> = {
  'כליות': 'כליה',
  'ריאות': 'ריאה',
}

export function getPointsByOrgan(organ: string): PointWithHierarchy[] {
  const result = getCache().get(organ) ?? []
  if (result.length > 0) return result
  const singular = pluralToSingular[organ]
  if (singular) return getCache().get(singular) ?? []
  return result
}

export function getPointsByOrgans(organs: string[]): PointWithHierarchy[] {
  const seen = new Set<string>()
  const results: PointWithHierarchy[] = []

  for (const organ of organs) {
    const points = getCache().get(organ) ?? []
    for (const p of points) {
      const key = `${p.point.id}-${p.organ}-${p.level}`
      if (!seen.has(key)) {
        seen.add(key)
        results.push(p)
      }
    }
  }

  // Sort by level then point ID
  results.sort((a, b) => {
    const la = a.level ?? 99
    const lb = b.level ?? 99
    if (la !== lb) return la - lb
    return a.point.id.localeCompare(b.point.id)
  })

  return results
}
