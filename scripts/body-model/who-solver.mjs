// פותר מיקומים לנקודות הדיקור הקלאסיות לפי התקן של ארגון הבריאות העולמי
// (WHO Standard Acupuncture Point Locations in the Western Pacific Region, 2008).
//
// שימוש:  node scripts/body-model/who-solver.mjs [נתיב-לטקסט-WHO]
// פלט:    src/data/bodyModel/whoPoints.ts
// דגלים:  --report  מדפיס טבלת כיסוי ורשימת נקודות שלא נפתרו, בלי לכתוב קובץ
//
// איך זה עובד
// 1. הטקסט של WHO מפורק ל-361 רשומות {קוד, פיניין, תיאור מיקום}.
// 2. על כל גוף נבנה "שלד" של נקודות ציון ושל יחידות צון פרופורציוניות (B-cun),
//    לפי טבלת המידות של WHO (ראה B_CUN למטה).
// 3. הפותר מזהה תבניות בתיאור (צון מעל/מתחת לנקודה, צון מקו האמצע, גובה חוליה,
//    מרווח בין צלעי וכו') ומחשב מיקום; מה שלא מזוהה נופל לכלל ידני.
// 4. כל מיקום מוטל על פני הגוף בקרן לאורך הנורמל המקומי, כמו surfaceCurve ב-BodyScene.

import fs from 'node:fs'
import * as THREE from 'three'
import { NodeIO } from '@gltf-transform/core'

const SURFACE_OFFSET = 0.004 // כמו ב-seed-positions.mjs: הנקודה מרחפת 4 מ"מ מעל העור
const V = (x, y, z) => new THREE.Vector3(x, y, z)

// ─────────────────────── טבלת המידות הפרופורציוניות (WHO 2008, עמ' 12-13) ───────────────────────
// אלה היחסים ששימשו לבניית השלד. הערכים עצמם נמדדים על כל גוף בנפרד.
export const B_CUN = {
  head: {
    'anterior hairline → posterior hairline (סגיטלי)': 12,
    'glabella → anterior hairline': 3,
    'בין פינות קו השיער הקדמי': 9,
    'בין זיזי הפטמה (mastoid)': 9,
  },
  trunk: {
    'suprasternal notch → xiphisternal junction': 9,
    'xiphisternal junction → טבור': 8,
    'טבור → שפה עליונה של עצם הערווה': 5,
    'בין הפטמות': 8,
    'בין השפות הפנימיות של השכמות': 6,
  },
  arm: {
    'קפל בית השחי (קדמי/אחורי) → קפל המרפק': 9,
    'קפל המרפק → קפל שורש כף היד': 12,
  },
  leg: {
    'שפה עליונה של עצם הערווה → בסיס הפיקה': 18,
    'קודקוד הפיקה → הקרסול הפנימי': 15,
    'הבליטה הצידית של הטרוכנטר הגדול → קפל הברך': 19,
    'קפל העכוז → קפל הברך': 14,
    'קפל הברך → הקרסול החיצוני': 16,
    'הקרסול הפנימי → כף הרגל': 3,
  },
}

// ─────────────────────────────── פירוק הטקסט ───────────────────────────────

const CHANNELS = ['LU', 'LI', 'ST', 'SP', 'HT', 'SI', 'BL', 'KI', 'PC', 'TE', 'GB', 'LR', 'CV', 'GV']
const HEAD_RE = new RegExp(`\\b(${CHANNELS.join('|')}) ?(\\d+) ?: ?([A-Z][a-z]+)`, 'g')

/** שורה שנראית כמו תיאור מיקום ולא כמו תווית איור */
function looksLikeLocation(line) {
  return line.length > 25 &&
    /^(On|In|At|Anterior|Posterior|Superior|Inferior|Lateral|Medial|Between|With)\b/.test(line)
}

export function parseWho(file) {
  const lines = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split('\n')
  const heads = []
  lines.forEach((line, i) => {
    HEAD_RE.lastIndex = 0
    let mt
    while ((mt = HEAD_RE.exec(line))) {
      heads.push({ code: mt[1] + Number(mt[2]), pinyin: mt[3], line: i, rest: line.slice(mt.index + mt[0].length) })
    }
  })
  const seen = new Map()
  for (const h of heads) {
    if (seen.has(h.code)) continue
    let text = h.rest.replace(/^[\s()（）,，、;:.]*/, '').trim()
    if (!looksLikeLocation(text)) {
      text = ''
      for (let i = h.line + 1; i < Math.min(h.line + 12, lines.length); i++) {
        const l = lines[i].trim()
        if (!l || /^Note/.test(l)) { if (/^Note/.test(l)) break; continue }
        HEAD_RE.lastIndex = 0
        if (HEAD_RE.test(l) && !looksLikeLocation(l)) break
        if (looksLikeLocation(l)) { text = l; break }
      }
    }
    // רק פסקת המיקום הראשונה - בלי ההערות
    text = text.split(/\s*Note ?\d?\s*:/)[0].trim().replace(/\bB ?-? ?cun\b/g, 'B-cun')
    seen.set(h.code, { code: h.code, pinyin: h.pinyin, text })
  }
  return [...seen.values()]
}

// ─────────────────────────────── טעינת הגוף ומדידה ───────────────────────────────

async function loadBody(file) {
  const doc = await new NodeIO().read(file)
  const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(prim.getAttribute('POSITION').getArray(), 3))
  geo.setIndex(new THREE.BufferAttribute(prim.getIndices().getArray(), 1))
  geo.computeBoundingBox()
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
}

/** כלי מדידה על גוף אחד - אותו דפוס כמו ב-seed-positions.mjs */
function measure(mesh) {
  const H = mesh.geometry.boundingBox.max.y
  const s = H / 1.78
  const ray = new THREE.Raycaster()
  const cast = (origin, dir) => {
    ray.far = Infinity
    ray.set(origin.clone(), dir.clone().normalize())
    return ray.intersectObject(mesh)[0] ?? null
  }
  const front = (x, y) => cast(V(x, y, 1), V(0, 0, -1))
  const back = (x, y) => cast(V(x, y, -1), V(0, 0, 1))
  const side = (y, z) => cast(V(0.8, y, z), V(-1, 0, 0))
  const down = (x, z) => {
    for (let dz = 0; dz < 0.06; dz += 0.003) {
      const h = cast(V(x, 0.3 * s, z - dz), V(0, -1, 0))
      if (h) return h
    }
    return null
  }
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
  const arm = y => {
    const list = runs(y, 0.7 * s)
    if (list.length < 2) return null
    return list[list.length - 1]
  }
  return { mesh, H, s, cast, front, back, side, down, runs, halfWidth, leg, arm, positions: mesh.geometry.attributes.position }
}

/** הטלה על פני הגוף בקרן קצרה לאורך הנורמל, כמו surfaceCurve ב-BodyScene */
function project(m, q, n) {
  const dir = n.clone().normalize()
  for (const r of [0.05, 0.12, 0.25]) {
    const ray = new THREE.Raycaster(q.clone().addScaledVector(dir, r), dir.clone().negate())
    ray.far = 2 * r
    const hit = ray.intersectObject(m.mesh)[0]
    if (hit?.face) return hit
  }
  return null
}

function toSurfacePoint(hit, hintDir) {
  let n = hit.face.normal.clone().normalize()
  if (hintDir && n.dot(hintDir) < 0) n.negate()
  const p = hit.point.clone().addScaledVector(n, SURFACE_OFFSET)
  return { p, n }
}

// ─────────────────────────────── שלד הגוף ───────────────────────────────

