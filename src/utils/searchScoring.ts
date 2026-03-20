import type { Point } from '../types'
import { flattenIndications } from '../types'

export type FilterTab = 'all' | 'indications' | 'reactionAreas'

/**
 * Hebrew normalization: strips common prefixes/suffixes for fuzzy matching
 * כאבי → כאב, הראש → ראש, כאבים → כאב
 */
function normalizeHebrew(word: string): string {
  let w = word
  // Remove definite article prefix ה
  if (w.length > 2 && w.startsWith('ה')) w = w.slice(1)
  // Remove plural suffixes
  if (w.length > 3 && w.endsWith('ים')) w = w.slice(0, -2)
  if (w.length > 3 && w.endsWith('ות')) w = w.slice(0, -2)
  // Remove construct-state suffix י (כאבי → כאב)
  if (w.length > 2 && w.endsWith('י')) w = w.slice(0, -1)
  return w
}

/**
 * Score a single text string against the search query.
 * Returns the highest matching tier score.
 */
function scoreText(text: string, query: string, queryWords: string[]): number {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()

  // Tier 1: Exact phrase match (100)
  if (lower.includes(q)) return 100

  // Tier 2: Hebrew-normalized phrase match (80)
  // Normalize each word in both query and text, then check phrase
  const normalizedQueryWords = queryWords.map(normalizeHebrew)
  const textWords = lower.split(/[\s,،;.:()\-–—/]+/).filter(Boolean)
  const normalizedTextWords = textWords.map(normalizeHebrew)

  // Check if all normalized query words appear consecutively or all present
  const normalizedText = normalizedTextWords.join(' ')
  const normalizedQuery = normalizedQueryWords.join(' ')
  if (normalizedText.includes(normalizedQuery)) return 80

  // Tier 3: All words present in same text (50)
  const allPresent = queryWords.every(qw => {
    const nqw = normalizeHebrew(qw)
    return lower.includes(qw) || normalizedTextWords.some(tw => tw === nqw)
  })
  if (allPresent) return 50

  // Tier 4: Partial word matches (20 per word)
  let matchCount = 0
  for (const qw of queryWords) {
    const nqw = normalizeHebrew(qw)
    if (lower.includes(qw) || normalizedTextWords.some(tw => tw === nqw)) {
      matchCount++
    }
  }
  if (matchCount > 0) return matchCount * 20

  return 0
}

/**
 * Score a point against the search query.
 * Returns 0 if no match (should be filtered out).
 */
export function scorePoint(point: Point, query: string, tab: FilterTab): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1 // No query = everything matches equally

  const queryWords = q.split(/\s+/).filter(Boolean)
  if (queryWords.length === 0) return 1

  let maxScore = 0

  if (tab === 'indications') {
    for (const ind of flattenIndications(point.indications)) {
      maxScore = Math.max(maxScore, scoreText(ind, q, queryWords))
    }
  } else if (tab === 'reactionAreas') {
    for (const ra of point.reactionAreas) {
      maxScore = Math.max(maxScore, scoreText(ra, q, queryWords))
    }
  } else {
    // "all" tab — search everything
    const texts = [
      point.id,
      point.zone,
      point.pinyinName,
      point.chineseName,
      point.hebrewName,
      point.englishName,
      ...flattenIndications(point.indications),
      ...point.reactionAreas,
    ]
    for (const text of texts) {
      maxScore = Math.max(maxScore, scoreText(text, q, queryWords))
      if (maxScore === 100) break // Can't do better
    }
  }

  return maxScore
}
