// אלמנטים חזותיים של "הטיפול שלך": נקודה דולקת, קשת אור לאזור התגובה, ואיבר הולוגרמה.

import * as THREE from 'three'
import type { SurfacePoint } from '../../data/bodyModel/meridians'

export interface Animated {
  object: THREE.Object3D
  update: (time: number) => void
}

/** מחזור נשימה רגוע: 0 בנשיפה, 1 בשאיפה מלאה */
export function breath(time: number, period = 4.8): number {
  const phase = (time % period) / period
  return 0.5 - 0.5 * Math.cos(phase * Math.PI * 2)
}

function hologramMaterial(color: string) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vWorldY;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vec4 view = viewMatrix * world;
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-view.xyz);
        vWorldY = world.y;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying float vWorldY;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.2);
        float scan = 0.5 + 0.5 * sin(vWorldY * 520.0 - uTime * 5.0);
        float alpha = (0.22 + fresnel * 0.7) * (0.8 + 0.2 * scan) * uOpacity;
        vec3 color = mix(uColor, vec3(0.85, 1.0, 1.0), fresnel * 0.5);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false, // נראה דרך העור, כמו צילום רנטגן
  })
}

/** אונת ריאה מסוגננת: צרה בקודקוד, רחבה ושקועה בבסיס, שטוחה בצד הפנימי */
function lungLobeGeometry(side: 1 | -1) {
  const profile = [
    [0.0, 1.0], [0.22, 0.97], [0.42, 0.88], [0.6, 0.73], [0.74, 0.52],
    [0.83, 0.3], [0.86, 0.12], [0.72, 0.01], [0.42, 0.05], [0.0, 0.08],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const geo = new THREE.LatheGeometry(profile, 36)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    // הצד שפונה ללב ולקו האמצע שטוח יותר
    if (pos.getX(i) * side < 0) pos.setX(i, pos.getX(i) * 0.5)
  }
  geo.computeVertexNormals()
  return geo
}

/**
 * ריאות הולוגרמה שנושמות.
 * @param base מרכז בסיס הריאות (גובה הסרעפת, באמצע עומק בית החזה)
 * @param size גובה אונה במטרים
 * @param halfSpan המרחק מקו האמצע לדופן החיצונית של הריאה - נגזר מרוחב בית החזה
 */
export function createLungs(base: THREE.Vector3, size: number, halfSpan: number, color = '#1fb8d8'): Animated {
  const group = new THREE.Group()
  group.position.copy(base)
  const material = hologramMaterial(color)
  const wire = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.12, depthTest: false, depthWrite: false })

  // רוחב האונה נגזר מרוחב בית החזה, כדי שהריאות לא יחרגו מהגוף
  const radiusX = halfSpan * 0.55
  const depth = Math.min(size * 0.34, halfSpan * 0.6)
  const lobes: THREE.Object3D[] = []
  for (const side of [1, -1] as const) {
    const geo = lungLobeGeometry(side)
    const lobe = new THREE.Group()
    lobe.add(new THREE.Mesh(geo, material))
    lobe.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo), wire))
    lobe.scale.set(radiusX, size, depth)
    lobe.position.set(side * halfSpan * 0.52, 0, 0)
    group.add(lobe)
    lobes.push(lobe)
  }

  // קנה הנשימה והסימפונות
  const airway = new THREE.Group()
  const tube = (from: THREE.Vector3, to: THREE.Vector3, r: number) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 4, r, 10), material)
    airway.add(m)
  }
  const fork = new THREE.Vector3(0, size * 0.78, 0)
  tube(new THREE.Vector3(0, size * 1.18, 0), fork, size * 0.045)
  tube(fork, new THREE.Vector3(halfSpan * 0.38, size * 0.58, 0), size * 0.035)
  tube(fork, new THREE.Vector3(-halfSpan * 0.38, size * 0.58, 0), size * 0.035)
  group.add(airway)
  group.renderOrder = 10

  return {
    object: group,
    update: time => {
      const b = breath(time)
      material.uniforms.uTime.value = time
      material.uniforms.uOpacity.value = 0.75 + 0.25 * b
      for (const lobe of lobes) {
        lobe.scale.set(radiusX * (1 + 0.06 * b), size * (1 + 0.03 * b), depth * (1 + 0.06 * b))
      }
    },
  }
}