/** ציר של גפה: שרשרת מרכזי חתך, עם אורך קשת ומסגרת אנטומית בכל נקודה */
function limbAxis(samples) {
  // החלקה
  const smooth = samples.map((q, i) => {
    const w = samples.slice(Math.max(0, i - 2), i + 3)
    return {
      y: q.y,
      c: w.reduce((a, b) => a.clone().add(b.c), V(0, 0, 0)).multiplyScalar(1 / w.length),
    }
  })
  const arc = [0]
  for (let i = 1; i < smooth.length; i++) arc.push(arc[i - 1] + smooth[i].c.distanceTo(smooth[i - 1].c))
  const total = arc[arc.length - 1]
  const atArc = a => {
    const t = Math.min(Math.max(a, 0), total)
    let i = 1
    while (i < arc.length - 1 && arc[i] < t) i++
    const f = (t - arc[i - 1]) / Math.max(arc[i] - arc[i - 1], 1e-9)
    const c = smooth[i - 1].c.clone().lerp(smooth[i].c, f)
    const axis = smooth[Math.min(i + 1, smooth.length - 1)].c.clone().sub(smooth[Math.max(i - 2, 0)].c).normalize()
    return { c, axis }
  }
  const seg = i => {
    const dy = smooth[i].y - smooth[i - 1].y
    return { dy, da: arc[i] - arc[i - 1] }
  }
  const arcAtY = y => {
    for (let i = 1; i < smooth.length; i++) {
      const a = smooth[i - 1], b = smooth[i]
      if ((y <= a.y && y >= b.y) || (y >= a.y && y <= b.y)) {
        const { dy, da } = seg(i)
        const f = Math.abs(dy) < 1e-9 ? 0 : (y - a.y) / dy
        return arc[i - 1] + f * da
      }
    }
    // מחוץ לטווח הדגימות - המשך ליניארי לפי השיפוע בקצה
    if (y > smooth[0].y) {
      const { dy, da } = seg(1)
      return Math.abs(dy) < 1e-9 ? 0 : (y - smooth[0].y) / dy * da
    }
    const last = smooth.length - 1
    const { dy, da } = seg(last)
    return Math.abs(dy) < 1e-9 ? total : total + (y - smooth[last].y) / dy * da
  }
  return { total, atArc, arcAtY }
}

function buildSkeleton(m) {
  const { H, s, front, back, cast, halfWidth, positions: pos } = m

  // ---- גו ----
  const clavicleY = 0.798 * H                      // השפה התחתונה של עצם הבריח
  const icsY = n => (0.7985 - 0.0197 * n) * H      // המרווח הבין צלעי ה-n
  const nippleY = icsY(4)
  const umbY = 0.595 * H
  const xiphY = icsY(5)                            // מפגש הגוף עם עצם החרב
  const suprasternalY = 0.820 * H
  const pubicY = 0.5235 * H                        // השפה העליונה של עצם הערווה
  const nippleX = 0.6 * halfWidth(nippleY, 0.25 * s)
  const latCun = nippleX / 4                       // 4 צון מקו האמצע עד הפטמה
  const cunChest = (suprasternalY - xiphY) / 9
  const cunUpperAbd = (xiphY - umbY) / 8
  const cunLowerAbd = (umbY - pubicY) / 5
  /** גובה בבטן/חזה לפי צון מעל (+) או מתחת (-) לטבור */
  const fromUmb = c => c >= 0
    ? (umbY + c * cunUpperAbd <= xiphY ? umbY + c * cunUpperAbd : xiphY + (c - 8) * cunChest)
    : umbY + c * cunLowerAbd

  // ---- חוליות הגב ----
  const C7 = 0.838 * H
  const L5 = 0.570 * H
  const coccyx = 0.497 * H
  /** גובה השפה התחתונה של הזיז הקוצני. n=0 → C7, 1..12 → T1..T12, 13..17 → L1..L5 */
  const vertebra = n => n <= 17 ? C7 - n * (C7 - L5) / 17 : L5 - (n - 17) * (L5 - coccyx) / 5
  const cervical = n => C7 + (7 - n) * (0.885 * H - C7) / 5 // C2..C7

  // ---- ראש ----
  const headCentre = (() => {
    const y = 0.935 * H
    const f = front(0, y), b = back(0, y)
    return V(0, 0.945 * H, (f.point.z + b.point.z) / 2)
  })()
  /** נקודה על קו האמצע של הקרקפת לפי זווית: 0 = קדימה (+z), 90 = מעלה */
  const sagittal = deg => {
    const a = deg * Math.PI / 180
    const dir = V(0, Math.sin(a), Math.cos(a))
    const hit = cast(headCentre, dir)
    return hit ? hit.point : headCentre.clone().addScaledVector(dir, 0.1)
  }
  const sagPts = []
  for (let d = -40; d <= 220; d += 1) sagPts.push({ d, p: sagittal(d) })
  const sagArc = [0]
  for (let i = 1; i < sagPts.length; i++) sagArc.push(sagArc[i - 1] + sagPts[i].p.distanceTo(sagPts[i - 1].p))
  const degAtY = (y, frontSide) => {
    const range = frontSide ? sagPts.filter(q => q.d < 90) : sagPts.filter(q => q.d > 90)
    let best = range[0]
    for (const q of range) if (Math.abs(q.p.y - y) < Math.abs(best.p.y - y)) best = q
    return best.d
  }
  const arcAtDeg = deg => {
    const i = Math.min(Math.max(Math.round(deg + 40), 0), sagPts.length - 1)
    return sagArc[i]
  }
  const degAtArc = a => {
    let i = 1
    while (i < sagArc.length - 1 && sagArc[i] < a) i++
    return sagPts[i].d
  }
  const hairlineDeg = degAtY(0.964 * H, true)      // קו השיער הקדמי
  const postHairDeg = degAtY(0.898 * H, false)     // קו השיער האחורי
  const cunHeadSag = (arcAtDeg(postHairDeg) - arcAtDeg(hairlineDeg)) / 12
  const headHalf = halfWidth(0.94 * H, 0.16 * s)
  const cunHeadLat = headHalf * 0.9 / 4.5          // 9 צון בין זיזי הפטמה
  /** נקודה על הקרקפת: c צון מאחורי קו השיער הקדמי, lat צון הצידה */
  const scalp = (c, lat = 0) => {
    const deg = degAtArc(arcAtDeg(hairlineDeg) + c * cunHeadSag)
    const mid = sagittal(deg)
    const q = mid.clone().setX(lat * cunHeadLat)
    const dir = q.clone().sub(headCentre).normalize()
    return cast(headCentre, dir)
  }
  const glabellaY = 0.964 * H - 3 * cunHeadSag * 0.55 // 3 צון מהגלבלה לקו השיער, על המצח
  const faceHalf = halfWidth(0.93 * H, 0.14 * s)
  const pupilX = 0.44 * faceHalf
  const eyeY = 0.9295 * H

  // ---- זרוע ----
  const armSamples = []
  let armMiss = 0
  for (let y = 0.78 * H; y > 0.40 * H; y -= 0.004 * H) {
    const r = m.arm(y)
    if (!r) { if (armSamples.length && ++armMiss > 4) break; continue }
    armMiss = 0
    const cx = (r.a + r.b) / 2
    const f = front(cx, y), b = back(cx, y)
    if (!f || !b) continue
    armSamples.push({ y, c: V(cx, y, (f.point.z + b.point.z) / 2), w: r.b - r.a })
  }
  // רוחב החתך לפי קודקודים - יציב יותר מרצפי הקרניים כשהאצבעות פרושות
  for (const q of armSamples) {
    let lo = Infinity, hi = -Infinity
    for (let i = 0; i < pos.count; i++) {
      if (pos.getX(i) < 0.10 * H || Math.abs(pos.getY(i) - q.y) > 0.004 * H) continue
      lo = Math.min(lo, pos.getX(i)); hi = Math.max(hi, pos.getX(i))
    }
    q.wv = hi > lo ? hi - lo : q.w
  }
  const armAx = limbAxis(armSamples)
  // קצה האצבעות: הקודקוד הנמוך ביותר בכף היד
  let tipY = Infinity, tipPt = null
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) > 0.3 * s && pos.getY(i) < tipY) { tipY = pos.getY(i); tipPt = V(pos.getX(i), pos.getY(i), pos.getZ(i)) }
  }
  // שורש כף היד: המקום הצר ביותר בשליש התחתון של הזרוע
  let wristY = 0.585 * H
  {
    const lower = armSamples.filter(q => q.y > tipY + 0.08 * s && q.y < tipY + 0.28 * s)
    if (lower.length) wristY = lower.reduce((a, b) => (b.wv < a.wv ? b : a)).y
  }
  const axillaY = 0.745 * H     // קפל בית השחי הקדמי/האחורי
  const cubitalY = 0.658 * H    // קפל המרפק
  const acromionY = 0.822 * H
  const armArc = {
    axilla: armAx.arcAtY(axillaY),
    cubital: armAx.arcAtY(cubitalY),
    wrist: armAx.arcAtY(wristY),
    tip: armAx.total,
  }
  const cunForearm = (armArc.wrist - armArc.cubital) / 12
  const cunUpperArm = (armArc.cubital - armArc.axilla) / 9
  /** מיקום קשת על הזרוע לפי צון מעל שורש כף היד (חיובי = פרוקסימלי) */
  const armFromWrist = c => armArc.wrist - c * cunForearm
  const armFromCubital = c => c >= 0 ? armArc.cubital - c * cunUpperArm : armArc.cubital - c * cunForearm
  const armFromAxilla = c => armArc.axilla + c * cunUpperArm

  // ---- רגל ----
  const legSamples = []
  for (let y = 0.52 * H; y > 0.03 * H; y -= 0.004 * H) {
    const r = m.leg(y)
    if (!r) continue
    const cx = (r.a + r.b) / 2
    const f = front(cx, y), b = back(cx, y)
    if (!f || !b) continue
    legSamples.push({ y, c: V(cx, y, (f.point.z + b.point.z) / 2), w: r.b - r.a })
  }
  const legAx = limbAxis(legSamples)
  const trochanterY = 0.505 * H
  const glutealY = 0.455 * H
  const patellaBaseY = 0.286 * H
  const patellaApexY = 0.261 * H
  const poplitealY = 0.261 * H
  const medMalleolusY = 0.045 * H
  const latMalleolusY = 0.040 * H
  const legArc = {
    pubic: legAx.arcAtY(pubicY),
    trochanter: legAx.arcAtY(trochanterY),
    gluteal: legAx.arcAtY(glutealY),
    patellaBase: legAx.arcAtY(patellaBaseY),
    patellaApex: legAx.arcAtY(patellaApexY),
    popliteal: legAx.arcAtY(poplitealY),
    medMalleolus: legAx.arcAtY(medMalleolusY),
    latMalleolus: legAx.arcAtY(latMalleolusY),
  }
  const cunThigh = (legArc.patellaBase - legArc.pubic) / 18
  const cunShinMed = (legArc.medMalleolus - legArc.patellaApex) / 15
  const cunShinLat = (legArc.latMalleolus - legArc.popliteal) / 16
  const cunHamstring = (legArc.popliteal - legArc.gluteal) / 14

  // ---- כף הרגל ----
  let toe = V(0, 0, -9), heelZ = 9, footMinX = 9, footMaxX = -9
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    if (x <= 0 || x > 0.3 * s || y > 0.035 * s) continue
    if (z > toe.z) toe = V(x, y, z)
    if (z < heelZ) heelZ = z
    footMinX = Math.min(footMinX, x); footMaxX = Math.max(footMaxX, x)
  }
  const footLen = toe.z - heelZ

  return {
    H, s, latCun, nippleX, nippleY, umbY, xiphY, suprasternalY, pubicY, clavicleY,
    icsY, fromUmb, cunChest, cunUpperAbd, cunLowerAbd,
    vertebra, cervical, C7, L5, coccyx,
    headCentre, sagittal, scalp, cunHeadSag, cunHeadLat, hairlineDeg, postHairDeg,
    degAtY, arcAtDeg, degAtArc, glabellaY, faceHalf, pupilX, eyeY, headHalf,
    armAx, armArc, cunForearm, cunUpperArm, armFromWrist, armFromCubital, armFromAxilla,
    tipY, tipPt, wristY, axillaY, cubitalY, acromionY,
    legAx, legArc, cunThigh, cunShinMed, cunShinLat, cunHamstring,
    trochanterY, glutealY, patellaBaseY, patellaApexY, poplitealY, medMalleolusY, latMalleolusY,
    toe, heelZ, footLen, footMinX, footMaxX,
  }
}

