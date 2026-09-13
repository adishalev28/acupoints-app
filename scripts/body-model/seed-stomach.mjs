// מיקום ראשוני של ערוץ הקיבה על שני הגופים, מתוך פרופורציות הגוף.
// זו נקודת פתיחה בקירוב בלבד - עדי מתקן במצב העריכה (/body?edit=1).
//
// שימוש:  node scripts/body-model/seed-stomach.mjs
// פלט:    src/data/bodyModel/meridianPaths.ts
// ⚠️ דורס תיקונים ידניים שכבר הוכנסו לקובץ. להריץ רק אחרי המרת גופים מחדש.

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

function seedFor(mesh) {
  const H = mesh.geometry.boundingBox.max.y
  const s = H / 1.78
  const ray = new THREE.Raycaster()
  const cast = (origin, dir) => {
    ray.set(new THREE.Vector3(...origin), new THREE.Vector3(...dir).normalize())
    return ray.intersectObject(mesh)[0] ?? null
  }
  const front = (x, y) => cast([x, y, 1], [0, 0, -1])
  const side = (y, z) => cast([0.5, y, z], [-1, 0, 0])
  // האצבעות קצרות מהבוהן - אם הקרן עוברת בין אצבעות או מעבר לקצה, זזים אחורה
  const down = (x, z) => {
    for (let dz = 0; dz < 0.05; dz += 0.003) {
      const h = cast([x, 0.3 * s, z - dz], [0, -1, 0])
      if (h) return h
    }
    return null
  }

  // רוחב הראש והגו: סורקים ימינה עד שהקרן מפספסת או קופצת אחורה
  const halfWidth = (y, maxX) => {
    let last = 0, prevZ = null
    for (let x = 0; x < maxX; x += 0.003) {
      const h = front(x, y)
      if (!h || (prevZ !== null && prevZ - h.point.z > 0.04)) break
      prevZ = h.point.z; last = x
    }
    return last
  }
  // רגל בגובה נתון: הקטע הרחב ביותר של פגיעות, ונקודת החזית (עצם השוק)
  const leg = y => {
    const runs = []; let cur = null
    for (let x = 0.02; x < 0.26 * s; x += 0.003) {
      const h = front(x, y)
      if (h) {
        if (!cur) { cur = { a: x, b: x, crest: x, z: h.point.z }; runs.push(cur) }
        cur.b = x
        if (h.point.z > cur.z) { cur.z = h.point.z; cur.crest = x }
      } else cur = null
    }
    return runs.sort((p, q) => (q.b - q.a) - (p.b - p.a))[0]
  }

  const eyeY = 0.93 * H
  const hw = halfWidth(eyeY, 0.12)
  const faceZ = front(0, eyeY).point.z
  const backZ = cast([0, eyeY, -1], [0, 0, 1]).point.z
  const headDepth = faceZ - backZ
  const headMid = (faceZ + backZ) / 2
  const nippleX = 0.6 * halfWidth(0.722 * H, 0.25)
  const abdX = 0.5 * nippleX
  const thigh = y => { const r = leg(y); return r.a + 0.6 * (r.b - r.a) }

  // קצה האצבעות: הקודקוד הקדמי ביותר ליד הרצפה בצד שמאל
  const pos = mesh.geometry.attributes.position
  let toe = { x: 0, z: -1 }
  for (let i = 0; i < pos.count; i++) {
    if (pos.getX(i) > 0 && pos.getY(i) < 0.03 * s && pos.getZ(i) > toe.z) toe = { x: pos.getX(i), z: pos.getZ(i) }
  }
  const ankle = leg(0.05 * H)
  const ankleZ = front(ankle.crest, 0.05 * H).point.z
  const secondToeX = toe.x + 0.018 * s

  const shin = y => leg(y).crest
  const rules = {
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

  const r3 = v => [+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)]
  const out = {}
  for (const [id, rule] of Object.entries(rules)) {
    const hit = rule()
    if (!hit) throw new Error(`${id}: ray missed the body`)
    const n = hit.face.normal.clone().normalize()
    out[id] = { p: r3(hit.point.clone().addScaledVector(n, SURFACE_OFFSET)), n: r3(n) }
  }
  return out
}

const female = seedFor(await loadBody('public/models/body-female.glb'))
const male = seedFor(await loadBody('public/models/body-male.glb'))

const body = sex => JSON.stringify({ stomach: sex }, null, 2)
  .replace(/\[\s+([-\d.e]+),\s+([-\d.e]+),\s+([-\d.e]+)\s+\]/g, '[$1, $2, $3]')
fs.writeFileSync('src/data/bodyModel/meridianPaths.ts', `// נוצר על ידי scripts/body-model/seed-stomach.mjs ומתוקן ידנית ממצב העריכה.
// מיקומים במטרים, בצד שמאל של המטופל (x חיובי). הצד השני משתקף אוטומטית.
import type { BodySex, SurfacePoint } from './meridians'

type Paths = Record<string, Record<string, SurfacePoint>>

export const meridianPaths: Record<BodySex, Paths> = {
  female: ${body(female).replace(/\n/g, '\n  ')},
  male: ${body(male).replace(/\n/g, '\n  ')},
}
`)
console.log('wrote src/data/bodyModel/meridianPaths.ts')
