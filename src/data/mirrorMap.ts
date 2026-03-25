// ===================================================================
// Mirror Map — הדמיה הולוגרפית
// Based on Seán Goodman's book: mirroring principles in Master Tung's acupuncture
// ===================================================================

export interface BodyArea {
  id: string
  name: string
  zones: string[]        // matching acupuncture zones
  group: 'upper' | 'lower' | 'torso'
  emoji: string
}

export interface MirrorResult {
  type: 'contralateral' | 'upperLower' | 'torso'
  typeName: string
  typeIcon: string
  description: string
  standard: { target: BodyArea; note: string }
  inverse?: { target: BodyArea; note: string }
}

// ───────────────────────────────────────
// Body Areas
// ───────────────────────────────────────

export const BODY_AREAS: BodyArea[] = [
  // Upper limb (distal → proximal)
  { id: 'fingers',  name: 'אצבעות',   zones: ['11'],       group: 'upper', emoji: '🖐️' },
  { id: 'hand',     name: 'כף יד',    zones: ['22'],       group: 'upper', emoji: '✋' },
  { id: 'forearm',  name: 'אמה',      zones: ['33'],       group: 'upper', emoji: '💪' },
  { id: 'elbow',    name: 'מרפק',     zones: ['33', '44'], group: 'upper', emoji: '🦴' },
  { id: 'arm',      name: 'זרוע',     zones: ['44'],       group: 'upper', emoji: '💪' },
  { id: 'shoulder', name: 'כתף',      zones: ['44'],       group: 'upper', emoji: '🦴' },
  // Lower limb (distal → proximal)
  { id: 'foot',     name: 'כף רגל',   zones: ['55', '66'], group: 'lower', emoji: '🦶' },
  { id: 'lowerLeg', name: 'שוק',      zones: ['77'],       group: 'lower', emoji: '🦵' },
  { id: 'knee',     name: 'ברך',      zones: ['77', '88'], group: 'lower', emoji: '🦴' },
  { id: 'thigh',    name: 'ירך',      zones: ['88'],       group: 'lower', emoji: '🦵' },
  { id: 'hip',      name: 'מפרק ירך', zones: ['88'],       group: 'lower', emoji: '🦴' },
  // Torso & head
  { id: 'head',          name: 'ראש',          zones: ['1010'],     group: 'torso', emoji: '🧠' },
  { id: 'chest',         name: 'חזה',          zones: ['VT'],       group: 'torso', emoji: '🫁' },
  { id: 'navel',         name: 'טבור',         zones: ['VT'],       group: 'torso', emoji: '⭕' },
  { id: 'lowerAbdomen',  name: 'בטן תחתונה',   zones: ['VT'],       group: 'torso', emoji: '🫃' },
  { id: 'genitalia',     name: 'גניטליה',      zones: ['VT'],       group: 'torso', emoji: '🔒' },
  { id: 'lowerBack',     name: 'גב תחתון',     zones: ['DT'],       group: 'torso', emoji: '🔙' },
]

const areaById = (id: string): BodyArea =>
  BODY_AREAS.find(a => a.id === id)!

// ───────────────────────────────────────
// Contralateral Mirroring — ימין ↔ שמאל
// ───────────────────────────────────────
// Standard: same area, opposite side
// Inverse (elbow/knee axis): hand↔shoulder, forearm↔arm, etc.

const CONTRALATERAL_INVERSE_UPPER: [string, string][] = [
  ['hand',     'shoulder'],
  ['forearm',  'arm'],
  // elbow↔elbow is the axis
]

const CONTRALATERAL_INVERSE_LOWER: [string, string][] = [
  ['foot',     'hip'],
  ['lowerLeg', 'thigh'],
  // knee↔knee is the axis
]

// ───────────────────────────────────────
// Upper ↔ Lower Mirroring
// ───────────────────────────────────────
// Standard: shoulder↔hip, arm↔thigh, elbow↔knee, forearm↔lowerLeg, hand↔foot
// Inverse: hand↔hip, forearm↔thigh, elbow↔knee, arm↔lowerLeg, shoulder↔foot

const UPPER_LOWER_STANDARD: [string, string][] = [
  ['shoulder', 'hip'],
  ['arm',      'thigh'],
  ['elbow',    'knee'],
  ['forearm',  'lowerLeg'],
  ['hand',     'foot'],
  ['fingers',  'foot'],
]

const UPPER_LOWER_INVERSE: [string, string][] = [
  ['hand',     'hip'],
  ['forearm',  'thigh'],
  ['elbow',    'knee'],
  ['arm',      'lowerLeg'],
  ['shoulder', 'foot'],
  ['fingers',  'hip'],
]

// ───────────────────────────────────────
// Limbs ↔ Torso (Taiji) Mirroring
// ───────────────────────────────────────
// Standard: shoulder/hip↔head, arm/thigh↔chest, elbow/knee↔navel, forearm/lowerLeg↔lowerAbdomen, hand/foot↔genitalia
// Inverse: hand/foot↔head, forearm/lowerLeg↔chest, elbow/knee↔navel, arm/thigh↔lowerAbdomen, shoulder/hip↔genitalia

const TORSO_STANDARD: [string, string][] = [
  ['shoulder', 'head'],
  ['arm',      'chest'],
  ['elbow',    'navel'],
  ['forearm',  'lowerAbdomen'],
  ['hand',     'genitalia'],
  ['fingers',  'genitalia'],
  // Lower limb equivalents
  ['hip',      'head'],
  ['thigh',    'chest'],
  ['knee',     'navel'],
  ['lowerLeg', 'lowerAbdomen'],
  ['foot',     'genitalia'],
]