// ─────────────────────────── מסגרות אנטומיות על הגפיים ───────────────────────────

/** (u,v) לפי מילת הכיוון: u לאורך קדמי-אחורי, v לאורך צידי-פנימי */
const ASPECT = {
  anterior: [1, 0], posterior: [-1, 0], lateral: [0, 1], medial: [0, -1],
  anterolateral: [0.707, 0.707], anteromedial: [0.707, -0.707],
  posterolateral: [-0.707, 0.707], posteromedial: [-0.707, -0.707],
  radial: [0, 1], ulnar: [0, -1], tibial: [0, -1], fibular: [0, 1],
  palmar: [1, 0], dorsal: [-1, 0], flexor: [1, 0], extensor: [-1, 0],
}

function limbFrame(kind, axis) {
  const a = axis.clone().normalize()
  if (kind === 'arm') {
    // היד תלויה כשכף היד פונה לגוף: הצד הקדמי (כף היד) פונה פנימה, צד האגודל קדימה
    const radial = V(0, 0, 1).addScaledVector(a, -a.z).normalize()
    const palmar = a.clone().cross(radial).normalize()
    return { u: palmar, v: radial }
  }
  const ant = V(0, 0, 1).addScaledVector(a, -a.z).normalize()
  const lat = ant.clone().cross(a).normalize()
  return { u: ant, v: lat }
}

/** נקודה על גפה: קרן מציר הגפה החוצה בכיוון האנטומי (u,v).
 *  הקרן נעצרת בקו האמצע כדי שלא תחצה לצד השני (באגן ובבית השחי הגוף רציף לרוחב). */
function limbPoint(m, ax, kind, arc, uv) {
  const { c, axis } = ax.atArc(arc)
  const f = limbFrame(kind, axis)
  const shoot = dir => {
    const limit = dir.x < -0.05 ? (c.x - 0.006) / -dir.x : Infinity
    const ray = new THREE.Raycaster(c.clone(), dir)
    ray.far = Math.min(0.6, Math.max(limit, 0.005))
    const hit = ray.intersectObject(m.mesh)[0]
    return hit?.face && hit.point.x > 0.004 ? { hit, dir } : null
  }
  const base = f.u.clone().multiplyScalar(uv[0]).addScaledVector(f.v, uv[1]).normalize()
  // בלי משטח פנימי (בירך העליונה, מעל קפל המפשעה) - מסובבים בהדרגה לכיוון הקדמי/האחורי
  const target = f.u.clone().multiplyScalar(uv[0] < 0 ? -1 : 1)
  for (const b of [0, 0.25, 0.5, 0.75, 1]) {
    const dir = base.clone().multiplyScalar(1 - b).addScaledVector(target, b)
    if (dir.lengthSq() < 1e-8) continue
    const out = shoot(dir.normalize())
    if (out) return out
  }
  return null
}

// ─────────────────────────────── הפותר ───────────────────────────────

const WORD_NUM = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7,
  eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
}
const num = w => WORD_NUM[String(w).toLowerCase()] ?? Number(String(w).replace(/(st|nd|rd|th)$/i, ''))

const CODE_RE = '(?:LU|LI|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|CV|GV) ?\\d+'
const norm = c => c.replace(/\s+/g, '').toUpperCase()

/** הכיוון האנטומי מתוך "On the ... aspect of the ..." */
function aspectOf(text) {
  const mt = text.match(/\b(antero|postero)?(lateral|medial|anterior|posterior|radial|ulnar|tibial|fibular|palmar|dorsal)\b/i)
  if (!mt) return null
  const key = ((mt[1] || '') + mt[2]).toLowerCase()
  return ASPECT[key] ?? ASPECT[mt[2].toLowerCase()] ?? null
}

/** לאיזו גפה/אזור שייכת הנקודה */
function regionOf(text) {
  const t = text.toLowerCase()
  if (/\b(finger|thumb|palm of the hand|dorsum of the hand|\bpalm\b)/.test(t)) return 'hand'
  if (/\b(toe|dorsum of the foot|sole of the foot|medial aspect of the foot|lateral aspect of the foot|\bfoot\b)/.test(t)) return 'foot'
  if (/\b(forearm|wrist|elbow|\barm\b|axilla)/.test(t)) return 'arm'
  if (/\b(thigh|knee|ankle|leg|buttock|gluteal|popliteal)/.test(t)) return 'leg'
  if (/\b(head|face|scalp|temple)/.test(t)) return 'head'
  if (/\bneck\b|nuchal/.test(t)) return 'neck'
  if (/\b(back region|lumbar|sacral|scapular|posterior median line|spinous process)/.test(t)) return 'back'
  if (/\b(abdomen|thoracic region|groin|inguinal|anterior median line|umbilicus|epigastric)/.test(t)) return 'front'
  if (/\bshoulder\b/.test(t)) return 'shoulder'
  return null
}

