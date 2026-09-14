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

// ──────────────────────── ערוץ הריאות (יד) ────────────────────────
function lungRules(m) {
  const { H, s, front, halfWidth, arm, cast } = m
  const pos = m.positions
  // הזרוע תלויה כשכף היד פונה לירך: צד האגודל קדימה, והצד הפנימי של היד פונה לגוף.
  // ערוץ הריאות עובר בצד האגודל של הצד הפנימי - קדימה ומעט לכיוון הגוף.
  const onArmY = (y, medial) => {
    const a = arm(y)
    if (!a) return null
    return front(Math.max(a.crest - medial, a.a + 0.004), y)
  }
  let tipY = Infinity
  for (let i = 0; i < pos.count; i++) if (pos.getX(i) > 0.3 * s && pos.getY(i) < tipY) tipY = pos.getY(i)
  // קצה האגודל: הקודקוד הקדמי ביותר בכף היד
  let thumb = null
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) < 0.3 * s || pos.getY(i) > tipY + 0.14 * s) continue
    if (!thumb || pos.getZ(i) > thumb.z) thumb = { x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) }
  }
  const frontEdgeZ = y => {
    let z = -Infinity
    for (let i = 0; i < pos.count; i++) {
      if (pos.getX(i) > 0.3 * s && Math.abs(pos.getY(i) - y) < 0.003) z = Math.max(z, pos.getZ(i))
    }
    return z
  }
  // צד כף היד פונה לגוף: קרן מבין הירך לכף היד, החוצה
  const palmSide = (y, inset) => cast([0.3 * s, y, frontEdgeZ(y) - inset], [1, 0, 0])
  const wristY = tipY + 0.175 * s
  const cun = 0.0225 * s
  const shoulderHalf = halfWidth(0.82 * H, 0.3)

  return {
    LU1: () => front(0.74 * shoulderHalf, 0.79 * H),
    LU2: () => front(0.8 * shoulderHalf, 0.806 * H),
    LU3: () => onArmY(0.74 * H, 0.012 * s),
    LU5: () => onArmY(0.656 * H, 0.012 * s),
    // האמה נוטה קדימה, ולכן צון נמדד לאורך האמה (12 צון מקפל שורש כף היד עד המרפק) ולא אנכית
    LU6: () => onArmY(wristY + (0.658 * H - wristY) * 7 / 12, 0.008 * s),
    LU7: () => onArmY(wristY + (0.658 * H - wristY) * 1.5 / 12, 0.004 * s),
    LU9: () => palmSide(wristY, 0.008 * s),
    LU10: () => palmSide(tipY + 0.12 * s, 0.02 * s),
    LU11: () => cast([thumb.x, thumb.y + 0.006 * s, thumb.z + 0.01], [0, 0, -1]),
  }
}

