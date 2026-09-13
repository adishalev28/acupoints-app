// ממיר את חבילת הגופים מ-Sketchfab לקבצי GLB שהאפליקציה טוענת.
//
// מקור: "Male & Female Base Mesh Pack" מאת FormForge3D (aleenasani841), CC BY 4.0
// https://sketchfab.com/3d-models/male-female-base-mesh-pack-ec3041da6a214c1c995f3d47dc7d04c1
//
// שינויים לצניעות מול מטופלים (הרישיון מחייב לציין אותם בקרדיט):
//   אישה - החזה הוקטן מעט והאגן הוחלק.  גבר - האגן הוחלק.
//
// שימוש:  node scripts/body-model/convert-fbx.mjs <path/to/HumanLowPolyBaseMesh.fbx>
// פלט:    public/models/body-female.glb, public/models/body-male.glb
// אחרי המרה מחדש צריך להריץ גם את seed-stomach.mjs, כי המיקומים תלויים בגוף.

import fs from 'node:fs'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Document, NodeIO } from '@gltf-transform/core'

globalThis.self = globalThis
// אין DOM ב-Node, והטקסטורות לא נחוצות - הצבע נקבע באפליקציה
THREE.TextureLoader.prototype.load = () => new THREE.Texture()

const HEIGHT_M = 1.78 // גובה הגבר במטרים; האישה נשארת ביחס המקורי אליו
const SOURCE_MALE_HEIGHT = 24.14
const BREAST_ITERATIONS = 14 // "עדין". 35 יצא שטוח מדי
const GROIN_ITERATIONS = 40

const fbxPath = process.argv[2]
if (!fbxPath) {
  console.error('Usage: node scripts/body-model/convert-fbx.mjs <HumanLowPolyBaseMesh.fbx>')
  process.exit(1)
}

function loadMeshes(file) {
  const buf = fs.readFileSync(file)
  const root = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '')
  root.updateMatrixWorld(true)
  const out = {}
  root.traverse(o => {
    if (!o.isMesh) return
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', o.geometry.attributes.position.clone())
    g.applyMatrix4(o.matrixWorld)
    out[o.name] = mergeVertices(g, 1e-3) // ריתוך קודקודים כדי שיהיו שכנים להחלקה
  })
  return out
}

function neighbors(geo) {
  const idx = geo.index.array
  const sets = Array.from({ length: geo.attributes.position.count }, () => new Set())
  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]]
    sets[a].add(b).add(c); sets[b].add(a).add(c); sets[c].add(a).add(b)
  }
  return sets.map(s => Uint32Array.from(s))
}

/** החלקת Laplacian משוקללת - מכווצת בליטות בתוך האזור בלי לחתוך אותו */
function smoothRegion(geo, weights, iterations, lambda = 0.5) {
  const pos = geo.attributes.position.array
  const nb = neighbors(geo)
  const tmp = new Float32Array(pos.length)
  for (let it = 0; it < iterations; it++) {
    tmp.set(pos)
    for (let v = 0; v < weights.length; v++) {
      if (weights[v] <= 0) continue
      const list = nb[v], f = (weights[v] * lambda) / list.length, i3 = v * 3
      let x = 0, y = 0, z = 0
      for (const j of list) { x += pos[j * 3]; y += pos[j * 3 + 1]; z += pos[j * 3 + 2] }
      tmp[i3] += f * (x - pos[i3] * list.length)
      tmp[i3 + 1] += f * (y - pos[i3 + 1] * list.length)
      tmp[i3 + 2] += f * (z - pos[i3 + 2] * list.length)
    }
    pos.set(tmp)
  }
}

/** משקל 0..1 עם מעבר רך סביב אליפסואידים, רק בחזית הגוף */
function ellipsoidWeights(geo, regions) {
  const p = geo.attributes.position
  const w = new Float32Array(p.count)
  for (let v = 0; v < p.count; v++) {
    for (const r of regions) {
      if (p.getZ(v) < r.frontOnly) continue
      const d = Math.hypot((p.getX(v) - r.x) / r.rx, (p.getY(v) - r.y) / r.ry, (p.getZ(v) - r.z) / r.rz)
      if (d < 1) { const t = 1 - d; w[v] = Math.max(w[v], t * t * (3 - 2 * t)) }
    }
  }
  return w
}

function frame(geo) {
  geo.computeBoundingBox()
  const b = geo.boundingBox
  return { cx: (b.min.x + b.max.x) / 2, y0: b.min.y, H: b.max.y - b.min.y }
}

/** מטרים, כפות הרגליים על הרצפה, ממורכז, הפנים לכיוון +z */
function normalize(geo) {
  const { cx, y0 } = frame(geo)
  const s = HEIGHT_M / SOURCE_MALE_HEIGHT
  geo.translate(-cx, -y0, 0)
  geo.scale(s, s, s)
}

async function writeGlb(file, name, geo) {
  geo.computeVertexNormals()
  const doc = new Document()
  const buffer = doc.createBuffer()
  const acc = (type, array) => doc.createAccessor().setType(type).setArray(array).setBuffer(buffer)
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', acc('VEC3', new Float32Array(geo.attributes.position.array)))
    .setAttribute('NORMAL', acc('VEC3', new Float32Array(geo.attributes.normal.array)))
    .setIndices(acc('SCALAR', new Uint32Array(geo.index.array)))
  doc.createScene().addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)))
  await new NodeIO().write(file, doc)
  console.log(file, (fs.statSync(file).size / 1024).toFixed(0), 'KB')
}

const meshes = loadMeshes(fbxPath)

{
  const g = meshes.LOD7 // האישה
  const { cx, y0, H } = frame(g)
  const breasts = [-1, 1].map(s => ({ x: cx + s * 0.93, y: y0 + 0.725 * H, z: 1.9, rx: 1.35, ry: 1.55, rz: 1.6, frontOnly: 0.6 }))
  smoothRegion(g, ellipsoidWeights(g, breasts), BREAST_ITERATIONS)
  const groin = [{ x: cx, y: y0 + 0.495 * H, z: 1.5, rx: 0.9, ry: 0.9, rz: 1.2, frontOnly: 0.5 }]
  smoothRegion(g, ellipsoidWeights(g, groin), GROIN_ITERATIONS)
  normalize(g)
  await writeGlb('public/models/body-female.glb', 'female', g)
}

{
  const g = meshes.Male1
  const { cx, y0, H } = frame(g)
  const groin = [{ x: cx, y: y0 + 0.49 * H, z: 0.7, rx: 0.9, ry: 1.0, rz: 1.2, frontOnly: -0.2 }]
  smoothRegion(g, ellipsoidWeights(g, groin), GROIN_ITERATIONS)
  normalize(g)
  await writeGlb('public/models/body-male.glb', 'male', g)
}
