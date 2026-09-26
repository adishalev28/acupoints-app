// יד מוגדלת בחלון קטן בתוך הקנבס, עם מצלמה משלה: כף היד (או גב היד) פונה למטופל
// והאצבעות למעלה, ועליה נקודות האצבע של דונג. בגוף עצמו כף היד פונה לירך,
// ולכן בלי החלון הזה אי אפשר לראות את רוב הנקודות.

import * as THREE from 'three'
import type { SurfacePoint, Vec3 } from '../../data/bodyModel/meridians'

export interface HandFrame {
  wrist: Vec3
  palmNormal: Vec3
  fingerDir: Vec3
  radialDir: Vec3
}

export interface InsetPoint {
  id: string
  points: SurfacePoint[]
}

export interface InsetRect {
  left: number
  top: number
  width: number
  height: number
}

const SKIN = '#d9b8a3'
const PANEL = '#13292b'

export class HandInset {
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10)
  private group = new THREE.Group()
  private pointsGroup = new THREE.Group()
  private handMesh: THREE.Mesh | null = null
  private rect: InsetRect | null = null
  private pulse: THREE.Mesh[] = []
  /** גבולות היד בלבד, במערכת של החלון. הגיאומטריה מחזיקה את כל קודקודי הגוף, ולכן לא משתמשים בגבולות שלה */
  private handBox = new THREE.Box3()

  constructor() {
    this.scene.background = new THREE.Color(PANEL)
    this.scene.add(new THREE.HemisphereLight('#eef8f6', '#44605d', 1.4))
    const key = new THREE.DirectionalLight('#fff4ea', 1.8)
    key.position.set(0.4, 0.6, 1)
    this.scene.add(key)
    this.group.add(this.pointsGroup)
    this.scene.add(this.group)
  }

  get visible() {
    return !!this.rect && !!this.handMesh
  }

  setRect(rect: InsetRect | null) {
    this.rect = rect && rect.width > 20 && rect.height > 20 ? rect : null
    if (this.rect) {
      this.camera.aspect = this.rect.width / this.rect.height
      this.camera.updateProjectionMatrix()
      this.frame()
    }
  }

  /** בונה את היד מתוך גוף המודל: כל המשולשים שמעבר לשורש כף היד השמאלית */
  setHand(body: THREE.Mesh | null, frame: HandFrame | null, side: 'palmar' | 'dorsal') {
    if (this.handMesh) {
      this.group.remove(this.handMesh)
      this.handMesh.geometry.dispose()
      this.handMesh = null
    }
    if (!body || !frame) return

    const wrist = new THREE.Vector3(...frame.wrist)
    const finger = new THREE.Vector3(...frame.fingerDir).normalize()
    const src = body.geometry
    const pos = src.attributes.position
    const index = src.index
    const keep: number[] = []
    const inside = (i: number) => {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      // מעבר לשורש כף היד, וקרוב אליו - אחרת נכנסת גם הרגל, שגם היא "מתחת" לשורש כף היד
      const along = (x - wrist.x) * finger.x + (y - wrist.y) * finger.y + (z - wrist.z) * finger.z
      const dist = Math.hypot(x - wrist.x, y - wrist.y, z - wrist.z)
      return x > 0 && along > -0.012 && dist < 0.24
    }
    const triCount = index ? index.count / 3 : pos.count / 3
    for (let t = 0; t < triCount; t++) {
      const a = index ? index.getX(t * 3) : t * 3
      const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
      const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
      if (inside(a) && inside(b) && inside(c)) keep.push(a, b, c)
    }
    const geo = new THREE.BufferGeometry()
    // עותק של הנתונים, כדי שפינוי היד לא ימחק את החוצץ של הגוף עצמו
    geo.setAttribute('position', pos.clone())
    if (src.attributes.normal) geo.setAttribute('normal', src.attributes.normal.clone())
    geo.setIndex(keep)
    this.handMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.7 }))
    this.group.add(this.handMesh)

    // בסיס היד: רדיאלי לימין המסך, האצבעות למעלה, כף היד (או הגב) אל המצלמה
    const palm = new THREE.Vector3(...frame.palmNormal).normalize()
    const radial = new THREE.Vector3(...frame.radialDir)
    radial.sub(finger.clone().multiplyScalar(radial.dot(finger))).normalize()
    const out = side === 'palmar' ? palm : palm.clone().negate()
    // x = לרוחב האצבעות, y = לאורכן, z = מהיד אל הצופה
    const x = new THREE.Vector3().crossVectors(finger, out).normalize()
    const basis = new THREE.Matrix4().makeBasis(x, finger, out).invert()
    this.group.matrixAutoUpdate = false
    this.group.matrix.copy(basis).multiply(new THREE.Matrix4().makeTranslation(-wrist.x, -wrist.y, -wrist.z))
    this.group.updateMatrixWorld(true)
    this.handBox.makeEmpty()
    const v = new THREE.Vector3()
    for (const i of new Set(keep)) this.handBox.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(this.group.matrix))
    this.frame()
  }

  /** נקודות האצבע: כולן קטנות, והנבחרת גדולה ומהבהבת */
  setPoints(points: InsetPoint[], selectedId: string | null) {
    for (const child of [...this.pointsGroup.children]) {
      ;(child as THREE.Mesh).geometry?.dispose()
      this.pointsGroup.remove(child)
    }
    this.pulse = []
    const normal = new THREE.MeshBasicMaterial({ color: '#ffe08a', toneMapped: false })
    const chosen = new THREE.MeshBasicMaterial({ color: '#fff6de', toneMapped: false })
    const halo = new THREE.MeshBasicMaterial({ color: '#ffc85c', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
    const pickMat = new THREE.MeshBasicMaterial({ visible: false })
    for (const { id, points: sps } of points) {
      const isSel = id === selectedId
      for (const sp of sps) {
        const p = new THREE.Vector3(...sp.p)
        const dot = new THREE.Mesh(new THREE.SphereGeometry(isSel ? 0.0032 : 0.0021, 12, 8), isSel ? chosen : normal)
        dot.position.copy(p)
        const pick = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), pickMat)
        pick.position.copy(p)
        pick.userData.fingerPointId = id
        this.pointsGroup.add(dot, pick)
        if (isSel) {
          const ring = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 16, 10), halo)
          ring.position.copy(p)
          this.pointsGroup.add(ring)
          this.pulse.push(ring)
        }
      }
    }
    this.group.updateMatrixWorld(true)
  }

  /** ממקם את המצלמה כך שכל היד נכנסת לחלון */
  private frame() {
    if (!this.handMesh || !this.rect || this.handBox.isEmpty()) return
    const box = this.handBox
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const fov = THREE.MathUtils.degToRad(this.camera.fov)
    const fitHeight = (size.y * 1.12) / 2 / Math.tan(fov / 2)
    const fitWidth = (size.x * 1.12) / 2 / Math.tan(fov / 2) / this.camera.aspect
    const dist = Math.max(fitHeight, fitWidth) + size.z
    this.camera.position.set(center.x, center.y, center.z + dist)
    this.camera.lookAt(center)
    this.camera.updateMatrixWorld()
  }

  contains(clientX: number, clientY: number, canvasRect: DOMRect) {
    if (!this.visible) return false
    const r = this.rect!
    const x = clientX - canvasRect.left, y = clientY - canvasRect.top
    return x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height
  }

  pick(clientX: number, clientY: number, canvasRect: DOMRect): string | null {
    if (!this.contains(clientX, clientY, canvasRect)) return null
    const r = this.rect!
    const ndc = new THREE.Vector2(
      ((clientX - canvasRect.left - r.left) / r.width) * 2 - 1,
      -((clientY - canvasRect.top - r.top) / r.height) * 2 + 1,
    )
    const ray = new THREE.Raycaster()
    ray.setFromCamera(ndc, this.camera)
    const hit = ray.intersectObjects(this.pointsGroup.children, false).find(h => h.object.userData.fingerPointId)
    return hit ? hit.object.userData.fingerPointId : null
  }

  render(renderer: THREE.WebGLRenderer, canvasHeight: number, time: number) {
    if (!this.visible) return
    const r = this.rect!
    const s = 1 + 0.35 * (0.5 + 0.5 * Math.sin(time * 4))
    for (const ring of this.pulse) ring.scale.setScalar(s)
    const y = canvasHeight - r.top - r.height
    renderer.setScissorTest(true)
    renderer.setScissor(r.left, y, r.width, r.height)
    renderer.setViewport(r.left, y, r.width, r.height)
    const full = renderer.getSize(new THREE.Vector2())
    renderer.render(this.scene, this.camera)
    renderer.setScissorTest(false)
    renderer.setViewport(0, 0, full.x, full.y)
  }

  dispose() {
    this.handMesh?.geometry.dispose()
    for (const child of this.pointsGroup.children) (child as THREE.Mesh).geometry?.dispose()
  }
}