// ──────────────────────── ערוץ הטחול (רגל) ────────────────────────
function spleenRules(m) {
  const { H, s, front, back, cast, halfWidth, leg, runs } = m
  const pos = m.positions
  const cun = 0.0225 * s
  let toe = { x: 0, z: -1 }
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) > 0 && pos.getY(i) < 0.03 * s && pos.getZ(i) > toe.z) toe = { x: pos.getX(i), z: pos.getZ(i) }
  }
  // הצד הפנימי של כף הרגל והשוק: קרן מקו האמצע החוצה
  const medialFoot = (y, z) => cast([0, y, z], [1, 0, 0])
  const legMidZ = y => {
    const r = leg(y)
    const cx = (r.a + r.b) / 2
    const f = front(cx, y)
    const b = back(cx, y)
    return f && b ? (f.point.z + b.point.z) / 2 : 0
  }
  const medialLeg = (y, forward = 0) => cast([0, y, legMidZ(y) + forward], [1, 0, 0])
  const medialThigh = y => { const r = leg(y); return front(r.a + 0.012 * s, y) }
  const malleolusY = 0.045 * H
  const nippleX = 0.6 * halfWidth(0.722 * H, 0.25)
  const midaxillary = y => {
    const list = runs(y, 0.65 * s)
    const gapX = list.length > 1 ? (list[0].b + list[1].a) / 2 : list[0].b + 0.05 * s
    const zf = front(0.02 * s, y)
    const zb = back(0.02 * s, y)
    const z = zf && zb ? (zf.point.z + zb.point.z) / 2 : 0
    return cast([gapX, y, z], [-1, 0, 0])
  }

  return {
    SP1: () => medialFoot(0.014 * s, toe.z - 0.012 * s),
    SP3: () => medialFoot(0.016 * s, toe.z - 0.07 * s),
    SP4: () => medialFoot(0.022 * s, toe.z - 0.1 * s),
    SP5: () => medialLeg(malleolusY - 0.004 * s, 0.02 * s),
    SP6: () => medialLeg(malleolusY + 3 * cun, -0.004 * s),
    SP9: () => medialLeg(0.272 * H, 0.004 * s),
    SP10: () => medialThigh(0.34 * H),
    SP11: () => medialThigh(0.415 * H),
    SP12: () => front(3.5 * cun, 0.508 * H),
    SP13: () => front(4 * cun, 0.53 * H),
    SP15: () => front(nippleX, 0.595 * H),
    SP16: () => front(nippleX, 0.655 * H),
    SP18: () => front(1.3 * nippleX, 0.72 * H),
    SP20: () => front(1.3 * nippleX, 0.775 * H),
    SP21: () => midaxillary(0.705 * H),
  }
}

// ─────────────── כלים משותפים ליד: חתך הזרוע ואצבעות כף היד ───────────────
// הזרוע תלויה כשכף היד פונה לירך: הצד הפנימי (לכיוון הגוף) הוא צד כף היד,
// הצד הקדמי הוא צד האגודל והצד האחורי הוא צד הזרת.
function armTools(m) {
  const { H, s, cast, runs } = m
  const pos = m.positions
  let tipY = Infinity
  for (let i = 0; i < pos.count; i++) if (pos.getX(i) > 0.3 * s && pos.getY(i) < tipY) tipY = pos.getY(i)
  const wristY = tipY + 0.175 * s
  const elbowY = 0.658 * H
  const cun = 0.0225 * s
  /** גובה על האמה, לפי צון מעל קפל שורש כף היד (12 צון עד קפל המרפק) */
  const forearmY = c => wristY + (elbowY - wristY) * c / 12

  /** חתך הזרוע: קרניים מהרווח שבין הגו לזרוע החוצה, בכל עומק - מחזיר את טווח העומק של הצד הפנימי */
  const armSection = y => {
    const list = runs(y, 0.65 * s)
    if (list.length < 2) return null
    const a = list[list.length - 1]
    const gapX = (list[0].b + list[1].a) / 2
    let z0 = null, z1 = null
    for (let z = -0.35; z < 0.4; z += 0.002) {
      const h = cast([gapX, y, z], [1, 0, 0])
      if (h && h.point.x > a.a - 0.01 && h.point.x < a.b + 0.01) { z0 ??= z; z1 = z }
    }
    return z0 === null ? null : { gapX, z0, z1 }
  }
  /** נקודה בצד הפנימי של הזרוע. f=0 הצד האחורי (זרת), f=1 הצד הקדמי (אגודל) */
  const medialArm = (y, f) => {
    const c = armSection(y)
    return c ? cast([c.gapX, y, c.z0 + f * (c.z1 - c.z0)], [1, 0, 0]) : null
  }

  /** קודקודי כף היד ברצועת גובה, מקובצים לפי עומק: מקדימה (אצבע מורה) לאחור (זרת) */
  const handBands = (y, band = 0.004) => {
    const pts = []
    for (let i = 0; i < pos.count; i++) {
      if (pos.getX(i) > 0.3 * s && Math.abs(pos.getY(i) - y) < band) pts.push({ x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) })
    }
    pts.sort((p, q) => q.z - p.z)
    const groups = []
    let cur = null
    for (const p of pts) {
      if (!cur || cur.z0 - p.z > 0.004) { cur = { z0: p.z, z1: p.z, pts: [] }; groups.push(cur) }
      cur.z0 = p.z
      cur.pts.push(p)
    }
    return groups
  }
  /** קצה אצבע: הקודקוד הנמוך ביותר בטווח העומק של האצבע, ומרכז האצבע מעט מעליו */
  const fingerTip = finger => {
    let tip = null
    for (let i = 0; i < pos.count; i++) {
      if (pos.getX(i) < 0.3 * s || pos.getY(i) > tipY + 0.03 * s) continue
      if (pos.getZ(i) < finger.z0 - 0.003 || pos.getZ(i) > finger.z1 + 0.003) continue
      if (!tip || pos.getY(i) < tip.y) tip = { x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) }
    }
    const near = handBands(tip.y + 0.006 * s, 0.004).find(g => g.z0 - 0.004 <= tip.z && tip.z <= g.z1 + 0.004)
    const x = near.pts.reduce((sum, p) => sum + p.x, 0) / near.pts.length
    return { ...tip, cx: x, cz: (near.z0 + near.z1) / 2, z0: near.z0, z1: near.z1 }
  }
  const fingers = handBands(tipY + 0.03 * s)
  /** כף היד פונה לגוף: קרן מבין הירך לכף היד, החוצה, בעומק יחסי f */
  const palm = (y, f) => {
    const g = handBands(y)
    const z0 = g[g.length - 1].z0, z1 = g[0].z1
    return cast([0.3 * s, y, z0 + f * (z1 - z0)], [1, 0, 0])
  }

  return { tipY, wristY, elbowY, cun, forearmY, armSection, medialArm, handBands, fingerTip, fingers, palm }
}

