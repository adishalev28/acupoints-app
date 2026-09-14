// מיקום ראשוני של הערוצים ושל נקודות דונג על שני הגופים, מתוך פרופורציות הגוף.
// זו נקודת פתיחה בקירוב בלבד - עדי מתקן במצב העריכה (/body?edit=1).
//
// שימוש:  node scripts/body-model/seed-positions.mjs
// פלט:    src/data/bodyModel/meridianPaths.ts, src/data/bodyModel/tungPoints.ts
// ⚠️ דורס תיקונים ידניים. להריץ רק אחרי המרת גופים מחדש או בהוספת ערוץ חדש.

import fs from 'node:fs'
import * as THREE from 'three'
import { NodeIO } from '@gltf-transform/core'

const SURFACE_OFFSET = 0.004 // הקו מרחף 4 מ"מ מעל העור

async function loadBody(file) {
  const doc = await new NodeIO().read(file)
  const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(prim.getAttribute('POSITION').getArray(), 3))
  geo.setIndex(new THREE.BufferAttribute(prim.getIndices().getArray(), 1))
  geo.computeBoundingBox()
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
}

/** כלי מדידה על גוף אחד: קרניים מלפנים, מהצד ומלמעלה, וזיהוי גפיים */
function measure(mesh) {
  const H = mesh.geometry.boundingBox.max.y
  const s = H / 1.78
  const ray = new THREE.Raycaster()
  const cast = (origin, dir) => {
    ray.set(new THREE.Vector3(...origin), new THREE.Vector3(...dir).normalize())
    return ray.intersectObject(mesh)[0] ?? null
  }
  const front = (x, y) => cast([x, y, 1], [0, 0, -1])
  const back = (x, y) => cast([x, y, -1], [0, 0, 1])
  const side = (y, z) => cast([0.8, y, z], [-1, 0, 0])
  const down = (x, z) => {
    for (let dz = 0; dz < 0.05; dz += 0.003) {
      const h = cast([x, 0.3 * s, z - dz], [0, -1, 0])
      if (h) return h
    }
    return null
  }

  /** רצפי פגיעה לאורך x בגובה נתון: גו, זרוע, רגל */
  const runs = (y, maxX) => {
    const list = []
    let cur = null
    for (let x = 0.02; x < maxX; x += 0.003) {
      const h = front(x, y)
      if (h) {
        if (!cur) { cur = { a: x, b: x, crest: x, z: h.point.z }; list.push(cur) }
        cur.b = x
        if (h.point.z > cur.z) { cur.z = h.point.z; cur.crest = x }
      } else cur = null
    }
    return list
  }
  const halfWidth = (y, maxX) => {
    let last = 0, prevZ = null
    for (let x = 0; x < maxX; x += 0.003) {
      const h = front(x, y)
      if (!h || (prevZ !== null && prevZ - h.point.z > 0.04)) break
      prevZ = h.point.z
      last = x
    }
    return last
  }
  const leg = y => runs(y, 0.26 * s).sort((p, q) => (q.b - q.a) - (p.b - p.a))[0]
  /** הזרוע היא הרצף החיצוני ביותר; מתחת לכף היד אין רצף כזה */
  const arm = y => {
    const list = runs(y, 0.65 * s)
    if (list.length < 2) return null
    return list[list.length - 1]
  }

  return { H, s, cast, front, back, side, down, runs, halfWidth, leg, arm }
}

function surfacePoint(hit) {
  const n = hit.face.normal.clone().normalize()
  const p = hit.point.clone().addScaledVector(n, SURFACE_OFFSET)
  const r = v => +v.toFixed(4)
  return { p: [r(p.x), r(p.y), r(p.z)], n: [r(n.x), r(n.y), r(n.z)] }
}