/** נקודת דיקור דולקת: גרעין זהוב והילה שפועמת */
export function createNeedlePoint(sp: SurfacePoint, phase = 0): Animated {
  const group = new THREE.Group()
  group.position.set(...sp.p)
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.0065, 16, 12),
    new THREE.MeshBasicMaterial({ color: '#fff1c9', toneMapped: false }),
  )
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.008, 0.02, 40),
    new THREE.MeshBasicMaterial({ color: '#ffc85c', transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
  )
  // ההילה שוכבת על העור
  halo.lookAt(new THREE.Vector3(...sp.n))
  // אזור לחיצה נדיב ושקוף, כדי שיהיה קל לפגוע בנקודה באצבע
  const pick = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ visible: false }))
  pick.userData.tungPick = true
  group.add(core, halo, pick)
  return {
    object: group,
    update: time => {
      const k = ((time * 0.7 + phase) % 1)
      halo.scale.setScalar(0.7 + k * 1.3)
      ;(halo.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k)
    },
  }
}

/**
 * קו זרימה בתוך הגוף, מהנקודה אל האיבר. נראה דרך העור כמו ההולוגרמה,
 * ופעימות אור נעות לאורכו לכיוון האיבר.
 */
export function createFlow(path: THREE.Vector3[], organColor = '#70e3ff'): Animated {
  const curve = new THREE.CatmullRomCurve3(path, false, 'centripetal')
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOrgan: { value: new THREE.Color(organColor) }, uLength: { value: curve.getLength() }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying float vU;
      void main() {
        vU = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uOrgan;
      uniform float uLength;
      uniform float uOpacity;
      varying float vU;
      void main() {
        vec3 gold = vec3(1.0, 0.78, 0.36);
        vec3 color = mix(gold, uOrgan, smoothstep(0.1, 0.9, vU));
        // פעימה כל כ-25 ס"מ, במהירות קבועה בלי קשר לאורך הקו
        float along = vU * uLength;
        float pulse = pow(fract(along * 4.0 - uTime * 0.9), 5.0);
        float ends = smoothstep(0.0, 0.04, vU) * smoothstep(1.0, 0.96, vU);
        float alpha = (0.55 + pulse * 0.45) * ends * uOpacity;
        gl_FragColor = vec4(mix(color, vec3(1.0), pulse * 0.5), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false, // נראה דרך העור
  })
  const segments = Math.max(80, path.length * 24)
  const core = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, 0.0045, 8), material)
  // הילה רכה סביב הקו
  const glowMaterial = material.clone()
  glowMaterial.uniforms.uOpacity.value = 0.22
  const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, 0.011, 10), glowMaterial)
  const group = new THREE.Group()
  group.add(glow, core)
  group.renderOrder = 11
  core.renderOrder = 12
  return {
    object: group,
    update: time => {
      material.uniforms.uTime.value = time
      glowMaterial.uniforms.uTime.value = time
    },
  }
}

/** פעימת לב: כיווץ קצר וחזק ואחריו הרפיה, בערך 66 פעימות בדקה */
export function heartbeat(time: number, period = 0.9): number {
  const phase = (time % period) / period
  const beat = (center: number, width: number) => Math.exp(-(((phase - center) / width) ** 2))
  return Math.max(beat(0.08, 0.05), 0.6 * beat(0.28, 0.06))
}

/** עוטף צורה בחומר ההולוגרמה ובקווי רשת עדינים */
function hologramShape(geo: THREE.BufferGeometry, material: THREE.ShaderMaterial, color: string) {
  const group = new THREE.Group()
  const wire = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.12, depthTest: false, depthWrite: false })
  group.add(new THREE.Mesh(geo, material), new THREE.LineSegments(new THREE.WireframeGeometry(geo), wire))
  group.renderOrder = 10
  return group
}

/** צינור לאורך נקודות, לכלי דם */
function vesselTube(points: [number, number, number][], radius: number, material: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 12), material)
}

/** טיפה מסובבת: קודקוד מחודד בתחתית ובסיס מעוגל למעלה */
function dropGeometry(height: number, radius: number) {
  const profile: THREE.Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const t = i / 16 // 0 בקודקוד, 1 בבסיס
    const r = radius * Math.sin(Math.PI * 0.5 * Math.pow(t, 0.6)) * (1 - 0.35 * Math.pow(t, 6))
    profile.push(new THREE.Vector2(Math.max(r, 0.0001), (t - 0.5) * height))
  }
  profile.push(new THREE.Vector2(0.0001, 0.5 * height))
  return new THREE.LatheGeometry(profile, 32)
}

/**
 * לב הולוגרמה שפועם: שני חדרים, שתי עליות, אבי העורקים עם הקשת שלו,
 * גזע עורק הריאה והווריד הנבוב העליון. יחידת המידה היא אורך הלב.
 * @param center מרכז הלב, @param size אורך הלב במטרים
 */