// תיקונים קטנים לנקודות שהניסוח שלהן מבדיל ביניהן בפרט אנטומי דק
// (גיד, עצם, רווח בין עצמות) שהמודל לא מראה. darc במטרים לאורך הגפה, duv בכיוון סביב הגפה.
const TWEAK = {
  LU5: sk => ({ duv: [0, 0.5] }),                                  // לרוחב לגיד הדו-ראשי
  PC3: sk => ({ duv: [0, -0.35] }),                                // פנימה לגיד הדו-ראשי
  TE6: sk => ({ duv: [0, 0.25] }),                                 // אמצע הרווח הבין עצמי
  TE7: sk => ({ duv: [0, -0.35] }),                                // בצד הזרת של עצם האמה
  SI4: sk => ({ darc: 0.7 * sk.cunForearm }),
  SI5: sk => ({ duv: [0, -0.15] }),
  SI9: sk => ({ darc: 0.4 * sk.cunUpperArm, duv: [-0.5, -0.4] }),

  GB35: sk => ({ duv: [-0.45, 0] }),                               // מאחורי עצם השוקית
  GB36: sk => ({ duv: [0.45, 0] }),                                // לפני עצם השוקית
  BL58: sk => ({ duv: [0, 0.35] }),
  BL59: sk => ({ duv: [0, 0.2] }),
  LR7: sk => ({ darc: 0.6 * sk.cunShinMed }),
  // קו הקיבה בשוק עובר אצבע אחת מחוץ לרכס עצם השוק, והקרן מהציר יוצאת פנימה ממנו
  ST35: () => ({ duv: [0, 0.45] }),
  ST36: () => ({ duv: [0, 0.5] }),
  ST37: () => ({ duv: [0, 0.5] }),
  ST38: () => ({ duv: [0, 0.5] }),
  ST39: () => ({ duv: [0, 0.5] }),
  ST40: () => ({ duv: [0, 0.85] }),
}

export function solveBody(m, entries, handRules) {
  const sk = buildSkeleton(m)
  const res = {}          // code -> { p, n, limb, arc, uv }
  const how = {}          // code -> 'auto' | 'rule'
  const rules = handRules(m, sk)

  const store = (code, hit, dir, extra = {}) => {
    if (!hit?.face || !Number.isFinite(hit.point.x + hit.point.y + hit.point.z)) return false
    const sp = toSurfacePoint(hit, dir)
    res[code] = { ...sp, ...extra }
    return true
  }
  const storePoint = (code, q, n, extra = {}) => {
    const hit = project(m, q, n)
    if (!hit) return false
    return store(code, hit, n, extra)
  }

  // ---- כללים ידניים קודם כול ----
  for (const [code, rule] of Object.entries(rules)) {
    try {
      const out = rule(sk, res)
      if (!out) continue
      if (out.face) { if (store(code, out, out.face.normal, { rule: true })) how[code] = 'rule' }
      else if (out.hit) { if (store(code, out.hit, out.dir, { ...out.extra, rule: true })) how[code] = 'rule' }
      else if (out.p) { res[code] = { ...out, rule: true }; how[code] = 'rule' }
    } catch { /* כלל שנכשל - ייפול לפותר האוטומטי */ }
  }

  const byCode = Object.fromEntries(entries.map(e => [e.code, e]))

  // ---- פתרון אוטומטי, במחזורים עד שאין התקדמות ----
  for (let pass = 0; pass < 8; pass++) {
    let progress = false
    for (const e of entries) {
      if (res[e.code]) continue
      const ok = autoResolve(m, sk, e, res, byCode, store, storePoint)
      if (ok) { how[e.code] = 'auto'; progress = true }
    }
    if (!progress) break
  }

  // ---- תיקונים קטנים סביב הגפה ----
  for (const [code, fn] of Object.entries(TWEAK)) {
    const r = res[code]
    if (!r?.limb) continue
    const { darc = 0, duv = [0, 0] } = fn(sk)
    const arc = r.arc + darc
    const uv = [r.uv[0] + duv[0], r.uv[1] + duv[1]]
    const out = limbPoint(m, r.limb === 'arm' ? sk.armAx : sk.legAx, r.limb, arc, uv)
    if (out) store(code, out.hit, out.dir, { limb: r.limb, arc, uv, level: out.hit.point.y })
  }
  return { sk, res, how }
}