// ──────────────────────── ערוץ הלב (יד) ────────────────────────
function heartRules(m) {
  const { H, s, cast } = m
  const { tipY, wristY, elbowY, forearmY, armSection, medialArm, fingerTip, fingers, palm } = armTools(m)
  // מרכז בית השחי: קרן כלפי מעלה מהרווח שבין הגו לזרוע, בעומק מרכז הזרוע
  const armpit = () => {
    const c = armSection(0.735 * H)
    const mid = armSection(0.72 * H)
    return c && mid ? cast([c.gapX, 0.7 * H, (mid.z0 + mid.z1) / 2], [0, 1, 0]) : null
  }
  // הזרת היא האצבע האחורית ביותר; הפינה של הציפורן בצד הקמיצה (קדימה), מגב האצבע
  const little = fingerTip(fingers[fingers.length - 1])

  return {
    HT1: armpit,
    HT2: () => medialArm(elbowY + (0.745 * H - elbowY) * 3 / 9, 0.5),
    HT3: () => medialArm(elbowY, 0.45),
    HT4: () => medialArm(forearmY(1.5), 0.3),
    HT5: () => medialArm(forearmY(1), 0.3),
    HT6: () => medialArm(forearmY(0.5), 0.3),
    HT7: () => medialArm(wristY, 0.3),
    HT8: () => palm(tipY + 0.085 * s, 0.2),
    HT9: () => cast([1, little.y + 0.008 * s, little.z0 + 0.7 * (little.z1 - little.z0)], [-1, 0, 0]),
  }
}

// ──────────────────────── ערוץ קרום הלב (יד) ────────────────────────
function pericardiumRules(m) {
  const { H, s, front, halfWidth, cast } = m
  const { tipY, wristY, elbowY, cun, forearmY, medialArm, fingerTip, fingers, palm } = armTools(m)
  const nippleX = 0.6 * halfWidth(0.722 * H, 0.25)
  // האצבע האמצעית היא השנייה מלפנים; קרן כלפי מעלה אל קצה האצבע
  const middle = fingerTip(fingers[1])

  return {
    PC1: () => front(nippleX + cun, 0.722 * H),
    PC2: () => medialArm(0.745 * H - (0.745 * H - elbowY) * 2 / 9, 0.8),
    PC3: () => medialArm(elbowY, 0.8),
    PC4: () => medialArm(forearmY(5), 0.5),
    PC5: () => medialArm(forearmY(3), 0.5),
    PC6: () => medialArm(forearmY(2), 0.5),
    PC7: () => medialArm(wristY, 0.5),
    PC8: () => palm(tipY + 0.085 * s, 0.62),
    PC9: () => cast([middle.cx, middle.y - 0.05, middle.cz], [0, 1, 0]),
  }
}