export function createHeart(center: THREE.Vector3, size: number, color = '#ff5f7a'): Animated {
  const material = hologramMaterial(color)
  const vesselMaterial = hologramMaterial('#ff9aa8')

  // החדרים - החלק שמתכווץ בכל פעימה
  const ventricles = new THREE.Group()
  const left = hologramShape(dropGeometry(0.8, 0.36), material, color)
  left.position.set(0.06, -0.06, -0.03)
  const right = hologramShape(dropGeometry(0.66, 0.32), material, color)
  right.position.set(-0.1, 0.0, 0.07)
  right.scale.set(1, 1, 0.72)
  right.rotation.z = -0.25
  ventricles.add(left, right)

  // העליות והכלים - יושבים על בסיס הלב
  const top = new THREE.Group()
  const atrium = (r: number, x: number, y: number, z: number) => {
    const m = hologramShape(new THREE.SphereGeometry(r, 24, 16), material, color)
    m.position.set(x, y, z)
    m.scale.set(1, 0.85, 0.9)
    return m
  }
  top.add(atrium(0.19, -0.2, 0.36, -0.04), atrium(0.16, 0.14, 0.38, -0.14))
  top.add(vesselTube([[0.0, 0.3, 0.0], [0.0, 0.7, 0.03], [0.1, 0.9, -0.06], [0.24, 0.82, -0.2], [0.26, 0.45, -0.28]], 0.075, vesselMaterial))
  top.add(vesselTube([[-0.06, 0.28, 0.13], [0.0, 0.58, 0.15], [0.26, 0.66, 0.02]], 0.065, vesselMaterial))
  top.add(vesselTube([[0.0, 0.58, 0.15], [-0.26, 0.62, -0.02]], 0.05, vesselMaterial))
  top.add(vesselTube([[-0.26, 0.42, -0.06], [-0.27, 0.95, -0.06]], 0.06, vesselMaterial))

  const shape = new THREE.Group()
  shape.add(ventricles, top)
  shape.scale.setScalar(size)
  const holder = new THREE.Group()
  holder.position.copy(center)
  // הקודקוד פונה למטה, קדימה ולצד שמאל של המטופל (x חיובי)
  holder.rotation.set(-0.3, 0.15, 0.45)
  holder.add(shape)

  return {
    object: holder,
    update: time => {
      const b = heartbeat(time)
      material.uniforms.uTime.value = time
      vesselMaterial.uniforms.uTime.value = time
      material.uniforms.uOpacity.value = 0.75 + 0.25 * b
      vesselMaterial.uniforms.uOpacity.value = 0.6 + 0.2 * b
      ventricles.scale.set(1 - 0.06 * b, 1 - 0.04 * b, 1 - 0.06 * b)
      top.scale.setScalar(1 + 0.03 * b)
    },
  }
}

/**
 * כבד הולוגרמה: טריז רחב מתחת לצלעות בצד ימין של המטופל (x שלילי), שנושם עם הסרעפת.
 * @param center מרכז הכבד, @param width רוחב במטרים
 */
export function createLiver(center: THREE.Vector3, width: number, color = '#b98cff'): Animated {
  const geo = new THREE.SphereGeometry(1, 40, 24)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    // עבה בצד ימין, מצטמצם לחוד דק שחוצה לצד שמאל; תחתית שטוחה יותר
    const t = (x + 1) / 2 // 0 בצד שמאל של המטופל, 1 בצד ימין
    const thickness = 0.35 + 0.65 * t
    pos.setXYZ(i, x * 0.5, (y > 0 ? y : y * 0.6) * 0.42 * thickness, z * 0.36 * thickness)
  }
  geo.computeVertexNormals()
  // x=+1 בגיאומטריה הוא הצד העבה; מסובבים כך שיפנה לצד ימין של המטופל
  geo.rotateY(Math.PI)
  const material = hologramMaterial(color)
  const shape = hologramShape(geo, material, color)
  const holder = new THREE.Group()
  holder.position.copy(center)
  holder.rotation.z = -0.12
  holder.add(shape)

  return {
    object: holder,
    update: time => {
      const b = breath(time)
      material.uniforms.uTime.value = time
      material.uniforms.uOpacity.value = 0.78 + 0.22 * b
      // הסרעפת דוחפת את הכבד מעט למטה בשאיפה
      holder.position.y = center.y - 0.008 * b
      shape.scale.setScalar(width)
    },
  }
}