/** צון מספרי מתוך "3 B-cun" / "1.5 B-cun" / "0.5 B-cun" */
const CUN_RE = '([0-9]+(?:\\.[0-9]+)?) B-cun'
function autoResolve(m, sk, e, res, byCode, store, storePoint) {
  const t = e.text
  const region = regionOf(t)
  const aspect = aspectOf(t)
  const latClause = side => {
    const tail = side === 'posterior' ? '(?:posterior median line|median sacral crest)' : 'anterior median line'
    const mt = t.match(new RegExp(CUN_RE + ` laterals? to the ${tail}`, 'i'))
    return mt ? Number(mt[1]) * sk.latCun : null
  }
  const onMidline = /on the (anterior|posterior) median line|median line\.?$/i.test(t)
  // קו האמצע של בית השחי בצד בית החזה
  const midaxil = /midaxillary line/i.test(t)
    ? (() => {
      const fwd = t.match(new RegExp(CUN_RE + ' anterior to the midaxillary line', 'i'))
      return { fwd: fwd ? Number(fwd[1]) * sk.latCun : 0 }
    })()
    : null
  const flankAt = (y, forward) => {
    const list = m.runs(y, 0.7 * sk.s)
    const gapX = list.length > 1 ? (list[0].b + list[1].a) / 2 : list[0].b + 0.05 * sk.s
    const zf = m.front(0.02 * sk.s, y), zb = m.back(0.02 * sk.s, y)
    return m.cast(V(gapX, y, (zf.point.z + zb.point.z) / 2 + forward), V(-1, 0, 0))
  }

  // ---------- גב: גובה חוליה + צון מקו האמצע האחורי ----------
  let mt = t.match(/spinous process of the (\w+) (thoracic|lumbar|cervical) vertebra/i)
  if (mt) {
    const n = num(mt[1])
    const y = mt[2].toLowerCase() === 'thoracic' ? sk.vertebra(n)
      : mt[2].toLowerCase() === 'lumbar' ? sk.vertebra(12 + n)
        : sk.cervical(n)
    return store(e.code, m.back(latClause('posterior') ?? 0, y), V(0, 0, -1), { level: y })
  }

  // ---------- גב: חורי העצה ----------
  mt = t.match(/(\w+) posterior sacral foramen/i)
  if (mt) {
    const n = num(mt[1])
    const y = sk.L5 - (n - 0.2) * (sk.L5 - sk.coccyx) / 5
    const x = latClause('posterior') ?? (0.85 + 0.12 * n) * sk.latCun
    return store(e.code, m.back(x, y), V(0, 0, -1), { level: y })
  }
  if (/sacral hiatus/i.test(t)) return store(e.code, m.back(0, sk.coccyx + 0.1 * (sk.L5 - sk.coccyx)), V(0, 0, -1))

  // ---------- בטן: צון מעל/מתחת לטבור ----------
  const UMB = '(?:the )?(?:cent(?:re|er) of (?:the )?)?umbilicus'
  mt = t.match(new RegExp(CUN_RE + ` (superior|inferior) to ${UMB}`, 'i'))
  if (mt) {
    const y = sk.fromUmb(Number(mt[1]) * (mt[2].toLowerCase() === 'superior' ? 1 : -1))
    return store(e.code, m.front(latClause('anterior') ?? 0, y), V(0, 0, 1), { level: y })
  }
  mt = t.match(new RegExp(CUN_RE + ` lateral to ${UMB}`, 'i'))
  if (mt) return store(e.code, m.front(Number(mt[1]) * sk.latCun, sk.umbY), V(0, 0, 1), { level: sk.umbY })
  if (new RegExp(`(?:in the cent(?:re|er) of|at the same level as) ${UMB}`, 'i').test(t)) {
    return store(e.code, m.front(latClause('anterior') ?? 0, sk.umbY), V(0, 0, 1), { level: sk.umbY })
  }

  // ---------- חזה: מרווח בין צלעי ----------
  mt = t.match(/(?:in|at the same level as) the (\w+) intercostal space/i)
  if (mt) {
    const y = sk.icsY(num(mt[1]))
    if (midaxil) return store(e.code, flankAt(y, midaxil.fwd), V(1, 0, 0), { level: y })
    const x = latClause('anterior') ?? (onMidline ? 0 : sk.nippleX)
    return store(e.code, m.front(x, y), V(0, 0, 1), { level: y })
  }
  if (/at the cent(re|er) of the nipple/i.test(t)) {
    return store(e.code, m.front(sk.nippleX, sk.nippleY), V(0, 0, 1), { level: sk.nippleY })
  }

  // ---------- גבהים קבועים בגו, עם היסט צון אופציונלי ----------
  const ANCHORS = [
    [/pubic symphysis/i, sk.pubicY, sk.cunLowerAbd],
    [/xiphisternal (junction|synchondrosis)/i, sk.xiphY, sk.cunUpperAbd],
    [/suprasternal fossa|suprasternal notch/i, sk.suprasternalY, sk.cunChest],
    [/inferior (?:to the clavicle|border of the clavicle)/i, sk.clavicleY, sk.cunChest],
  ]
  for (const [re, y0, unit] of ANCHORS) {
    if (!re.test(t) || (region !== 'front' && region !== 'neck')) continue
    const off = t.match(new RegExp(CUN_RE + ' (superior|inferior) to the (?:cent(?:re|er) of the )?(?:superior border of the )?(?:pubic symphysis|xiphisternal junction|suprasternal fossa|clavicle)', 'i'))
    const y = off ? y0 + Number(off[1]) * (off[2].toLowerCase() === 'superior' ? 1 : -1) * unit : y0
    return store(e.code, m.front(latClause('anterior') ?? 0, y), V(0, 0, 1), { level: y })
  }

  // ---------- ראש: צון מקו השיער ----------
  const pupilLat = /(?:directly )?superior to the cent(?:re|er) of the pupil|superior to the pupil/i.test(t)
    ? Math.max(sk.pupilX / sk.cunHeadLat, 2.2) : null
  const headLatCun = side => {
    const tail = side === 'posterior' ? '(?:posterior median line|median sacral crest)' : 'anterior median line'
    const q = t.match(new RegExp(CUN_RE + ` laterals? to the ${tail}`, 'i'))
    return q ? Number(q[1]) : 0
  }
  mt = t.match(new RegExp(CUN_RE + ' (?:directly )?(?:superior|posterior|within) (?:to )?the anterior hairline', 'i'))
  if (mt) return store(e.code, sk.scalp(Number(mt[1]), pupilLat ?? headLatCun('anterior')), null)
  mt = t.match(new RegExp(CUN_RE + ' (?:directly )?(superior|inferior) to the posterior hairline', 'i'))
  if (mt) {
    const span = (sk.arcAtDeg(sk.postHairDeg) - sk.arcAtDeg(sk.hairlineDeg)) / sk.cunHeadSag
    const c = span - Number(mt[1]) * (mt[2].toLowerCase() === 'superior' ? 1 : -1)
    return store(e.code, sk.scalp(c, headLatCun('posterior')), null)
  }

  // ---------- קו האמצע הקדמי, בלי עוגן אחר ----------
  if (onMidline && /anterior median line/i.test(t) && region === 'front') {
    const lvl = t.match(new RegExp(CUN_RE + ' (superior|inferior) to the ', 'i'))
    if (!lvl) return false
  }

  // ---------- גפיים ----------
  const limb = region === 'arm' ? 'arm' : region === 'leg' ? 'leg' : null
  if (limb) {
    const ax = limb === 'arm' ? sk.armAx : sk.legAx
    const arc = limbArc(sk, limb, t, res, ax)
    if (arc != null) {
      let uv = aspect
      const conn = t.match(new RegExp(`(?:on|of) the (?:curved )?line (?:connecting|from) (${CODE_RE}) (?:with|to) (${CODE_RE})`, 'i'))
      if (conn) {
        const a = res[norm(conn[1])], b = res[norm(conn[2])]
        if (a?.uv && b?.uv && a.arc != null && b.arc != null && Math.abs(a.arc - b.arc) > 1e-6) {
          const f = Math.min(Math.max((arc - a.arc) / (b.arc - a.arc), 0), 1)
          uv = [a.uv[0] + f * (b.uv[0] - a.uv[0]), a.uv[1] + f * (b.uv[1] - a.uv[1])]
        }
      }
      if (!uv && /buttock|gluteal|popliteal/i.test(t)) uv = ASPECT.posterior
      if (!uv) return false
      const out = limbPoint(m, ax, limb, arc, uv)
      if (!out) return false
      return store(e.code, out.hit, out.dir, { limb, arc, uv, level: out.hit.point.y })
    }
  }

  // ---------- "באותו גובה כמו <נקודה>" + היסט צידי ----------
  mt = t.match(new RegExp(`at the same level as (${CODE_RE})`, 'i'))
  if (mt && res[norm(mt[1])]) {
    const ref = res[norm(mt[1])]
    for (const side of ['anterior', 'posterior']) {
      const x = latClause(side)
      if (x == null) continue
      const hit = side === 'anterior' ? m.front(x, ref.p.y) : m.back(x, ref.p.y)
      return store(e.code, hit, V(0, 0, side === 'anterior' ? 1 : -1), { level: ref.p.y })
    }
  }

  // ---------- אמצע הקו בין שתי נקודות ----------
  mt = t.match(new RegExp(`midpoint of the line connecting (${CODE_RE}) (?:with|and) (${CODE_RE})`, 'i'))
  if (mt) {
    const a = res[norm(mt[1])], b = res[norm(mt[2])]
    if (a && b) {
      const n = a.n.clone().add(b.n).normalize()
      return storePoint(e.code, a.p.clone().lerp(b.p, 0.5), n, { level: (a.p.y + b.p.y) / 2 })
    }
  }

  // ---------- היסט צידי מנקודה מוכרת ----------
  mt = t.match(new RegExp(CUN_RE + ` (lateral|medial) to (${CODE_RE})`, 'i'))
  if (mt && res[norm(mt[3])]) {
    const ref = res[norm(mt[3])]
    const sign = mt[2].toLowerCase() === 'lateral' ? 1 : -1
    const q = ref.p.clone()
    q.x += sign * Number(mt[1]) * sk.latCun
    return storePoint(e.code, q, ref.n.clone(), { level: q.y })
  }

  // ---------- היסט אנכי מנקודה מוכרת בגו ----------
  mt = t.match(new RegExp(CUN_RE + ` (superior|inferior) to (${CODE_RE})`, 'i'))
  if (mt && res[norm(mt[3])] && (region === 'front' || region === 'back' || region === 'neck')) {
    const ref = res[norm(mt[3])]
    const unit = ref.p.y > sk.xiphY ? sk.cunChest : ref.p.y > sk.umbY ? sk.cunUpperAbd : sk.cunLowerAbd
    const y = ref.p.y + Number(mt[1]) * (mt[2].toLowerCase() === 'superior' ? 1 : -1) * unit
    const front = ref.n.z >= 0
    const hit = front ? m.front(ref.p.x, y) : m.back(ref.p.x, y)
    return store(e.code, hit, V(0, 0, front ? 1 : -1), { level: y })
  }
  return false
}

