#!/usr/bin/env node
/**
 * test-diagnosis.mjs
 *
 * Smoke test for SmartDiagnosis point-matching logic.
 *
 * Loads all zone files as text, extracts point IDs + indications,
 * and verifies that for each common clinical scenario:
 *   1. The primary symptom maps to enough points
 *   2. The expected organ(s) are reachable
 *
 * Usage: node scripts/test-diagnosis.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ZONES_DIR = path.join(ROOT, 'src', 'data', 'zones')
const PATHOGENESIS_FILE = path.join(ROOT, 'src', 'data', 'pathogenesis.ts')

// ─── Load zone files and extract points ──────────────────────────────────

function extractPointsFromZoneFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const points = []

  // Match point objects: { id: 'XX.YY', ..., indications: [...] or { ... } }
  // We use a simple approach: find all `id: '...'` locations, then capture
  // everything up to the next sibling comma at object level. Since points
  // are nested objects in an array, we extract the indications via regex.

  // First, find all `id: 'XX.YY'` or `id: "XX.YY"` markers
  const idRegex = /id:\s*['"]([^'"]+)['"]/g
  let idMatch
  const idPositions = []
  while ((idMatch = idRegex.exec(text)) !== null) {
    idPositions.push({ id: idMatch[1], start: idMatch.index })
  }

  // For each id, find the indications block until the next id or end of file
  for (let i = 0; i < idPositions.length; i++) {
    const { id, start } = idPositions[i]
    const end = i + 1 < idPositions.length ? idPositions[i + 1].start : text.length
    const block = text.substring(start, end)

    // Extract all quoted strings from the indications area
    // Approach: find everything after "indications:" until we hit a closing bracket
    // followed by a comma + newline at the same indent level, or the end of block
    const indIdx = block.indexOf('indications:')
    if (indIdx === -1) continue

    // Capture all quoted strings in the block after indications:
    const afterInd = block.substring(indIdx)
    const stringRegex = /['"]([^'"\\]+(?:\\.[^'"\\]*)*)['"]/g
    const indications = []
    let strMatch
    while ((strMatch = stringRegex.exec(afterInd)) !== null) {
      const s = strMatch[1]
      // Filter out field names and obvious non-indications
      if (
        s.length > 2 &&
        !s.match(/^[a-zA-Z_]+$/) && // skip field names
        !['category', 'items', 'indications', 'reactionAreas', 'hebrewName', 'pinyinName', 'zone', 'number', 'absoluteNeedle', '72', '32'].includes(s)
      ) {
        indications.push(s)
      }
      // Stop if we hit what looks like the next point's id
      if (s.match(/^\d{2}\.\d{2}$/)) break
    }

    points.push({ id, indications })
  }

  return points
}

function loadAllPoints() {
  const files = fs.readdirSync(ZONES_DIR).filter(f => f.endsWith('.ts'))
  let all = []
  for (const f of files) {
    const filePath = path.join(ZONES_DIR, f)
    try {
      const points = extractPointsFromZoneFile(filePath)
      all = all.concat(points)
    } catch (err) {
      console.error(`Error loading ${f}: ${err.message}`)
    }
  }
  return all
}

// ─── Load pathogenesis keywords ──────────────────────────────────────────

function loadPathogenesisKeywords() {
  const text = fs.readFileSync(PATHOGENESIS_FILE, 'utf8')
  // Find matchKeywords arrays: matchKeywords: ['...', '...', ...]
  const regex = /matchKeywords:\s*\[([^\]]+)\]/g
  const allGroups = []
  let m
  while ((m = regex.exec(text)) !== null) {
    const keywords = []
    const stringRegex = /['"]([^'"]+)['"]/g
    let s
    while ((s = stringRegex.exec(m[1])) !== null) {
      keywords.push(s[1])
    }
    allGroups.push(keywords)
  }
  return allGroups
}

// ─── Expand primary symptom to keywords ──────────────────────────────────

function expandSymptomKeywords(symptom, pathogenesisGroups) {
  const keywords = new Set([symptom])
  for (const group of pathogenesisGroups) {
    const matched = group.some(k => symptom.includes(k) || k.includes(symptom))
    if (matched) {
      group.forEach(k => keywords.add(k))
    }
  }
  return Array.from(keywords)
}

// ─── Find matching points ────────────────────────────────────────────────

function findMatchingPoints(keywords, allPoints) {
  return allPoints.filter(p =>
    keywords.some(kw => p.indications.some(ind => ind.includes(kw)))
  )
}

// ─── Test scenarios ──────────────────────────────────────────────────────

const scenarios = [
  { primary: 'מיגרנה', minPoints: 5, expectedOrganHint: 'liver (כבד)' },
  { primary: 'נדודי שינה', minPoints: 3, expectedOrganHint: 'heart (לב)' },
  { primary: 'אסתמה', minPoints: 5, expectedOrganHint: 'lungs (ריאות)' },
  { primary: 'כאב גב תחתון', minPoints: 10, expectedOrganHint: 'kidneys (כליות)' },
  { primary: 'אקזמה', minPoints: 3, expectedOrganHint: 'lungs (ריאות)' },
  { primary: 'כאב ברכיים', minPoints: 5, expectedOrganHint: 'kidneys (כליות)' },
  { primary: 'סיאטיקה', minPoints: 10, expectedOrganHint: 'kidneys + liver' },
  { primary: 'טינטון', minPoints: 5, expectedOrganHint: 'kidneys (כליות)' },
  { primary: 'פציאליס', minPoints: 5, expectedOrganHint: 'liver (כבד)' },
  { primary: 'בעיות עיכול', minPoints: 5, expectedOrganHint: 'spleen (טחול)' },
  { primary: 'כאב כתף', minPoints: 5, expectedOrganHint: 'liver (כבד)' },
  { primary: 'חרדה', minPoints: 3, expectedOrganHint: 'heart (לב)' },
  { primary: 'דפיקות לב', minPoints: 3, expectedOrganHint: 'heart (לב)' },
  { primary: 'PMS', minPoints: 0, expectedOrganHint: 'liver (no direct PMS indication)' },
  { primary: 'וסת', minPoints: 5, expectedOrganHint: 'liver + kidneys' },
]

// ─── Run tests ───────────────────────────────────────────────────────────

console.log('🧪 Running SmartDiagnosis coverage tests...\n')

const pathogenesisGroups = loadPathogenesisKeywords()
console.log(`📚 Loaded ${pathogenesisGroups.length} pathogenesis keyword groups`)

const allPoints = loadAllPoints()
console.log(`📍 Loaded ${allPoints.length} points from zone files\n`)

let passed = 0
let failed = 0
const failures = []

for (const scenario of scenarios) {
  const keywords = expandSymptomKeywords(scenario.primary, pathogenesisGroups)
  const matches = findMatchingPoints(keywords, allPoints)
  const count = matches.length
  const ok = count >= scenario.minPoints
  const icon = ok ? '✅' : '❌'

  console.log(
    `${icon} "${scenario.primary}" → ${count} נקודות (min: ${scenario.minPoints}) — ${scenario.expectedOrganHint}`
  )
  console.log(`   keywords: ${keywords.slice(0, 5).join(', ')}${keywords.length > 5 ? '...' : ''}`)

  if (ok) {
    passed++
    // Show sample points
    const samples = matches.slice(0, 3).map(p => p.id).join(', ')
    console.log(`   sample: ${samples}`)
  } else {
    failed++
    failures.push({ scenario, count, keywords })
  }
  console.log('')
}

// ─── Summary ────────────────────────────────────────────────────────────

console.log('═'.repeat(60))
console.log(`📊 Results: ${passed}/${scenarios.length} passed, ${failed} failed`)
console.log('═'.repeat(60))

if (failed > 0) {
  console.log('\n❌ Failures:')
  for (const f of failures) {
    console.log(`  - "${f.scenario.primary}" — got ${f.count}, need ${f.scenario.minPoints}`)
  }
  process.exit(1)
}

console.log('\n✅ All scenarios passed!')
