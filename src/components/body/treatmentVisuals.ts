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
  group.add(core, halo)
  return {
    object: group,
    update: time => {
      const k = ((time * 0.7 + phase) % 1)
      halo.scale.setScalar(0.7 + k * 1.3)
      ;(halo.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k)
    },
  }
}

/** קשת אור באוויר מהנקודה אל האיבר, עם פעימות שנעות לכיוון האיבר */
export function createArc(from: THREE.Vector3, to: THREE.Vector3, lift: THREE.Vector3, organColor = '#70e3ff'): Animated {
  const curve = new THREE.CubicBezierCurve3(
    from,
    from.clone().add(lift),
    to.clone().add(lift.clone().multiplyScalar(0.8)),
    to,
  )
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOrgan: { value: new THREE.Color(organColor) } },
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
      varying float vU;
      void main() {
        vec3 gold = vec3(1.0, 0.78, 0.36);
        vec3 color = mix(gold, uOrgan, smoothstep(0.15, 0.85, vU));
        float pulse = pow(fract(vU * 2.5 - uTime * 0.55), 6.0);
        float ends = smoothstep(0.0, 0.06, vU) * smoothstep(1.0, 0.94, vU);
        float alpha = (0.5 + pulse * 0.5) * ends;
        gl_FragColor = vec4(mix(color, vec3(1.0), pulse * 0.6), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.0045, 8), material)
  mesh.renderOrder = 11
  return { object: mesh, update: time => { material.uniforms.uTime.value = time } }
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

/**
 * לב הולוגרמה שפועם. צורת טיפה עם קודקוד שפונה למטה ושמאלה (לצד שמאל של המטופל).
 * @param center מרכז הלב, @param size גובה הלב במטרים
 */
export function createHeart(center: THREE.Vector3, size: number, color = '#ff5f7a'): Animated {
  const profile = [
    [0.0, 0.0], [0.28, 0.1], [0.46, 0.3], [0.54, 0.52], [0.52, 0.72],
    [0.42, 0.88], [0.24, 0.98], [0.0, 1.0],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const geo = new THREE.LatheGeometry(profile, 32)
  geo.translate(0, -0.5, 0)
  const material = hologramMaterial(color)
  const shape = hologramShape(geo, material, color)
  const holder = new THREE.Group()
  holder.position.copy(center)
  // הקודקוד פונה למטה, קדימה ולצד שמאל של המטופל (x חיובי)
  holder.rotation.set(-0.35, 0, 0.5)
  holder.add(shape)

  // שני כלי דם יוצאים מבסיס הלב, למעלה
  const vessel = (dx: number, lean: number) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(dx, 0.42, 0),
      new THREE.Vector3(dx, 0.8, 0),
      new THREE.Vector3(dx + lean, 0.88, -0.05),
    )
    shape.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.07, 10), material))
  }
  vessel(0.12, 0.25)
  vessel(-0.12, -0.2)

  return {
    object: holder,
    update: time => {
      const b = heartbeat(time)
      material.uniforms.uTime.value = time
      material.uniforms.uOpacity.value = 0.72 + 0.28 * b
      shape.scale.setScalar(size * (1 + 0.07 * b))
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