/** מיקום הקשת על הגפה מתוך ניסוחי הצון הנפוצים */
function limbArc(sk, limb, t, res, ax) {
  const rx = (tail, extra = '') => t.match(new RegExp(CUN_RE + ' ' + extra + tail, 'i'))
  const dirWord = '(superior|inferior|proximal|distal)'
  const refArc = code => {
    const ref = res[norm(code)]
    if (!ref) return null
    return ref.arc != null ? ref.arc : ax.arcAtY(ref.p.y)
  }

  if (limb === 'arm') {
    let mt = rx('to the (?:palmar|dorsal|anterior|posterior) wrist crease', dirWord + ' ')
    if (mt) return sk.armFromWrist(Number(mt[1]))
    mt = rx('to the cubital crease', dirWord + ' ')
    if (mt) return sk.armFromCubital(Number(mt[1]) * (/superior|proximal/i.test(mt[2]) ? 1 : -1))
    mt = rx('to the (?:anterior|posterior) axillary fold', dirWord + ' ')
    if (mt) return sk.armFromAxilla(Number(mt[1]) * (/superior|proximal/i.test(mt[2]) ? -1 : 1))
    mt = rx('to the acromial angle', dirWord + ' ')
    if (mt) return ax.arcAtY(sk.acromionY) + Number(mt[1]) * sk.cunUpperArm
    mt = rx('to the prominence of (?:the )?(?:the )?olecranon', dirWord + ' ')
    if (mt) {
      const up = /superior|proximal/i.test(mt[2])
      return sk.armArc.cubital + Number(mt[1]) * (up ? -sk.cunUpperArm : sk.cunForearm)
    }
    mt = rx(`to (${CODE_RE})`, dirWord + ' ')
    if (mt) {
      const a = refArc(mt[3])
      if (a == null) return null
      const unit = a < sk.armArc.cubital ? sk.cunUpperArm : sk.cunForearm
      return a + Number(mt[1]) * (/superior|proximal/i.test(mt[2]) ? -1 : 1) * unit
    }
    if (/aspect of the wrist|(?:on|at) the (?:palmar|dorsal) wrist crease/i.test(t)) return sk.armArc.wrist
    if (/aspect of the elbow|at the cubital crease|same level as the cubital crease|olecranon/i.test(t)) return sk.armArc.cubital
    if (/in the axilla|axillary fossa/i.test(t)) return sk.armArc.axilla
    return null
  }

  // רגל
  let mt = rx('to the prominence of the (?:medial|tibial) malleolus', dirWord + ' ')
  if (mt) return sk.legArc.medMalleolus - Number(mt[1]) * sk.cunShinMed
  mt = rx('to the prominence of the (?:lateral|fibular) malleolus', dirWord + ' ')
  if (mt) return sk.legArc.latMalleolus - Number(mt[1]) * sk.cunShinLat
  mt = rx('to the popliteal crease', dirWord + ' ')
  if (mt) {
    const c = Number(mt[1])
    return /superior|proximal/i.test(mt[2]) ? sk.legArc.popliteal - c * sk.cunHamstring : sk.legArc.popliteal + c * sk.cunShinLat
  }
  mt = rx('to the gluteal fold', dirWord + ' ')
  if (mt) return sk.legArc.gluteal + Number(mt[1]) * sk.cunHamstring
  mt = rx('to the (?:base|superior border|medial end of the base) of the patella', dirWord + ' ')
  if (mt) return sk.legArc.patellaBase - Number(mt[1]) * sk.cunThigh
  mt = rx('to the (?:apex|inferior border) of the patella', dirWord + ' ')
  if (mt) return sk.legArc.patellaApex + Number(mt[1]) * sk.cunShinLat
  mt = rx(`to (${CODE_RE})`, dirWord + ' ')
  if (mt) {
    const a = refArc(mt[3])
    if (a == null) return null
    const unit = a > sk.legArc.popliteal ? sk.cunShinLat : sk.cunThigh
    return a + Number(mt[1]) * (/superior|proximal/i.test(mt[2]) ? -1 : 1) * unit
  }
  if (/aspect of the knee|popliteal crease|popliteal fossa/i.test(t)) return sk.legArc.popliteal
  if (/aspect of the ankle/i.test(t)) return (sk.legArc.medMalleolus + sk.legArc.latMalleolus) / 2
  if (/midpoint of the gluteal fold|buttock region.*gluteal fold/i.test(t)) return sk.legArc.gluteal
  if (/inguinal crease|groin region/i.test(t)) return sk.legArc.pubic
  return null
}

export { buildSkeleton, loadBody, measure, project, toSurfacePoint, limbPoint, limbFrame, V, SURFACE_OFFSET }