const TORSO_INVERSE: [string, string][] = [
  ['hand',     'head'],
  ['forearm',  'chest'],
  ['elbow',    'navel'],
  ['arm',      'lowerAbdomen'],
  ['shoulder', 'genitalia'],
  ['fingers',  'head'],
  // Lower limb equivalents
  ['foot',     'head'],
  ['lowerLeg', 'chest'],
  ['knee',     'navel'],
  ['thigh',    'lowerAbdomen'],
  ['hip',      'genitalia'],
]

// ───────────────────────────────────────
// Main lookup function
// ───────────────────────────────────────

export function getMirrorResults(selectedId: string): MirrorResult[] {
  const results: MirrorResult[] = []
  const area = areaById(selectedId)
  if (!area) return results

  // 1) Contralateral — always available for limbs
  if (area.group === 'upper' || area.group === 'lower') {
    const contralateral: MirrorResult = {
      type: 'contralateral',
      typeName: 'הדמיה ימין ↔ שמאל',
      typeIcon: '↔️',
      description: 'דיקור באותו אזור בצד הנגדי',
      standard: { target: area, note: 'אותו אזור, צד נגדי' },
    }

    // Check for inverse
    const inverseMap = area.group === 'upper' ? CONTRALATERAL_INVERSE_UPPER : CONTRALATERAL_INVERSE_LOWER
    for (const [a, b] of inverseMap) {
      if (a === selectedId) {
        contralateral.inverse = { target: areaById(b), note: 'הדמיה הפוכה (ציר מרפק/ברך)' }
        break
      }
      if (b === selectedId) {
        contralateral.inverse = { target: areaById(a), note: 'הדמיה הפוכה (ציר מרפק/ברך)' }
        break
      }
    }

    results.push(contralateral)
  }

  // 2) Upper ↔ Lower
  if (area.group === 'upper' || area.group === 'lower') {
    const standardPairs = area.group === 'upper' ? UPPER_LOWER_STANDARD : UPPER_LOWER_STANDARD.map(([a, b]) => [b, a] as [string, string])
    const inversePairs = area.group === 'upper' ? UPPER_LOWER_INVERSE : UPPER_LOWER_INVERSE.map(([a, b]) => [b, a] as [string, string])

    for (const [from, to] of standardPairs) {
      if (from === selectedId) {
        const result: MirrorResult = {
          type: 'upperLower',
          typeName: 'הדמיה עליונה ↔ תחתונה',
          typeIcon: '⬆️',
          description: area.group === 'upper'
            ? 'דיקור בגפה התחתונה בצד הנגדי'
            : 'דיקור בגפה העליונה בצד הנגדי',
          standard: { target: areaById(to), note: 'הדמיה רגילה, צד נגדי' },
        }

        // Find inverse
        for (const [fi, ti] of inversePairs) {
          if (fi === selectedId) {
            result.inverse = { target: areaById(ti), note: 'הדמיה הפוכה, צד נגדי' }
            break
          }
        }

        results.push(result)
        break
      }
    }
  }

  // 3) Limbs ↔ Torso (Taiji)
  if (area.group === 'upper' || area.group === 'lower') {
    for (const [limb, torso] of TORSO_STANDARD) {
      if (limb === selectedId) {
        const result: MirrorResult = {
          type: 'torso',
          typeName: 'הדמיה גפיים ↔ גזע (טאיג\'י)',
          typeIcon: '☯️',
          description: 'דיקור בגפה לטיפול באזור הגזע, או להפך',
          standard: { target: areaById(torso), note: 'הדמיה רגילה — הגפה משקפת את הגזע' },
        }

        for (const [li, ti] of TORSO_INVERSE) {
          if (li === selectedId) {
            result.inverse = { target: areaById(ti), note: 'הדמיה הפוכה' }
            break
          }
        }

        results.push(result)
        break
      }
    }
  }

  // For torso areas — find which limbs mirror to them
  if (area.group === 'torso') {
    const limbResults: { standard: BodyArea[]; inverse: BodyArea[] } = { standard: [], inverse: [] }

    for (const [limb, torso] of TORSO_STANDARD) {
      if (torso === selectedId) limbResults.standard.push(areaById(limb))
    }
    for (const [limb, torso] of TORSO_INVERSE) {
      if (torso === selectedId) limbResults.inverse.push(areaById(limb))
    }

    if (limbResults.standard.length > 0) {
      results.push({
        type: 'torso',
        typeName: 'הדמיה גזע ↔ גפיים (טאיג\'י)',
        typeIcon: '☯️',
        description: 'דיקור בגפיים לטיפול באזור זה',
        standard: {
          target: limbResults.standard[0],
          note: limbResults.standard.map(a => a.name).join(' / ') + ' — צד נגדי',
        },
        inverse: limbResults.inverse.length > 0 ? {
          target: limbResults.inverse[0],
          note: limbResults.inverse.map(a => a.name).join(' / ') + ' — הדמיה הפוכה',
        } : undefined,
      })
    }
  }

  return results
}

// ───────────────────────────────────────
// Directional rules
// ───────────────────────────────────────

export const DIRECTIONAL_RULES = [
  { direction: 'אנטריורי (קדמי)', arrow: '→', mirror: 'אנטריורי', example: 'צד קדמי של הראש → צד רדיאלי של כף היד' },
  { direction: 'לטרלי (צדדי)',    arrow: '→', mirror: 'לטרלי',    example: 'צד לטרלי של החזה → צד לטרלי של האמה' },
  { direction: 'פוסטריורי (אחורי)', arrow: '→', mirror: 'פוסטריורי', example: 'גב תחתון → צד פוסטריורי של האמה/שוק' },
  { direction: 'מדיאלי (פנימי)',  arrow: '→', mirror: 'מדיאלי',   example: 'צד פנימי → צד פנימי' },
]