// ──────────────────────── ערוץ כיס המרה (רגל) ────────────────────────
function gallbladderRules(m) {
  const { H, s, front, back, side, cast, halfWidth, leg, runs } = m
  const pos = m.positions
  const cun = 0.0225 * s
  const eyeY = 0.93 * H
  const hw = halfWidth(eyeY, 0.12)
  const faceZ = front(0, eyeY).point.z
  const backZ = back(0, eyeY).point.z
  const headDepth = faceZ - backZ
  const headMid = (faceZ + backZ) / 2
  // האוזן בולטת מעט מאחורי אמצע הראש, בין 0.913H ל-0.943H
  const earZ = headMid - 0.1 * headDepth
  const earTopY = 0.943 * H
  const fromAbove = (x, z) => cast([x, H + 0.05, z], [0, -1, 0])
  const shoulderHalf = halfWidth(0.82 * H, 0.3)
  const nippleX = 0.6 * halfWidth(0.722 * H, 0.25)
  // צד הגו: קרן מהרווח שבין הגו לזרוע פנימה. forward בין -1 (גב) ל-1 (בטן)
  const flank = (y, forward) => {
    const list = runs(y, 0.65 * s)
    const gapX = list.length > 1 ? (list[0].b + list[1].a) / 2 : list[0].b + 0.05 * s
    const zf = front(0.02 * s, y)
    const zb = back(0.02 * s, y)
    const mid = (zf.point.z + zb.point.z) / 2
    return cast([gapX, y, mid + forward * (zf.point.z - zb.point.z) / 2], [-1, 0, 0])
  }
  const legMidZ = y => {
    const r = leg(y)
    const cx = (r.a + r.b) / 2
    const f = front(cx, y)
    const b = back(cx, y)
    return f && b ? (f.point.z + b.point.z) / 2 : 0
  }
  // הצד החיצוני של הרגל: קרן מבחוץ פנימה
  const lateralLeg = (y, forward = 0) => cast([1, y, legMidZ(y) + forward], [-1, 0, 0])
  const malleolusY = 0.045 * H
  let toe = { x: 0, z: -1 }
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) > 0 && pos.getY(i) < 0.03 * s && pos.getZ(i) > toe.z) toe = { x: pos.getX(i), z: pos.getZ(i) }
  }
  const down = (x, z) => {
    for (let dz = 0; dz < 0.05; dz += 0.003) {
      const h = cast([x, 0.3 * s, z - dz], [0, -1, 0])
      if (h) return h
    }
    return null
  }

  return {
    GB1: () => front(0.66 * hw, eyeY),
    GB2: () => side(0.918 * H, earZ + 0.02 * s),
    GB8: () => side(earTopY + 1.5 * cun, earZ),
    GB12: () => side(0.908 * H, earZ - 0.025 * s),
    GB14: () => front(0.4 * hw, 0.955 * H),
    GB15: () => fromAbove(0.4 * hw, headMid + 0.38 * headDepth),
    GB17: () => fromAbove(2.25 * cun, headMid + 0.1 * headDepth),
    GB19: () => back(2.25 * cun, 0.94 * H),
    GB20: () => back(0.04 * s, 0.888 * H),
    GB21: () => {
      const x = 0.62 * shoulderHalf
      const f = front(x, 0.8 * H)
      const b = back(x, 0.8 * H)
      return fromAbove(x, (f.point.z + b.point.z) / 2)
    },
    GB22: () => flank(0.715 * H, 0),
    GB24: () => front(nippleX, 0.665 * H),
    GB25: () => flank(0.615 * H, -0.2),
    GB30: () => lateralLeg(0.505 * H, -0.01 * s),
    GB31: () => lateralLeg(0.375 * H),
    GB34: () => lateralLeg(0.255 * H, 0.015 * s),
    GB39: () => lateralLeg(malleolusY + 3 * cun, 0.01 * s),
    GB40: () => cast([1, 0.035 * H, legMidZ(malleolusY) + 0.025 * s], [-1, 0, 0]),
    GB41: () => down(toe.x + 0.047 * s, toe.z - 0.11 * s),
    GB44: () => down(toe.x + 0.048 * s, toe.z - 0.042 * s),
  }
}

