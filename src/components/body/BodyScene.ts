// סצנת התלת ממד של מסך הגוף: טעינת הגוף, ציור המרידיאן כקו זוהר, ולחיצות.
// three.js ישירות, בלי react-three-fiber (שעדיין לא תומך בגרסת React של האפליקציה).

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { BodySex, MeridianDef, SurfacePoint, Vec3 } from '../../data/bodyModel/meridians'

export type ViewPreset = 'front' | 'side' | 'back' | 'head' | 'leg'

export interface BodySceneEvents {
  onMeridianTap?: (meridianId: string) => void
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
  private meridianGroup = new THREE.Group()
  private markerGroup = new THREE.Group()
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
    this.scene.add(floor, this.meridianGroup, this.markerGroup)

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
    found.removeFromParent()
    if (this.body) {
      this.scene.remove(this.body)
      this.body.geometry.dispose()
      ;(this.body.material as THREE.Material).dispose()
    }
    this.body = found
    this.bodyHeight = found.geometry.boundingBox!.max.y
    this.scene.add(found)
  }

  /** מצייר את המרידיאן בשני צידי הגוף. paths - מיקומים לצד שמאל */
  setMeridian(def: MeridianDef, paths: Record<string, SurfacePoint>): void {
    this.clearGroup(this.meridianGroup)
    this.pickables = []
    this.pulses = []
    if (!this.body) return
    const color = new THREE.Color(def.color)
    const coreMat = new THREE.MeshBasicMaterial({ color: color.clone().lerp(new THREE.Color('#fff'), 0.35), toneMapped: false })
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
    }
    const [p, t] = presets[view]
    this.tween = {
      p0: this.camera.position.clone(), p1: new THREE.Vector3(...p),
      t0: this.controls.target.clone(), t1: new THREE.Vector3(...t),
      k: animate && !this.reduceMotion ? 0 : 1,
    }
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
    // לחיצה כפולה על הגוף מתקרבת לאותו מקום (במצב עריכה לחיצה מציבה נקודה, אז שם אין)
    const now = performance.now()
    const isDouble = this.lastTap && now - this.lastTap.time < 320 && Math.hypot(e.clientX - this.lastTap.x, e.clientY - this.lastTap.y) < 24
    this.lastTap = isDouble ? null : { x: e.clientX, y: e.clientY, time: now }
    if (isDouble && this.body) {
      const hit = ray.intersectObject(this.body)[0]
      if (hit) { this.focusOn(hit.point); return }
    }

    if (this.events.onMeridianTap && this.pickables.length) {
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

  private resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
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
    for (const pulse of this.pulses) {
      pulse.t = (pulse.t + pulse.speed * dt) % 1
      pulse.mesh.position.copy(pulse.curve.getPointAt(pulse.t))
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private clearGroup(group: THREE.Group) {
    for (const child of [...group.children]) {
      const mesh = child as THREE.Mesh
      mesh.geometry?.dispose()
      group.remove(child)
    }
  }
}