// ───────────────────────────── ערוץ הקיבה ─────────────────────────────
function stomachRules(m) {
  const { H, s, front, back, side, halfWidth, leg, down } = m
  const eyeY = 0.93 * H
  const hw = halfWidth(eyeY, 0.12)
  const faceZ = front(0, eyeY).point.z
  const backZ = back(0, eyeY).point.z
  const headDepth = faceZ - backZ
  const headMid = (faceZ + backZ) / 2
  const nippleX = 0.6 * halfWidth(0.722 * H, 0.25)
  const abdX = 0.5 * nippleX
  const thigh = y => { const r = leg(y); return r.a + 0.6 * (r.b - r.a) }
  const shin = y => leg(y).crest
  const ankle = leg(0.05 * H)
  const ankleZ = front(ankle.crest, 0.05 * H).point.z
  let toe = { x: 0, z: -1 }
  const pos = m.positions
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) > 0 && pos.getY(i) < 0.03 * s && pos.getZ(i) > toe.z) toe = { x: pos.getX(i), z: pos.getZ(i) }
  }
  const secondToeX = toe.x + 0.018 * s

  return {
    ST1: () => front(0.4 * hw, 0.922 * H),
    ST3: () => front(0.4 * hw, 0.903 * H),
    ST4: () => front(0.3 * hw, 0.884 * H),
    ST5: () => front(0.62 * hw, 0.866 * H),
    ST6: () => side(0.878 * H, headMid + 0.1 * headDepth),
    ST7: () => side(0.912 * H, headMid + 0.06 * headDepth),
    ST8: () => front(0.6 * hw, 0.963 * H),
    ST9: () => front(0.035 * s, 0.845 * H),
    ST11: () => front(0.03 * s, 0.823 * H),
    ST12: () => front(nippleX, 0.815 * H),
    ST13: () => front(nippleX, 0.8 * H),
    ST15: () => front(nippleX, 0.765 * H),
    ST17: () => front(nippleX, 0.722 * H),
    ST18: () => front(nippleX, 0.7 * H),
    ST19: () => front(abdX, 0.665 * H),
    ST21: () => front(abdX, 0.635 * H),
    ST25: () => front(abdX, 0.595 * H),
    ST27: () => front(abdX, 0.56 * H),
    ST30: () => front(abdX, 0.515 * H),
    ST31: () => front(thigh(0.465 * H), 0.465 * H),
    ST32: () => front(thigh(0.4 * H), 0.4 * H),
    ST34: () => front(thigh(0.315 * H), 0.315 * H),
    ST35: () => { const r = leg(0.285 * H); return front(r.crest + 0.35 * (r.b - r.crest), 0.285 * H) },
    ST36: () => front(shin(0.245 * H) + 0.02 * s, 0.245 * H),
    ST38: () => front(shin(0.17 * H) + 0.02 * s, 0.17 * H),
    ST41: () => front(ankle.crest, 0.05 * H),
    ST42: () => down(ankle.crest + 0.008 * s, ankleZ + 0.35 * (toe.z - ankleZ)),
    ST44: () => down(secondToeX, toe.z - 0.035 * s),
    ST45: () => down(secondToeX, toe.z - 0.01 * s),
  }
}

// ──────────────────────── ערוץ המעי הגס (יד) ────────────────────────
function largeIntestineRules(m) {
  const { H, s, front, halfWidth, arm } = m
  // הקו עולה לאורך הצד הקדמי-חיצוני של היד; הזרוע תלויה באלכסון
  const onArm = (t, lateral = 0) => {
    const y = t * H
    const a = arm(y)
    if (!a) return null
    return front(Math.min(a.crest + lateral, a.b - 0.004), y)
  }
  // כף היד תלויה כשהכף פונה לירך: האצבעות מסודרות מקדימה לאחור (z יורד),
  // האגודל קצר ומעליהן. האצבע המורה היא האצבע הקדמית ביותר מעט מעל קצות האצבעות.
  const pos = m.positions
  let tipY = Infinity
  for (let i = 0; i < pos.count; i++) if (pos.getX(i) > 0.3 * s && pos.getY(i) < tipY) tipY = pos.getY(i)
  const frontmostAt = (y, band = 0.003) => {
    let best = null
    for (let i = 0; i < pos.count; i++) {
      if (pos.getX(i) < 0.3 * s || Math.abs(pos.getY(i) - y) > band) continue
      if (!best || pos.getZ(i) > best.z) best = { x: pos.getX(i), z: pos.getZ(i) }
    }
    return best
  }
  const indexTip = frontmostAt(tipY + 0.02 * s)
  // האגודל מכסה את האצבע המורה במבט מלפנים, ולכן עוקבים אחרי המורה לפי הקודקודים שלה
  // ומטילים קרן קצרה ממש מולה, כדי שלא תפגע באגודל
  const indexFront = y => {
    let best = null
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getY(i) - y) > 0.003 || Math.abs(pos.getX(i) - indexTip.x) > 0.015 * s) continue
      if (pos.getZ(i) > indexTip.z + 0.012 * s) continue
      if (!best || pos.getZ(i) > best.z) best = { x: pos.getX(i), z: pos.getZ(i) }
    }
    return best ? m.cast([best.x, y, best.z + 0.006], [0, 0, -1]) : null
  }
  // גב כף היד פונה החוצה (x חיובי): קרן מהצד, קרוב לשפה הקדמית (צד האגודל)
  const dorsal = (y, inset) => {
    const edge = frontmostAt(y)
    return edge ? m.cast([1, y, edge.z - inset], [-1, 0, 0]) : null
  }

  const shoulderHalf = halfWidth(0.82 * H, 0.3)

  return {
    LI1: () => front(indexTip.x, tipY + 0.02 * s),
    LI2: () => indexFront(tipY + 0.055 * s),
    LI3: () => indexFront(tipY + 0.085 * s),
    LI4: () => dorsal(tipY + 0.11 * s, 0.018 * s),
    LI5: () => dorsal(tipY + 0.175 * s, 0.012 * s),
    LI10: () => onArm(0.638),
    LI11: () => onArm(0.662, 0.008 * s),
    LI14: () => onArm(0.735),
    LI15: () => front(0.86 * shoulderHalf, 0.818 * H),
    LI16: () => front(0.5 * shoulderHalf, 0.836 * H),
    LI18: () => front(0.042 * s, 0.858 * H),
    LI20: () => front(0.014 * s, 0.894 * H),
  }
}