// ─────────────────────────────── כללים ידניים ───────────────────────────────
// נקודות שהניסוח שלהן אנטומי חופשי (אצבעות, כף רגל, פנים, כתף, צוואר).
// אותו דפוס כמו הכללים ב-seed-positions.mjs.
export function handRules(m, sk) {
  const { H, s, front, back, side, cast, down, halfWidth, runs, positions: pos } = m

  // ---- ראש ופנים ----
  const eyeY = 0.9295 * H
  const hw = sk.faceHalf
  const fz = front(0, eyeY).point.z, bz = back(0, eyeY).point.z
  const headDepth = fz - bz
  const headMid = (fz + bz) / 2
  const earZ = headMid - 0.1 * headDepth        // האוזן מעט מאחורי אמצע הראש
  const earTopY = 0.943 * H
  const neckMid = y => {
    const f = front(0, y), b = back(0, y)
    return (f.point.z + b.point.z) / 2
  }
  const neck = (y, f) => side(y, neckMid(y) + f * 0.5 * (front(0, y).point.z - back(0, y).point.z))
  /** הרקה: y וגובה יחסי בעומק הראש */
  const temple = (y, f) => side(y, headMid + f * headDepth)
  const shoulderHalf = halfWidth(0.82 * H, 0.3 * s)

  // ---- כף היד ----
  /** קודקודי כף היד ברצועת גובה, מקובצים לפי עומק: מקדימה (מורה) לאחור (זרת) */
  const handBands = (y, band = 0.004) => {
    const pts = []
    for (let w = band; w <= 0.016 && !pts.length; w *= 2) {
      for (let i = 0; i < pos.count; i++) {
        if (pos.getX(i) > 0.3 * s && Math.abs(pos.getY(i) - y) < w) pts.push({ x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) })
      }
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
  const tipY = sk.tipY
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
  const index = fingerTip(fingers[0])
  const little = fingerTip(fingers[fingers.length - 1])
  const ring = fingerTip(fingers[fingers.length - 2])
  /** כף היד פונה לגוף: קרן מבין הירך לכף היד החוצה, בעומק יחסי f בין הזרת (0) למורה (1) */
  const palm = (y, f) => {
    const g = handBands(y)
    const z0 = g[g.length - 1].z0, z1 = g[0].z1
    return cast(V(0.3 * s, y, z0 + f * (z1 - z0)), V(1, 0, 0))
  }
  /** גב כף היד: קרן מבחוץ פנימה, בעומק יחסי f בין הזרת (0) למורה (1) */
  const handDorsal = (y, f) => {
    const g = handBands(y)
    if (!g.length) return null
    const z0 = g[g.length - 1].z0, z1 = g[0].z1
    return cast(V(1, y, z0 + f * (z1 - z0)), V(-1, 0, 0))
  }
  /** קרן לאורך z אל שפת כף היד, עם חיפוש קטן ב-x אם היא נופלת בין האצבעות */
  const handEdge = (y, side) => {
    const g = handBands(y)
    if (!g.length) return null
    const grp = side > 0 ? g[0] : g[g.length - 1]
    const x0 = grp.pts.reduce((sum, p) => sum + p.x, 0) / grp.pts.length
    for (const dx of [0, 0.004, -0.004, 0.009, -0.009, 0.016, -0.016]) {
      const h = cast(V(x0 + dx * s, y, side), V(0, 0, -side))
      if (h) return h
    }
    return null
  }
  /** שפת כף היד בצד הזרת: קרן מאחור קדימה */
  const handUlnar = y => handEdge(y, -1)
  /** צד האגודל של כף היד: קרן מלפנים אחורה */
  const handRadial = y => handEdge(y, 1)
  // קצה האגודל: הקודקוד הקדמי ביותר בכף היד
  let thumb = null
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) < 0.3 * s || pos.getY(i) > tipY + 0.14 * s) continue
    if (!thumb || pos.getZ(i) > thumb.z) thumb = { x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) }
  }

  // ---- כף הרגל ----
  const toe = sk.toe
  /** עמודת האצבע בכף הרגל: 1 = הבוהן, 5 = הזרת */
  const toeX = n => toe.x + 0.005 * s + (n - 1) * 0.0142 * s
  /** קצה האצבע ה-n בכף הרגל (האצבעות קצרות יותר ככל שמתרחקים מהבוהן) */
  const toeTipZ = n => {
    let z = -9
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) > 0.035 * s || Math.abs(pos.getX(i) - toeX(n)) > 0.007 * s) continue
      z = Math.max(z, pos.getZ(i))
    }
    return z > -9 ? z : toe.z
  }
  const toeTip = [1, 2, 3, 4, 5].map(toeTipZ)
  /** גב כף הרגל: קרן מלמעלה, z נמדד לאחור מקצה האצבע ה-n */
  const dorsum = (n, dz) => down(toeX(n), toeTip[n - 1] - dz * s)
  /** הצד הפנימי של כף הרגל: קרן מקו האמצע החוצה */
  const medFoot = (y, dz) => cast(V(0, y, toe.z - dz * s), V(1, 0, 0))
  /** הצד החיצוני של כף הרגל: קרן מבחוץ פנימה */
  const latFoot = (y, dz) => cast(V(1, y, toe.z - dz * s), V(-1, 0, 0))
  const sole = dz => cast(V(toe.x + 0.022 * s, -0.1, toe.z - dz * s), V(0, 1, 0))

  // ---- גפיים ----
  const legAt = (arc, uv) => {
    const o = limbPoint(m, sk.legAx, 'leg', arc, uv)
    return o && { hit: o.hit, dir: o.dir, extra: { limb: 'leg', arc, uv, level: o.hit.point.y } }
  }
  const armAt = (arc, uv) => {
    const o = limbPoint(m, sk.armAx, 'arm', arc, uv)
    return o && { hit: o.hit, dir: o.dir, extra: { limb: 'arm', arc, uv, level: o.hit.point.y } }
  }
  /** צד הגו: קרן מהרווח שבין הגו לזרוע פנימה. forward בין -1 (גב) ל-1 (בטן) */
  const flank = (y, forward) => {
    const list = runs(y, 0.7 * s)
    const gapX = list.length > 1 ? (list[0].b + list[1].a) / 2 : list[0].b + 0.05 * s
    const zf = front(0.02 * s, y), zb = back(0.02 * s, y)
    const mid = (zf.point.z + zb.point.z) / 2
    return cast(V(gapX, y, mid + forward * (zf.point.z - zb.point.z) / 2), V(-1, 0, 0))
  }
  const asisY = 0.53 * H
  const asisX = 0.72 * halfWidth(asisY, 0.3 * s)
  /** חיץ הגוף: קרן כלפי מטה מתוך האגן */
  const perineum = dz => cast(V(0.006 * s, 0.52 * H, neckMid(0.52 * H) + dz * s), V(0, -1, 0))

  const sp9 = sk.legArc.medMalleolus - 13 * sk.cunShinMed
  const templeAt = t => temple(0.9605 * H - t * 0.0125 * H, 0.27 - t * 0.29)
  const gb9y = earTopY + 2 * sk.cunHeadSag

  return {
    // ─── פנים וראש ───
    ST1: () => front(0.44 * hw, 0.9215 * H),
    ST2: () => front(0.44 * hw, 0.9155 * H),
    ST3: () => front(0.44 * hw, 0.9035 * H),
    ST4: () => front(0.30 * hw, 0.8845 * H),
    ST5: () => front(0.60 * hw, 0.8675 * H),
    ST6: () => side(0.8755 * H, headMid + 0.10 * headDepth),
    ST7: () => side(0.9105 * H, headMid + 0.06 * headDepth),
    ST9: () => front(0.035 * s, 0.845 * H),
    ST10: () => front(0.036 * s, 0.8365 * H),
    ST11: () => front(0.030 * s, 0.8225 * H),
    ST12: () => front(4 * sk.latCun, 0.8135 * H),
    LI17: () => neck(0.8365 * H, -0.12),
    LI18: () => neck(0.845 * H, 0.10),
    LI19: () => front(0.10 * hw, 0.8955 * H),
    LI20: () => front(0.17 * hw, 0.9005 * H),
    SI16: () => neck(0.845 * H, -0.28),
    SI17: () => side(0.8705 * H, headMid - 0.03 * headDepth),
    SI18: () => front(0.58 * hw, 0.9065 * H),
    SI19: () => side(0.9255 * H, earZ + 0.034 * s),
    BL1: () => front(0.22 * hw, 0.9315 * H),
    BL2: () => front(0.26 * hw, 0.9395 * H),
    BL9: () => back(1.3 * sk.cunHeadLat, 0.9155 * H),
    TE16: () => side(0.866 * H, headMid - 0.045 * headDepth),
    TE17: () => side(0.9005 * H, earZ - 0.010 * s),
    TE18: () => side(0.9125 * H, earZ - 0.024 * s),
    TE19: () => side(0.9265 * H, earZ - 0.022 * s),
    TE20: () => side(0.9485 * H, earZ),
    TE21: () => side(0.9345 * H, earZ + 0.032 * s),
    TE22: () => side(0.9385 * H, earZ + 0.024 * s),
    TE23: () => front(0.80 * hw, 0.9375 * H),
    GB1: () => front(0.66 * hw, 0.9305 * H),
    GB2: () => side(0.9165 * H, earZ + 0.022 * s),
    GB3: () => side(0.9265 * H, earZ + 0.030 * s),
    GB4: () => templeAt(0.25),
    GB5: () => templeAt(0.5),
    GB6: () => templeAt(0.75),
    GB7: () => templeAt(1),
    GB8: () => side(earTopY + 1.5 * sk.cunHeadSag, earZ),
    GB9: () => side(gb9y, earZ - 0.022 * s),
    GB10: () => side(gb9y + (0.9065 * H - gb9y) / 3, earZ - 0.024 * s),
    GB11: () => side(gb9y + 2 * (0.9065 * H - gb9y) / 3, earZ - 0.026 * s),
    GB12: () => side(0.9065 * H, earZ - 0.028 * s),
    GB14: () => front(0.44 * hw, 0.9545 * H),
    GB19: () => back(2.25 * sk.cunHeadLat, 0.9165 * H),
    GB20: () => back(0.042 * s, 0.8885 * H),
    GB21: () => {
      const x = 0.62 * shoulderHalf
      const f = front(x, 0.80 * H), b = back(x, 0.80 * H)
      return cast(V(x, H + 0.05, (f.point.z + b.point.z) / 2), V(0, -1, 0))
    },
    GB26: () => flank(sk.umbY, -0.10),
    GB27: () => front(asisX - 0.8 * sk.latCun, sk.umbY - 3 * sk.cunLowerAbd),
    GB30: () => flank(sk.trochanterY, -0.35),
    BL3: () => sk.scalp(0.5, 0.75),
    BL10: () => back(1.3 * sk.cunHeadLat, sk.cervical(2)),
    GV16: () => back(0, 0.8905 * H),
    GV17: () => back(0, 0.9095 * H),
    GV25: () => front(0, 0.9085 * H),
    GV26: () => front(0, 0.8955 * H),
    GV27: () => front(0, 0.8885 * H),
    GV28: () => front(0, 0.8825 * H),
    CV23: () => front(0, 0.8545 * H),
    CV24: () => front(0, 0.8735 * H),
    CV1: () => perineum(0.01),
    GV1: () => perineum(-0.03),

    // ─── כתף ושכמה ───
    HT1: () => {
      const y = 0.72 * H
      const list = runs(y, 0.7 * s)
      const gapX = list.length > 1 ? (list[0].b + list[1].a) / 2 : list[0].b
      return cast(V(gapX, 0.70 * H, neckMid(y)), V(0, 1, 0))
    },
    LU2: () => front(0.80 * shoulderHalf, 0.8065 * H),
    LI15: () => front(0.86 * shoulderHalf, 0.8185 * H),
    LI16: () => front(0.50 * shoulderHalf, 0.8365 * H),
    SI10: () => back(0.78 * shoulderHalf, 0.800 * H),
    SI11: () => back(0.60 * shoulderHalf, 0.7685 * H),
    SI12: () => back(0.60 * shoulderHalf, 0.8105 * H),
    SI13: () => back(0.40 * shoulderHalf, 0.8035 * H),
    TE13: () => armAt(Math.max(sk.armArc.axilla, 0) + 2.2 * sk.cunUpperArm, [-1, 0.2]),
    TE14: () => back(0.88 * shoulderHalf, 0.8185 * H),
    TE15: () => back(0.50 * shoulderHalf, 0.8225 * H),

    // ─── גו ורגל ───
    ST31: () => legAt(sk.legAx.arcAtY(0.465 * H), ASPECT.anterior),
    SP9: () => legAt(sp9, ASPECT.medial),
    SP11: () => legAt(sk.legArc.patellaBase - 8 * sk.cunThigh, ASPECT.anteromedial),
    SP12: () => front(3.5 * sk.latCun, sk.pubicY),
    LR7: () => legAt(sp9, ASPECT.posteromedial),
    LR13: () => flank(0.640 * H, 0.30),
    GB25: () => flank(0.615 * H, -0.20),
    GB28: () => front(asisX - 0.4 * sk.latCun, asisY - 0.4 * sk.latCun),
    GB29: () => flank((asisY + sk.trochanterY) / 2, 0.30),
    GB31: () => legAt(sk.legAx.arcAtY(0.375 * H), ASPECT.lateral),
    GB34: () => legAt(sk.legArc.popliteal + 2 * sk.cunShinLat, ASPECT.lateral),
    BL35: () => back(0.5 * sk.latCun, sk.coccyx + 0.2 * (sk.L5 - sk.coccyx)),
    BL57: () => legAt(sk.legArc.popliteal + 8 * sk.cunShinLat, ASPECT.posterior),

    // ─── כף הרגל ───
    ST42: () => dorsum(2, 0.125),
    ST43: () => dorsum(2, 0.075),
    ST44: () => dorsum(2, 0.038),
    ST45: () => dorsum(2, 0.010),
    SP1: () => medFoot(0.014 * s, 0.012),
    SP2: () => medFoot(0.016 * s, 0.040),
    SP3: () => medFoot(0.016 * s, 0.070),
    SP4: () => medFoot(0.022 * s, 0.100),
    SP5: () => medFoot(0.036 * H, 0.160),
    KI1: () => sole(0.33 * sk.footLen / s),
    KI2: () => medFoot(0.020 * s, 0.5 * sk.footLen / s),
    KI4: () => medFoot(0.030 * H, 0.215),
    KI5: () => medFoot(0.029 * H, 0.195),
    KI6: () => medFoot(0.032 * H, 0.180),
    BL61: () => latFoot(0.024 * H, 0.180),
    BL62: () => latFoot(0.028 * H, 0.165),
    BL63: () => latFoot(0.020 * H, 0.140),
    BL64: () => latFoot(0.013 * s, 0.100),
    BL65: () => latFoot(0.013 * s, 0.060),
    BL66: () => latFoot(0.012 * s, 0.040),
    BL67: () => dorsum(5, 0.012),
    GB41: () => dorsum(4, 0.105),
    GB42: () => dorsum(4, 0.075),
    GB43: () => dorsum(4, 0.040),
    GB44: () => dorsum(4, 0.012),
    LR1: () => dorsum(1, 0.012),
    LR2: () => dorsum(1, 0.038),
    LR3: () => dorsum(1, 0.085),

    // ─── כף היד ───
    LU10: () => handRadial(tipY + 0.120 * s),
    LU11: () => cast(V(thumb.x, thumb.y + 0.006 * s, thumb.z + 0.01), V(0, 0, -1)),
    LI1: () => cast(V(index.cx, index.y + 0.008 * s, 1), V(0, 0, -1)),
    LI2: () => handRadial(tipY + 0.055 * s),
    LI3: () => handDorsal(tipY + 0.085 * s, 0.92),
    LI4: () => handDorsal(tipY + 0.110 * s, 0.82),
    HT8: () => palm(tipY + 0.085 * s, 0.22),
    HT9: () => cast(V(1, little.y + 0.008 * s, little.z0 + 0.7 * (little.z1 - little.z0)), V(-1, 0, 0)),
    SI1: () => cast(V(little.cx, little.y + 0.008 * s, -1), V(0, 0, 1)),
    SI2: () => handUlnar(tipY + 0.055 * s),
    SI3: () => handUlnar(tipY + 0.090 * s),
    PC8: () => palm(tipY + 0.085 * s, 0.62),
    PC9: () => {
      const middle = fingerTip(fingers[1])
      return cast(V(middle.cx, middle.y - 0.05, middle.cz), V(0, 1, 0))
    },
    TE1: () => cast(V(1, ring.y + 0.008 * s, ring.z0 + 0.3 * (ring.z1 - ring.z0)), V(-1, 0, 0)),
    TE2: () => cast(V(1, tipY + 0.065 * s, (ring.z0 + little.z1) / 2), V(-1, 0, 0)),
    TE3: () => handDorsal(tipY + 0.095 * s, 0.22),
  }
}

