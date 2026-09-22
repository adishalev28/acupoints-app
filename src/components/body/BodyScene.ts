// סצנת התלת ממד של מסך הגוף: טעינת הגוף, ציור המרידיאן כקו זוהר, ולחיצות.
// three.js ישירות, בלי react-three-fiber (שעדיין לא תומך בגרסת React של האפליקציה).

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'
import type { BodySex, MeridianDef, SurfacePoint, Vec3 } from '../../data/bodyModel/meridians'
import { createFlow, createGallopingHorse, createHeart, createKidneys, createLiver, createLungs, createNeedlePoint, createSpleen, type Animated } from './treatmentVisuals'
import type { TungGroup } from '../../data/bodyModel/tungGroups'

export type ViewPreset = 'front' | 'side' | 'back' | 'head' | 'leg' | 'treatment'

export interface BodySceneEvents {
  onMeridianTap?: (meridianId: string) => void
  /** לחיצה על נקודת דונג דולקת */
  onTungPointTap?: () => void
  onMarkerTap?: (pointId: string) => void
  /** מיקום בצד שמאל של המטופל, גם אם נלחץ הצד הימני */
  onBodyTap?: (point: SurfacePoint) => void
}

const SKIN = '#d9b8a3'
const STAGE = '#0e1a1b'
const SURFACE_OFFSET = 0.004
const SAMPLES_PER_SPAN = 8

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]]