// ──────────────── נקודות דונג להדגמה (שלוש קבוצות בירך) ────────────────
function tungRules(m) {
  const { H, s, front, leg, halfWidth } = m
  const asisY = 0.53 * H
  const asis = new THREE.Vector2(0.72 * halfWidth(asisY, 0.3), asisY)
  const kneeY = 0.305 * H
  const knee = leg(kneeY)
  const patella = new THREE.Vector2(knee.crest + 0.45 * (knee.b - knee.crest), kneeY)
  const simaMid = asis.clone().add(patella).multiplyScalar(0.5)
  const simaDir = asis.clone().sub(patella).normalize()
  const twoCun = 0.045 * s

  // שלושת חודרי הרגל: קו האמצע הקדמי של הירך, בגובה קו הפיקה ומעלה
  const anterior = y => { const r = leg(y); return front(r.crest, y) }
  // שלושה צהובים: הצד הפנימי של הירך
  const medial = y => { const r = leg(y); return front(r.a + 0.012 * s, y) }
  // הצד הפנימי של השוק: קרן מקו האמצע החוצה, בעומק מרכז הרגל
  const medialShin = y => {
    const r = leg(y)
    const cx = (r.a + r.b) / 2
    const f = front(cx, y)
    const b = m.back(cx, y)
    const z = f && b ? (f.point.z + b.point.z) / 2 + 0.012 * s : 0
    return m.cast([0, y, z], [1, 0, 0])
  }
  const cun = 0.0225 * s
  const malleolusY = 0.045 * H
  const shin = y => leg(y).crest
  const sima = offset => {
    const q = simaMid.clone().addScaledVector(simaDir, offset)
    return front(q.x, q.y)
  }

  return {
    '88.01': () => anterior(0.395 * H),
    '88.02': () => anterior(0.42 * H),
    '88.03': () => anterior(0.445 * H),
    '88.12': () => medial(0.40 * H),
    '88.13': () => medial(0.435 * H),
    '88.14': () => medial(0.365 * H),
    '88.17': () => sima(0),
    '88.18': () => sima(twoCun),
    '88.19': () => sima(-twoCun),
    // שלושת הקיסרים התחתונים - כליות
    '77.17': () => medialShin(0.262 * H),
    '77.21': () => medialShin(malleolusY + 3.5 * cun),
    '77.19': () => medialShin(malleolusY + 7.5 * cun),
    // ארבעת הפרחים - טחול
    '77.08': () => front(shin(0.245 * H) + 0.008 * s, 0.245 * H),
    '77.09': () => front(shin(0.245 * H - 4.5 * cun) + 0.008 * s, 0.245 * H - 4.5 * cun),
  }
}

function runRules(rules, label) {
  const out = {}
  for (const [id, rule] of Object.entries(rules)) {
    const hit = rule()
    if (!hit?.face) throw new Error(`${label} ${id}: ray missed the body`)
    out[id] = surfacePoint(hit)
  }
  return out
}

async function seedBody(file) {
  const mesh = await loadBody(file)
  const m = measure(mesh)
  m.mesh = mesh
  m.positions = mesh.geometry.attributes.position
  return {
    meridians: {
      stomach: runRules(stomachRules(m), 'stomach'),
      largeIntestine: runRules(largeIntestineRules(m), 'largeIntestine'),
    },
    tung: runRules(tungRules(m), 'tung'),
  }
}

const female = await seedBody('public/models/body-female.glb')
const male = await seedBody('public/models/body-male.glb')

const pretty = value => JSON.stringify(value, null, 2)
  .replace(/\[\s+([-\d.e]+),\s+([-\d.e]+),\s+([-\d.e]+)\s+\]/g, '[$1, $2, $3]')
  .replace(/\n/g, '\n  ')

fs.writeFileSync('src/data/bodyModel/meridianPaths.ts', `// נוצר על ידי scripts/body-model/seed-positions.mjs ומתוקן ידנית ממצב העריכה.
// מיקומים במטרים, בצד שמאל של המטופל (x חיובי). הצד השני משתקף אוטומטית.
import type { BodySex, SurfacePoint } from './meridians'

type Paths = Record<string, Record<string, SurfacePoint>>

export const meridianPaths: Record<BodySex, Paths> = {
  female: ${pretty(female.meridians)},
  male: ${pretty(male.meridians)},
}
`)

fs.writeFileSync('src/data/bodyModel/tungPoints.ts', `// נוצר על ידי scripts/body-model/seed-positions.mjs ומתוקן ידנית ממצב העריכה.
// נקודות דונג על הגוף, בצד שמאל של המטופל (x חיובי). הצד השני משתקף אוטומטית.
import type { BodySex, SurfacePoint } from './meridians'

export const tungPoints: Record<BodySex, Record<string, SurfacePoint>> = {
  female: ${pretty(female.tung)},
  male: ${pretty(male.tung)},
}
`)

console.log('wrote meridianPaths.ts (stomach, largeIntestine) and tungPoints.ts')