// ──────────────────────── ערוץ הכבד (רגל) ────────────────────────
function liverRules(m) {
  const { H, s, front, back, cast, halfWidth, leg, runs } = m
  const pos = m.positions
  const cun = 0.0225 * s
  let toe = { x: 0, z: -1 }
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) > 0 && pos.getY(i) < 0.03 * s && pos.getZ(i) > toe.z) toe = { x: pos.getX(i), z: pos.getZ(i) }
  }
  const down = (x, z) => {
    for (let dz = 0; dz < 0.05; dz += 0.003) {
      const h = cast([x, 0.3 * s, z - dz], [0, -1, 0])
      if (h) return h
    }
    return null
  }
  const legMidZ = y => {
    const r = leg(y)
    const cx = (r.a + r.b) / 2
    const f = front(cx, y)
    const b = back(cx, y)
    return f && b ? (f.point.z + b.point.z) / 2 : 0
  }
  // הצד הפנימי של השוק והירך: קרן מקו האמצע החוצה (רק מתחת למפשעה)
  const medialLeg = (y, forward = 0) => cast([0, y, legMidZ(y) + forward], [1, 0, 0])
  const malleolusY = 0.045 * H
  const ankle = leg(0.05 * H)
  const nippleX = 0.6 * halfWidth(0.722 * H, 0.25)
  const flank = (y, forward) => {
    const list = runs(y, 0.65 * s)
    const gapX = list.length > 1 ? (list[0].b + list[1].a) / 2 : list[0].b + 0.05 * s
    const zf = front(0.02 * s, y)
    const zb = back(0.02 * s, y)
    const mid = (zf.point.z + zb.point.z) / 2
    return cast([gapX, y, mid + forward * (zf.point.z - zb.point.z) / 2], [-1, 0, 0])
  }

  return {
    LR1: () => down(toe.x + 0.006 * s, toe.z - 0.012 * s),
    LR2: () => down(toe.x + 0.013 * s, toe.z - 0.035 * s),
    LR3: () => down(toe.x + 0.012 * s, toe.z - 0.085 * s),
    LR4: () => front(ankle.a + 0.3 * (ankle.crest - ankle.a), malleolusY),
    LR5: () => medialLeg(malleolusY + 5 * cun, 0.014 * s),
    LR8: () => medialLeg(0.29 * H, -0.02 * s),
    LR9: () => medialLeg(0.36 * H, -0.008 * s),
    LR10: () => front(2.2 * cun, 0.475 * H),
    LR11: () => front(2.5 * cun, 0.49 * H),
    LR12: () => front(2.5 * cun, 0.505 * H),
    LR13: () => flank(0.64 * H, 0.3),
    LR14: () => front(nippleX, 0.685 * H),
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
      lung: runRules(lungRules(m), 'lung'),
      spleen: runRules(spleenRules(m), 'spleen'),
      heart: runRules(heartRules(m), 'heart'),
      pericardium: runRules(pericardiumRules(m), 'pericardium'),
      gallbladder: runRules(gallbladderRules(m), 'gallbladder'),
      liver: runRules(liverRules(m), 'liver'),
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

console.log('wrote meridianPaths.ts and tungPoints.ts')