/** צורת שעועית: אליפסואיד עם שקע בצד שפונה לקו האמצע */
function beanGeometry(notchSide: 1 | -1) {
  const geo = new THREE.SphereGeometry(1, 36, 24)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    if (x * notchSide > 0) x *= 1 - 0.45 * Math.exp(-(y * y) / 0.18)
    pos.setXYZ(i, x * 0.55, y, z * 0.35)
  }
  geo.computeVertexNormals()
  return geo
}

/**
 * כליות הולוגרמה בגב, משני צידי עמוד השדרה, עם השופכנים שיורדים מהן.
 * @param centers מרכזי הכליות [שמאל, ימין], @param size גובה כליה במטרים
 */
export function createKidneys(centers: [THREE.Vector3, THREE.Vector3], size: number, color = '#ffa94d'): Animated {
  const material = hologramMaterial(color)
  const group = new THREE.Group()
  const kidneys: THREE.Object3D[] = []
  centers.forEach((c, i) => {
    const side = i === 0 ? 1 : -1
    // השקע פונה לעמוד השדרה: בכליה השמאלית (x חיובי) לכיוון x שלילי
    const kidney = hologramShape(beanGeometry(side === 1 ? -1 : 1), material, color)
    kidney.position.copy(c)
    kidney.scale.setScalar(size / 2)
    kidney.rotation.z = side * 0.18 // הקוטב העליון נוטה לכיוון עמוד השדרה
    group.add(kidney)
    kidneys.push(kidney)
    const hilum = c.clone().add(new THREE.Vector3(-side * size * 0.2, 0, 0))
    const ureter = new THREE.CatmullRomCurve3([
      hilum,
      hilum.clone().add(new THREE.Vector3(-side * size * 0.15, -size * 0.6, size * 0.1)),
      hilum.clone().add(new THREE.Vector3(-side * size * 0.3, -size * 1.5, size * 0.3)),
    ])
    group.add(new THREE.Mesh(new THREE.TubeGeometry(ureter, 20, size * 0.03, 8), material))
  })
  group.renderOrder = 10
  return {
    object: group,
    update: time => {
      const b = breath(time, 6)
      material.uniforms.uTime.value = time
      material.uniforms.uOpacity.value = 0.72 + 0.28 * b
      for (const k of kidneys) k.scale.setScalar((size / 2) * (1 + 0.03 * b))
    },
  }
}

/**
 * טחול הולוגרמה: איבר מוארך ומעוקל בצד שמאל של המטופל, מאחורי הצלעות התחתונות.
 * @param center מרכז הטחול, @param size אורך במטרים
 */
export function createSpleen(center: THREE.Vector3, size: number, color = '#6fd68f'): Animated {
  const geo = new THREE.SphereGeometry(1, 36, 24)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    // מוארך לאורך y, שטוח, ומעוקל כך שהצד החיצוני קמור
    pos.setXYZ(i, x * 0.45 - 0.25 * y * y, y, z * 0.3)
  }
  geo.computeVertexNormals()
  const material = hologramMaterial(color)
  const shape = hologramShape(geo, material, color)
  const holder = new THREE.Group()
  holder.position.copy(center)
  holder.rotation.set(0.5, 0, -0.55) // הציר הארוך נטוי למעלה ואחורה
  holder.add(shape)
  return {
    object: holder,
    update: time => {
      const b = breath(time)
      material.uniforms.uTime.value = time
      material.uniforms.uOpacity.value = 0.75 + 0.25 * b
      shape.scale.setScalar((size / 2) * (1 + 0.02 * b))
      holder.position.y = center.y - 0.006 * b
    },
  }
}

/**
 * הילה רכה על אזור בגוף (ברך, צוואר, גב תחתון...) - אליפסואיד הולוגרמה שפועם בעדינות.
 * @param centers מרכז אחד, או כמה (למשל שתי הברכיים), @param radii רדיוסים במטרים
 */
export function createRegionGlow(centers: THREE.Vector3[], radii: THREE.Vector3, color = '#ffd36e'): Animated {
  const material = hologramMaterial(color)
  const group = new THREE.Group()
  const blobs: THREE.Mesh[] = []
  for (const c of centers) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), material)
    blob.position.copy(c)
    blob.scale.copy(radii)
    blob.renderOrder = 10
    group.add(blob)
    blobs.push(blob)
  }
  return {
    object: group,
    update: time => {
      const b = breath(time, 2.6)
      material.uniforms.uTime.value = time
      material.uniforms.uOpacity.value = 0.55 + 0.45 * b
      for (const blob of blobs) blob.scale.copy(radii).multiplyScalar(1 + 0.08 * b)
    },
  }
}