// ─────────────────────────────── main ───────────────────────────────

export const MERIDIAN_ID = {
  LU: 'lung', LI: 'largeIntestine', ST: 'stomach', SP: 'spleen', HT: 'heart',
  SI: 'smallIntestine', BL: 'bladder', KI: 'kidney', PC: 'pericardium',
  TE: 'tripleBurner', GB: 'gallbladder', LR: 'liver',
}
export const CHANNEL_ORDER = ['LU', 'LI', 'ST', 'SP', 'HT', 'SI', 'BL', 'KI', 'PC', 'TE', 'GB', 'LR', 'CV', 'GV']

const isMain = (process.argv[1] ?? '').split('\\').join('/').endsWith('scripts/body-model/who-solver.mjs')

if (isMain) {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'))
  const txt = args[0] ?? process.env.WHO_TEXT
  if (!txt) { console.error('usage: node scripts/body-model/who-solver.mjs <who-plain.txt>'); process.exit(1) }
  const entries = parseWho(txt)
  const out = {}
  const stats = {}
  for (const [sex, file] of [['female', 'public/models/body-female.glb'], ['male', 'public/models/body-male.glb']]) {
    const mesh = await loadBody(file)
    const m = measure(mesh)
    const { res, how } = solveBody(m, entries, handRules)
    out[sex] = { res, how }
    stats[sex] = how
  }
  const how = stats.female
  const perChannel = {}
  for (const e of entries) {
    const ch = e.code.match(/^[A-Z]+/)[0]
    perChannel[ch] ??= { auto: 0, rule: 0, none: [] }
    const k = how[e.code]
    if (k) perChannel[ch][k]++
    else perChannel[ch].none.push(e.code)
  }
  let A = 0, R = 0, N = 0
  for (const ch of CHANNEL_ORDER) {
    const c = perChannel[ch]
    if (!c) continue
    A += c.auto; R += c.rule; N += c.none.length
    console.log(ch.padEnd(3), 'auto', String(c.auto).padStart(3), 'rule', String(c.rule).padStart(3), 'missing', String(c.none.length).padStart(3), c.none.join(' '))
  }
  console.log('TOTAL auto', A, 'rule', R, 'missing', N, 'of', entries.length)

  if (process.argv.includes('--report')) process.exit(0)

  // ---- כתיבת whoPoints.ts: רק 12 הערוצים הראשיים, בסדר הקאנוני ----
  const codes = entries
    .filter(e => MERIDIAN_ID[e.code.match(/^[A-Z]+/)[0]])
    .filter(e => out.female.res[e.code] && out.male.res[e.code])
    .sort((a, b) => {
      const ca = a.code.match(/^([A-Z]+)(\d+)$/), cb = b.code.match(/^([A-Z]+)(\d+)$/)
      return CHANNEL_ORDER.indexOf(ca[1]) - CHANNEL_ORDER.indexOf(cb[1]) || Number(ca[2]) - Number(cb[2])
    })
  const r = v => +v.toFixed(4)
  const vec = v => `[${r(v.x)}, ${r(v.y)}, ${r(v.z)}]`
  const body = sex => codes
    .map(e => `    ${e.code}: { p: ${vec(out[sex].res[e.code].p)}, n: ${vec(out[sex].res[e.code].n)} },`)
    .join('\n')
  const info = codes
    .map(e => `  ${e.code}: { pinyin: '${e.pinyin}', meridian: '${MERIDIAN_ID[e.code.match(/^[A-Z]+/)[0]]}' },`)
    .join('\n')

  fs.writeFileSync('src/data/bodyModel/whoPoints.ts', `// נוצר על ידי scripts/body-model/who-solver.mjs - לא לערוך ביד.
// מקור: WHO Standard Acupuncture Point Locations in the Western Pacific Region (2008).
import type { BodySex, SurfacePoint } from './meridians'

/** מיקומי הנקודות לפי התקן של ארגון הבריאות העולמי (WHO 2008), בצד שמאל של המטופל */
export const whoPoints: Record<BodySex, Record<string, SurfacePoint>> = {
  female: {
${body('female')}
  },
  male: {
${body('male')}
  },
}

/** שם הנקודה ומזהה הערוץ שלה באפליקציה */
export const whoPointInfo: Record<string, { pinyin: string; meridian: string }> = {
${info}
}
`)
  console.log('wrote src/data/bodyModel/whoPoints.ts with', codes.length, 'points per body')
}