export class BodyScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(32, 1, 0.02, 40)
  private controls: OrbitControls
  private loader = new GLTFLoader()
  private body: THREE.Mesh | null = null
  private bodyHeight = 1.78
  private bodyWidth = 1.6 // מקצה יד לקצה יד
  private bodyDepth = 0.35
  private safeTop = 0
  private safeBottom = 0
  private meridianGroup = new THREE.Group()
  private markerGroup = new THREE.Group()
  private treatmentGroup = new THREE.Group()
  private animated: Animated[] = []
  /** מתי כל אלמנט מופיע, בשניות מרגע בחירת הקבוצה (להנפשת הפתיחה) */
  private revealAt = new Map<THREE.Object3D, number>()
  private groupStart = 0
  private pickables: THREE.Mesh[] = []
  private pulses: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; t: number; speed: number }[] = []
  private tween: { p0: THREE.Vector3; p1: THREE.Vector3; t0: THREE.Vector3; t1: THREE.Vector3; k: number } | null = null
  private clock = new THREE.Clock()
  private resizeObserver: ResizeObserver
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private downAt: { x: number; y: number } | null = null
  private activePointers = new Set<number>()
  private multiTouch = false // צביטה לזום לא נחשבת ללחיצה
  private lastTap: { x: number; y: number; time: number } | null = null
  private loadToken = 0
  events: BodySceneEvents = {}

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.scene.background = new THREE.Color(STAGE)
    this.scene.fog = new THREE.Fog(STAGE, 6, 14)

    this.scene.add(new THREE.HemisphereLight('#dff3ef', '#5b6f6c', 1.25))
    const key = new THREE.DirectionalLight('#fff4ea', 2.0)
    key.position.set(2.5, 4, 3.5)
    const rim = new THREE.DirectionalLight('#7fd3cc', 1.3)
    rim.position.set(-3, 2.5, -3)
    const fill = new THREE.DirectionalLight('#ffffff', 0.8)
    fill.position.set(-1.5, 0.2, 3.5)
    this.scene.add(key, rim, fill)

    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshStandardMaterial({ color: '#142426', roughness: 1 }))
    floor.rotation.x = -Math.PI / 2
    this.scene.add(floor, this.meridianGroup, this.markerGroup, this.treatmentGroup)

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.zoomToCursor = true // הזום מתקרב למקום שמתחת לעכבר או בין האצבעות, לא למרכז הגוף
    this.controls.minDistance = 0.25
    this.controls.maxDistance = 7
    this.controls.target.set(0, 0.95, 0)
    this.camera.position.set(0, 1.0, 4.6)

    canvas.addEventListener('pointerdown', this.handlePointerDown)
    canvas.addEventListener('pointerup', this.handlePointerUp)
    canvas.addEventListener('pointercancel', this.handlePointerCancel)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
    this.renderer.setAnimationLoop(this.tick)
  }

  async loadBody(sex: BodySex): Promise<void> {
    const token = ++this.loadToken
    const gltf = await this.loader.loadAsync(`/models/body-${sex}.glb`)
    if (token !== this.loadToken) return
    let mesh: THREE.Mesh | null = null
    gltf.scene.traverse(o => { if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh })
    if (!mesh) throw new Error('body mesh missing')
    const found = mesh as THREE.Mesh
    found.material = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.72, metalness: 0 })
    found.geometry.computeBoundingBox()
    found.geometry.computeBoundingSphere()
    // עץ חיפוש למשולשים: מאות המדידות על הגוף (מיקום איברים, קווים, לחיצות) רצות פי מאות מהר יותר
    found.geometry.boundsTree = new MeshBVH(found.geometry)
    found.raycast = acceleratedRaycast
    found.removeFromParent()
    if (this.body) {
      this.scene.remove(this.body)
      this.body.geometry.dispose()
      ;(this.body.material as THREE.Material).dispose()
    }
    this.body = found
    this.bodyHeight = found.geometry.boundingBox!.max.y
    this.bodyWidth = found.geometry.boundingBox!.max.x - found.geometry.boundingBox!.min.x
    this.bodyDepth = found.geometry.boundingBox!.max.z - found.geometry.boundingBox!.min.z
    this.scene.add(found)
  }

  /** מצייר את המרידיאן בשני צידי הגוף. paths - מיקומים לצד שמאל */
  setMeridian(def: MeridianDef, paths: Record<string, SurfacePoint>): void {
    this.clearGroup(this.meridianGroup)
    this.pickables = []
    this.pulses = []
    if (!this.body) return
    const color = new THREE.Color(def.color)
    const coreMat = new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color('#fff'), 0.15), toneMapped: false })
    const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    const pickMat = new THREE.MeshBasicMaterial({ visible: false })
    const pulseMat = new THREE.MeshBasicMaterial({ color: '#fff6de', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })

    for (const sideSign of [1, -1]) {
      for (const segment of def.segments) {
        const pts = segment.map(id => paths[id]).filter(Boolean)
        if (pts.length < 2) continue
        const surface = pts.map(sp => sideSign === 1 ? sp : { p: mirror(sp.p), n: mirror(sp.n) })
        const curve = this.surfaceCurve(surface)
        const segments = Math.max(40, pts.length * SAMPLES_PER_SPAN * 2)

        const core = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, 0.0013, 8), coreMat)
        const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, 0.0032, 10), glowMat)
        const pick = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.round(segments / 2), 0.025, 6), pickMat)
        pick.userData.meridianId = def.id
        this.meridianGroup.add(core, glow, pick)
        this.pickables.push(pick)

        if (!this.reduceMotion) {
          const length = curve.getLength()
          const count = Math.max(1, Math.round(length / 0.35))
          for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 12, 8), pulseMat)
            this.meridianGroup.add(mesh)
            this.pulses.push({ mesh, curve, t: i / count, speed: 0.09 / length })
          }
        }
      }
    }
  }

  /** נקודות הבקרה של מצב העריכה, בשני הצדדים */
  setMarkers(paths: Record<string, SurfacePoint> | null, selectedId: string | null): void {
    this.clearGroup(this.markerGroup)
    if (!paths) return
    const normal = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })
    const selected = new THREE.MeshBasicMaterial({ color: '#3fb5b0', toneMapped: false })
    for (const [id, sp] of Object.entries(paths)) {
      for (const p of [sp.p, mirror(sp.p)]) {
        const isSel = id === selectedId
        const m = new THREE.Mesh(new THREE.SphereGeometry(isSel ? 0.011 : 0.0065, 14, 10), isSel ? selected : normal)
        m.position.set(...p)
        m.userData.pointId = id
        this.markerGroup.add(m)
      }
    }
  }

  setView(view: ViewPreset, animate = true): void {
    const H = this.bodyHeight
    const presets: Record<ViewPreset, [Vec3, Vec3]> = {
      front: [[0, 0.56 * H, 4.4], [0, 0.53 * H, 0]],
      side: [[3.6, 0.56 * H, 2.4], [0, 0.53 * H, 0]],
      back: [[0, 0.56 * H, -4.4], [0, 0.53 * H, 0]],
      head: [[0.35, 0.93 * H, 1.0], [0, 0.9 * H, 0]],
      leg: [[0.9, 0.2 * H, 1.8], [0.1, 0.17 * H, 0]],
      treatment: [[1.6, 0.58 * H, 3.3], [0, 0.5 * H, 0]],
    }
    const [p, t] = presets[view]
    const target = new THREE.Vector3(...t)
    let position = new THREE.Vector3(...p)
    if (view === 'front' || view === 'side' || view === 'back' || view === 'treatment') {
      // מבטי גוף מלא: מרחק שמכניס את כל הגוף, מהראש עד כפות הרגליים, לשטח שבין הכפתורים
      target.y = 0.5 * H
      const dir = position.clone().sub(new THREE.Vector3(...t)).normalize()
      position = target.clone().add(dir.multiplyScalar(this.fitDistance(view === 'side' ? this.bodyDepth : this.bodyWidth)))
    }
    this.tween = {
      p0: this.camera.position.clone(), p1: position,
      t0: this.controls.target.clone(), t1: target,
      k: animate && !this.reduceMotion ? 0 : 1,
    }
  }

  /**
   * מצב דונג: הנקודות של הקבוצה נדלקות בשני הצדדים, קשת אור עולה מכל צד אל האיבר,
   * והאיבר מופיע כהולוגרמה. points - מיקומי הנקודות בצד שמאל של המטופל.
   */
  setTungGroup(group: TungGroup | null, points: Record<string, SurfacePoint>): void {
    this.clearGroup(this.treatmentGroup)
    this.animated = []
    this.revealAt.clear()
    this.groupStart = -1 // נקבע בפריים הראשון שמצויר, כדי שהשעון לא "יקפוץ" אם הלשונית הייתה ברקע
    this.meridianGroup.visible = !group
    if (!group || !this.body) return
    const H = this.bodyHeight
    const s = H / 1.78
    // הנפשת שם הנקודה: סוסים דוהרים אל הנקודות, ורק אחר כך מופיעים הקשת והאיבר
    const horses = group.id === '88.17-19' && !this.reduceMotion
    const departAt = (i: number) => 0.6 + i * 0.45
    const arriveAt = (i: number) => departAt(i) + 2.4
    const afterIntro = horses ? arriveAt(group.pointIds.length - 1) + 0.4 : 0

    const chestFront = this.frontHit(0, 0.72 * H)
    const chestBack = this.rayHit([0, 0.72 * H, -1], [0, 0, 1])
    const midZ = chestFront && chestBack ? (chestFront.point.z + chestBack.point.z) / 2 : 0

    // עוגן האיבר: לאן הקשת מגיעה, בכל צד
    let target: (side: number) => THREE.Vector3
    if (group.organ === 'lungs') {
      const baseY = 0.685 * H
      const size = 0.1 * H
      const halfSpan = 0.66 * this.frontHalfWidth(0.72 * H, 0.3)
      this.add(createLungs(new THREE.Vector3(0, baseY, midZ + 0.01 * s), size, halfSpan), afterIntro)
      target = side => new THREE.Vector3(side * halfSpan * 0.52, baseY + size * 0.45, midZ)
    } else if (group.organ === 'heart') {
      const center = new THREE.Vector3(0.02 * s, 0.705 * H, midZ + 0.025 * s)
      this.add(createHeart(center, 0.068 * H), afterIntro)
      target = () => center.clone()
    } else if (group.organ === 'kidneys') {
      // בגב, בגובה המותניים העליונים, משני צידי עמוד השדרה
      const y = 0.64 * H
      const backHit = this.rayHit([0.05 * s, y, -1], [0, 0, 1])
      const z = backHit ? backHit.point.z + 0.05 * s : midZ - 0.04 * s
      const centers: [THREE.Vector3, THREE.Vector3] = [
        new THREE.Vector3(0.055 * s, y + 0.008 * s, z),
        new THREE.Vector3(-0.055 * s, y - 0.008 * s, z),
      ]
      this.add(createKidneys(centers, 0.068 * H), afterIntro)
      target = side => centers[side === 1 ? 0 : 1].clone()
    } else if (group.organ === 'spleen') {
      // צד שמאל של המטופל, מאחורי הצלעות התחתונות
      const center = new THREE.Vector3(0.09 * s, 0.665 * H, midZ - 0.03 * s)
      this.add(createSpleen(center, 0.1 * H), afterIntro)
      target = () => center.clone()
    } else {
      const center = new THREE.Vector3(-0.04 * s, 0.678 * H, midZ + 0.02 * s)
      this.add(createLiver(center, 0.115 * H), afterIntro)
      target = side => center.clone().add(new THREE.Vector3(side * 0.04 * s, 0, 0))
    }

    const leftSide = group.pointIds.map(id => points[id]).filter(Boolean)
    if (!leftSide.length) return
    for (const side of [1, -1]) {
      const sidePoints = leftSide.map(sp => side === 1 ? sp : { p: mirror(sp.p), n: mirror(sp.n) })
      sidePoints.forEach((sp, i) => {
        this.add(createNeedlePoint(sp, i * 0.33), horses ? arriveAt(i) : 0)
        if (horses) {
          const to = new THREE.Vector3(...sp.p)
          // הסוס מגיע מחוץ לרגל, מהצד של אותה רגל
          const from = to.clone().add(new THREE.Vector3(side * 0.42 * s, 0.03 * s, 0.05 * s))
          this.add(createGallopingHorse(from, to, () => this.groupStart, departAt(i), arriveAt(i)))
        }
      })
      // הקשת יוצאת ממרכז הקבוצה
      const from = sidePoints
        .reduce((acc, sp) => acc.add(new THREE.Vector3(...sp.p)), new THREE.Vector3())
        .divideScalar(sidePoints.length)
      this.add(createFlow(this.innerPath(from, target(side), side), group.color), afterIntro)
    }
  }

  /**
   * מסלול בתוך הגוף: מהנקודה פנימה למרכז הירך, למעלה במרכז הרגל עד המפשעה,
   * דרך הבטן באותו צד, ועד האיבר.
   */
  private innerPath(from: THREE.Vector3, to: THREE.Vector3, side: number): THREE.Vector3[] {
    const H = this.bodyHeight
    const s = H / 1.78
    const core = (x: number, y: number) => {
      const f = this.frontHit(x, y)
      const b = this.rayHit([x, y, -1], [0, 0, 1])
      return f && b ? (f.point.z + b.point.z) / 2 : from.z - 0.05 * s
    }
    const legX = (y: number) => side * this.legCenter(y)
    // מעל המפשעה הרגליים מתמזגות עם האגן, ולכן מודדים את מרכז הירך מעט מתחתיה
    const hipY = 0.455 * H
    const bellyY = 0.585 * H
    const riseY = from.y + 0.07 * s
    const path = [
      from.clone(),
      // נכנסים לעומק בהדרגה, בלי פנייה חדה הצידה
      new THREE.Vector3((from.x + legX(riseY)) / 2, riseY, core((from.x + legX(riseY)) / 2, riseY)),
      new THREE.Vector3(legX(hipY), hipY, core(legX(hipY), hipY)),
      new THREE.Vector3(side * 0.08 * s, bellyY, core(side * 0.08 * s, bellyY)),
    ]
    // אם האיבר נמוך מהבטן (למשל כבד), לא עולים מעליו ויורדים חזרה
    if (to.y < bellyY + 0.03 * s) path.pop()
    path.push(to.clone())
    return path
  }

  /** מרכז הרגל השמאלית בגובה נתון (x חיובי) */
  private legCenter(y: number): number {
    const maxX = 0.26 * (this.bodyHeight / 1.78)
    let best = { a: 0, b: 0 }
    let cur: { a: number; b: number } | null = null
    for (let x = 0.02; x < maxX; x += 0.004) {
      if (this.frontHit(x, y)) {
        if (!cur) cur = { a: x, b: x }
        cur.b = x
        if (cur.b - cur.a > best.b - best.a) best = { ...cur }
      } else cur = null
    }
    return (best.a + best.b) / 2
  }

  private add(item: Animated, revealAt = 0) {
    this.treatmentGroup.add(item.object)
    this.animated.push(item)
    if (revealAt > 0) {
      this.revealAt.set(item.object, revealAt)
      item.object.visible = false
    }
  }

  private rayHit(origin: Vec3, dir: Vec3) {
    if (!this.body) return null
    const ray = new THREE.Raycaster(new THREE.Vector3(...origin), new THREE.Vector3(...dir).normalize())
    ray.firstHitOnly = true
    return ray.intersectObject(this.body)[0] ?? null
  }

  private frontHit(x: number, y: number) {
    return this.rayHit([x, y, 1], [0, 0, -1])
  }

  /** חצי רוחב הגו בגובה נתון: סורקים החוצה עד שהקרן מפספסת או קופצת לזרוע */
  private frontHalfWidth(y: number, maxX: number) {
    let last = 0
    let prevZ: number | null = null
    for (let x = 0; x < maxX; x += 0.003) {
      const h = this.frontHit(x, y)
      if (!h || (prevZ !== null && prevZ - h.point.z > 0.04)) break
      prevZ = h.point.z
      last = x
    }
    return last
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancel)
    this.controls.dispose()
    this.clearGroup(this.meridianGroup)
    this.clearGroup(this.markerGroup)
    this.clearGroup(this.treatmentGroup)
    this.body?.geometry.dispose()
    this.renderer.dispose()
  }

  /**
   * עקומה שנצמדת לעור: דוגמים עקומה חלקה בין נקודות הבקרה, ומטילים כל דגימה בחזרה
   * על פני הגוף לאורך הנורמל, כדי שהקו לא יחתוך דרך החזה או הבטן.
   */
  private surfaceCurve(points: SurfacePoint[]): THREE.CatmullRomCurve3 {
    const body = this.body!
    const controlPts = points.map(sp => new THREE.Vector3(...sp.p))
    const normals = points.map(sp => new THREE.Vector3(...sp.n))
    const rough = new THREE.CatmullRomCurve3(controlPts, false, 'centripetal')
    const ray = new THREE.Raycaster()
    ray.firstHitOnly = true
    const out: THREE.Vector3[] = []
    const spans = points.length - 1
    const total = spans * SAMPLES_PER_SPAN
    for (let i = 0; i <= total; i++) {
      const u = i / total
      const sample = rough.getPoint(u)
      const f = u * spans
      const j = Math.min(Math.floor(f), spans - 1)
      const n = normals[j].clone().lerp(normals[j + 1], f - j).normalize()
      if (i % SAMPLES_PER_SPAN === 0) { out.push(controlPts[i / SAMPLES_PER_SPAN]); continue }
      ray.set(sample.clone().addScaledVector(n, 0.05), n.clone().negate())
      ray.far = 0.1
      const hit = ray.intersectObject(body)[0]
      if (hit?.face) {
        const hn = hit.face.normal.clone()
        out.push(hit.point.clone().addScaledVector(hn.dot(n) < 0 ? hn.negate() : hn, SURFACE_OFFSET))
      } else {
        out.push(sample)
      }
    }
    return new THREE.CatmullRomCurve3(out, false, 'centripetal')
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.activePointers.add(e.pointerId)
    if (this.activePointers.size > 1) this.multiTouch = true
    else this.multiTouch = false
    this.downAt = { x: e.clientX, y: e.clientY }
  }

  private handlePointerCancel = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId)
    this.downAt = null
  }

  private handlePointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId)
    if (!this.downAt || this.multiTouch) { this.downAt = null; return }
    const moved = Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y)
    this.downAt = null
    if (moved > 6) return // זה היה סיבוב, לא לחיצה

    const rect = this.canvas.getBoundingClientRect()
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
    const ray = new THREE.Raycaster()
    ray.firstHitOnly = true
    ray.setFromCamera(ndc, this.camera)

    if (this.events.onMarkerTap && this.markerGroup.children.length) {
      const hit = ray.intersectObjects(this.markerGroup.children, false)[0]
      if (hit) { this.events.onMarkerTap(hit.object.userData.pointId); return }
    }
    if (this.events.onBodyTap && this.body) {
      const hit = ray.intersectObject(this.body)[0]
      if (hit?.face) {
        const n = hit.face.normal.clone().normalize()
        const p = hit.point.clone().addScaledVector(n, SURFACE_OFFSET)
        const r = (v: number) => Math.round(v * 10000) / 10000
        let point: SurfacePoint = { p: [r(p.x), r(p.y), r(p.z)], n: [r(n.x), r(n.y), r(n.z)] }
        if (point.p[0] < 0) point = { p: mirror(point.p), n: mirror(point.n) }
        this.events.onBodyTap(point)
        return
      }
    }
    if (this.events.onTungPointTap && this.treatmentGroup.children.length) {
      const hit = ray.intersectObjects(this.treatmentGroup.children, true).find(h => h.object.userData.tungPick)
      if (hit) { this.events.onTungPointTap(); return }
    }
    // לחיצה כפולה על הגוף מתקרבת לאותו מקום (במצב עריכה לחיצה מציבה נקודה, אז שם אין)
    const now = performance.now()
    const isDouble = this.lastTap && now - this.lastTap.time < 320 && Math.hypot(e.clientX - this.lastTap.x, e.clientY - this.lastTap.y) < 24
    this.lastTap = isDouble ? null : { x: e.clientX, y: e.clientY, time: now }
    if (isDouble && this.body) {
      const hit = ray.intersectObject(this.body)[0]
      if (hit) { this.focusOn(hit.point); return }
    }

    if (this.events.onMeridianTap && this.pickables.length && this.meridianGroup.visible) {
      const hit = ray.intersectObjects(this.pickables, false)[0]
      if (hit) this.events.onMeridianTap(hit.object.userData.meridianId)
    }
  }

  /** מקרב את המצלמה לנקודה, מאותו כיוון מבט */
  private focusOn(point: THREE.Vector3) {
    const dir = this.camera.position.clone().sub(this.controls.target).normalize()
    const distance = Math.min(0.75, this.camera.position.distanceTo(this.controls.target))
    this.tween = {
      p0: this.camera.position.clone(), p1: point.clone().addScaledVector(dir, distance),
      t0: this.controls.target.clone(), t1: point.clone(),
      k: this.reduceMotion ? 1 : 0,
    }
  }

  /**
   * כמה פיקסלים מכסים הכפתורים למעלה ולמטה. הסצנה מזיזה את מרכז התמונה לאמצע
   * השטח הפנוי, ומבטי הגוף המלא מתרחקים מספיק כדי שהגוף ייכנס בו כולו.
   */
  setSafeArea(top: number, bottom: number): void {
    if (top === this.safeTop && bottom === this.safeBottom) return
    this.safeTop = top
    this.safeBottom = bottom
    this.resize()
  }

  /** מרחק המצלמה שבו הגוף כולו, לגובה ולרוחב, נכנס לשטח שבין הכפתורים */
  private fitDistance(across: number): number {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1
    const free = Math.max(0.35, (h - this.safeTop - this.safeBottom) / h)
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const byHeight = (this.bodyHeight * 1.08) / (2 * tan * free)
    const byWidth = (across * 1.08) / (2 * tan * (w / h))
    const d = Math.max(byHeight, byWidth, 3)
    this.controls.maxDistance = Math.max(7, d * 1.3)
    return d
  }

  private resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    const shift = (this.safeBottom - this.safeTop) / 2
    if (shift) this.camera.setViewOffset(w, h, 0, shift, w, h)
    else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
  }

  private tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.1)
    if (this.tween) {
      this.tween.k = Math.min(1, this.tween.k + dt * 2.2)
      const e = 1 - Math.pow(1 - this.tween.k, 3)
      this.camera.position.lerpVectors(this.tween.p0, this.tween.p1, e)
      this.controls.target.lerpVectors(this.tween.t0, this.tween.t1, e)
      if (this.tween.k >= 1) this.tween = null
    }
    const elapsed = this.clock.elapsedTime
    if (this.groupStart < 0) this.groupStart = elapsed
    const sinceGroup = elapsed - this.groupStart
    for (const [object, at] of this.revealAt) object.visible = sinceGroup >= at
    for (const item of this.animated) item.update(this.reduceMotion ? 1.2 : elapsed)
    for (const pulse of this.pulses) {
      pulse.t = (pulse.t + pulse.speed * dt) % 1
      pulse.mesh.position.copy(pulse.curve.getPointAt(pulse.t))
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private clearGroup(group: THREE.Group) {
    for (const child of [...group.children]) {
      child.traverse(o => (o as THREE.Mesh).geometry?.dispose())
      group.remove(child)
    }
  }
}
