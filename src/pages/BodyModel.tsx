import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BodyScene, type ViewPreset } from '../components/body/BodyScene'
import IndicationsSheet from '../components/body/IndicationsSheet'
import { BODY_MODEL_CREDIT, meridians, type BodySex, type SurfacePoint } from '../data/bodyModel/meridians'
import { meridianPaths } from '../data/bodyModel/meridianPaths'
import { whoPointInfo, whoPoints } from '../data/bodyModel/whoPoints'
import { tungGroups } from '../data/bodyModel/tungGroups'
import { tungPoints } from '../data/bodyModel/tungPoints'
import { points as allPoints } from '../data/points'
import { fingerPointPositions, fingerPointSpecs, handFrame, type Finger } from '../data/bodyModel/fingerPoints'
import { fingerTargets, regionNames } from '../data/bodyModel/fingerTargets'
import { isHiddenFromPatients } from '../data/bodyModel/patientFilter'

/** תיקונים ממצב העריכה, לפי גוף ושכבה: מזהה ערוץ, או 'tung' לנקודות דונג */
type Edits = Record<BodySex, Record<string, Record<string, SurfacePoint>>>
type Mode = 'channel' | 'tung'
type ChannelView = 'single' | 'all' | 'clock'
type TungView = 'groups' | 'fingers'

const FINGER_NAMES: Record<Finger, string> = { 1: 'אגודל', 2: 'מורה', 3: 'אמצעית', 4: 'קמיצה', 5: 'זרת' }

/** ההתוויות הראשונות של דונג לנקודה, בלי מה שמוסתר ממטופלים */
function mainDongUses(pointId: string, count = 3): string[] {
  const record = allPoints.find(p => p.id === pointId)
  const items = (record?.dongIndications ?? [])
    .flatMap(entry => entry.split(/[,;]\s*/))
    .map(item => item.trim())
    .filter(item => item && !isHiddenFromPatients(item))
  return items.slice(0, count)
}

const SEX_KEY = 'bodyModel.sex'
const EDITS_KEY = 'bodyModel.edits.v1'
const TUNG_LAYER = 'tung'
const POINTS_KEY = 'bodyModel.showPoints'

const VIEWS: { id: ViewPreset; label: string }[] = [
  { id: 'front', label: 'חזית' },
  { id: 'side', label: 'צד' },
  { id: 'back', label: 'גב' },
  { id: 'head', label: 'ראש' },
  { id: 'leg', label: 'רגל' },
]

interface EditItem {
  id: string
  label: string
  hint: string
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // אחסון חסום - העריכה עדיין עובדת עד רענון הדף
  }
}

const emptyEdits = (): Edits => ({ female: {}, male: {} })

/** מספר הנקודה בערוץ, למיון: ST36 → 36 */
const pointNumber = (code: string) => Number(code.replace(/^\D+/, ''))

/** כל נקודות הערוץ לפי התקן של ארגון הבריאות העולמי, לפי הסדר */
const whoCodesByMeridian: Record<string, string[]> = {}
for (const [code, info] of Object.entries(whoPointInfo)) (whoCodesByMeridian[info.meridian] ??= []).push(code)
for (const codes of Object.values(whoCodesByMeridian)) codes.sort((a, b) => pointNumber(a) - pointNumber(b))

/**
 * מיקומי נקודות הערוץ לציור הקו: המיקום הראשוני מהסקריפט, מעליו התקן של ארגון הבריאות,
 * ומעל הכול התיקונים הידניים של עדי.
 */
function channelPathsFor(sex: BodySex, meridianId: string, edits: Edits): Record<string, SurfacePoint> {
  const who: Record<string, SurfacePoint> = {}
  for (const code of whoCodesByMeridian[meridianId] ?? []) {
    const sp = whoPoints[sex][code]
    if (sp) who[code] = sp
  }
  return { ...meridianPaths[sex][meridianId], ...who, ...edits[sex][meridianId] }
}

/** השורה של תת-הנקודה מתוך תיאור המיקום של הקבוצה, למשל "88.18 Sì Mǎ Shàng: 2 צון..." */
function locationHint(groupId: string, pointId: string): string {
  const own = allPoints.find(p => p.id === pointId)
  if (own) return own.location
  const point = allPoints.find(p => p.id === groupId)
  if (!point) return ''
  const line = point.location.split('\n').find(l => l.startsWith(pointId))
  return (line ?? point.location).replace(/^[\d.]+\s[^:]*:\s*/, '')
}

export default function BodyModel() {
  const [searchParams] = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<BodyScene | null>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const bottomBarRef = useRef<HTMLDivElement>(null)
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0 })
  const [mode, setMode] = useState<Mode>(searchParams.get('mode') === 'tung' ? 'tung' : 'channel')
  const [meridianId, setMeridianId] = useState(() =>
    meridians.find(m => m.id === searchParams.get('channel'))?.id ?? 'stomach')
  // ערוץ אחד, כל הערוצים יחד, או שעון הגוף
  const [channelView, setChannelView] = useState<ChannelView>(() => {
    const c = searchParams.get('channel')
    return c === 'all' ? 'all' : c === 'clock' ? 'clock' : 'single'
  })
  const [clockIndex, setClockIndex] = useState(0)
  const [groupId, setGroupId] = useState(() =>
    tungGroups.find(g => g.id === searchParams.get('group'))?.id ?? tungGroups[0].id)
  const [sex, setSex] = useState<BodySex>(() => readStorage<BodySex>(SEX_KEY, 'female'))
  const [view, setView] = useState<ViewPreset>('front')
  const [loaded, setLoaded] = useState<BodySex | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [indicationsOpen, setIndicationsOpen] = useState(false)
  const [tungView, setTungView] = useState<TungView>(searchParams.get('tung') === 'fingers' ? 'fingers' : 'groups')
  const [fingerSide, setFingerSide] = useState<'palmar' | 'dorsal'>('palmar')
  const [fingerFilter, setFingerFilter] = useState<Finger | 0>(0)
  const [fingerId, setFingerId] = useState<string | null>(null)
  const insetRef = useRef<HTMLDivElement>(null)
  const [showPoints, setShowPoints] = useState(() => readStorage(POINTS_KEY, false))
  const [edits, setEdits] = useState<Edits>(() => readStorage(EDITS_KEY, emptyEdits()))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const editMode = searchParams.get('edit') === '1'
  const meridian = meridians.find(m => m.id === meridianId)!
  const group = tungGroups.find(g => g.id === groupId)!
  const layer = mode === 'channel' ? meridian.id : TUNG_LAYER

  const editItems: EditItem[] = useMemo(() => mode === 'channel'
    ? meridian.controlPoints.map(cp => ({ id: cp.id, label: cp.pinyin, hint: cp.hint }))
    : group.pointIds.map(id => ({ id, label: group.hebrewName, hint: locationHint(group.id, id) })),
  [mode, meridian, group])
  const activeSelectedId = editItems.some(i => i.id === selectedId) ? selectedId! : editItems[0].id

  const channelPaths = useMemo(
    () => channelPathsFor(sex, meridian.id, edits),
    [sex, edits, meridian],
  )
  const tungPaths = useMemo(
    () => ({ ...tungPoints[sex], ...edits[sex][TUNG_LAYER] }),
    [sex, edits],
  )
  const layerEdits = edits[sex][layer] ?? {}
  const editedIds = new Set(Object.keys(layerEdits).filter(id => editItems.some(i => i.id === id)))

  // העמוד עצמו לא זז ולא מתקרב: רק הגוף. בלי זה, צביטה שמתחילה על כפתור
  // מגדילה את כל העמוד, והתפריטים זזים ומשנים גודל
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
    const original = meta?.content
    if (meta) meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    // ספארי באייפון מתעלם מההגדרה למעלה בחלק מהמקרים - חוסמים את מחוות הזום שלו ישירות
    const block = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', block, { passive: false })
    document.addEventListener('gesturechange', block, { passive: false })
    return () => {
      if (meta && original !== undefined) meta.content = original
      document.removeEventListener('gesturestart', block)
      document.removeEventListener('gesturechange', block)
    }
  }, [])

  useEffect(() => {
    const scene = new BodyScene(canvasRef.current!)
    sceneRef.current = scene
    return () => {
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    writeStorage(SEX_KEY, sex)
    // ב-StrictMode הסצנה נוצרת פעמיים - מתעלמים מטעינה של סצנה שכבר נסגרה
    let cancelled = false
    sceneRef.current?.loadBody(sex)
      .then(() => { if (!cancelled) setLoaded(sex) })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [sex])

  // שלושה עדכונים נפרדים, כדי שמעבר בין קבוצות דונג לא יבנה מחדש את הערוץ,
  // ובחירת נקודה במצב עריכה לא תתחיל מחדש את הנפשת הקבוצה
  // כל הערוצים יחד: רק במצב רפואה סינית ולא בעריכה
  const allActive = channelView !== 'single' && mode === 'channel' && !editMode
  const clockActive = allActive && channelView === 'clock'
  const allChannels = useMemo(
    () => meridians.map(def => ({ def, paths: channelPathsFor(sex, def.id, edits) })),
    [sex, edits],
  )

  useEffect(() => {
    if (loaded !== sex) return
    if (allActive) sceneRef.current?.setMeridians(allChannels, { bodyClock: clockActive })
    // בעריכה של ערוץ, שאר הערוצים מוצגים עמומים ברקע כדי לראות את התמונה המלאה
    else if (editMode && mode === 'channel') sceneRef.current?.setMeridians([
      ...allChannels.filter(l => l.def.id !== meridian.id).map(l => ({ ...l, dim: true })),
      { def: meridian, paths: channelPaths },
    ])
    else sceneRef.current?.setMeridian(meridian, channelPaths)
  }, [loaded, sex, meridian, channelPaths, allActive, clockActive, allChannels, editMode, mode])

  // נקודות האצבע של דונג: יד מוגדלת בחלון, והאזור שהנקודה משפיעה עליו נדלק על הגוף
  const fingersActive = mode === 'tung' && tungView === 'fingers' && !editMode
  const fingerTarget = fingersActive && fingerId ? fingerTargets[fingerId] ?? null : null
  const insetPoints = useMemo(() => Object.entries(fingerPointSpecs)
    .filter(([, spec]) => spec.side === fingerSide)
    .filter(([, spec]) => !fingerFilter || (Array.isArray(spec.finger) ? spec.finger.includes(fingerFilter) : spec.finger === fingerFilter))
    .map(([id]) => ({ id, points: fingerPointPositions[sex][id] ?? [] }))
    .filter(item => item.points.length), [fingerSide, fingerFilter, sex])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || loaded !== sex) return
    if (fingersActive) {
      scene.setTungGroup(null, tungPaths)
      scene.setFingerTarget(fingerTarget)
      scene.setMeridiansVisible(false)
    } else {
      scene.setFingerTarget(null)
      scene.setTungGroup(mode === 'tung' ? group : null, tungPaths)
    }
  }, [loaded, sex, mode, group, tungPaths, fingersActive, fingerTarget])

  useEffect(() => {
    if (loaded !== sex) return
    sceneRef.current?.setHandInset(fingersActive ? handFrame[sex] : null, fingerSide, insetPoints, fingerId)
  }, [loaded, sex, fingersActive, fingerSide, insetPoints, fingerId])

  // מיקום חלון היד על המסך, כדי שהתלת ממד יצויר בדיוק בתוכו
  useEffect(() => {
    const scene = sceneRef.current
    const el = insetRef.current
    if (!scene) return
    if (!fingersActive || !el) { scene.setHandInsetRect(null); return }
    const measure = () => {
      const r = el.getBoundingClientRect()
      const c = canvasRef.current?.getBoundingClientRect()
      scene.setHandInsetRect({ left: r.left - (c?.left ?? 0), top: r.top - (c?.top ?? 0), width: r.width, height: r.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [fingersActive, loaded])

  // נקודות הערוץ למטופל: רק כשהמתג דולק, בערוץ אחד, ולא בעריכה (שם יש סמנים משלה)
  const channelPointsVisible = showPoints && mode === 'channel' && !allActive && !editMode
  useEffect(() => {
    if (loaded !== sex) return
    sceneRef.current?.setChannelPoints(
      channelPointsVisible
        ? (whoCodesByMeridian[meridian.id]?.length ? whoCodesByMeridian[meridian.id] : meridian.controlPoints.map(cp => cp.id))
            .map(id => ({ id, sp: channelPaths[id] ?? whoPoints[sex][id] }))
            .filter(item => item.sp)
        : null,
      meridian.color,
    )
  }, [loaded, sex, meridian, channelPaths, channelPointsVisible])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || loaded !== sex) return
    const markerSource = mode === 'channel' ? channelPaths : Object.fromEntries(group.pointIds.map(id => [id, tungPaths[id]]))
    scene.setMarkers(editMode ? markerSource : null, activeSelectedId)
  }, [loaded, sex, mode, group, channelPaths, tungPaths, editMode, activeSelectedId])

  // כמה מהמסך מכוסה בכפתורים למעלה ולמטה, כדי שהגוף ייכנס כולו לשטח שביניהם
  useEffect(() => {
    const measure = () => {
      const top = Math.round(topBarRef.current?.getBoundingClientRect().bottom ?? 0)
      const bottomTop = bottomBarRef.current?.getBoundingClientRect().top
      const bottom = bottomTop === undefined ? 0 : Math.round(window.innerHeight - bottomTop)
      setSafeArea(prev => prev.top === top && prev.bottom === bottom ? prev : { top, bottom })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (topBarRef.current) observer.observe(topBarRef.current)
    if (bottomBarRef.current) observer.observe(bottomBarRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [editMode])

  useEffect(() => {
    sceneRef.current?.setSafeArea(safeArea.top, safeArea.bottom)
  }, [safeArea])

  useEffect(() => {
    if (loaded) sceneRef.current?.setView(mode === 'tung' && view === 'front' ? 'treatment' : view)
  }, [view, loaded, mode, safeArea])

  // האירועים נקראים מתוך הסצנה, ולכן מתעדכנים בכל רינדור עם הערכים העדכניים
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    scene.events = {
      onMeridianTap: editMode
        ? undefined
        : id => {
            // בתצוגת כל הערוצים, לחיצה על קו פותחת את הערוץ הזה לבד
            if (allActive) {
              setChannelView('single')
              setMeridianId(id)
            }
            setInfoOpen(true)
          },
      onBodyClockStep: i => setClockIndex(i),
      onFingerPointTap: fingersActive ? id => { setFingerId(id); setIndicationsOpen(false); setInfoOpen(false) } : undefined,
      onTungPointTap: editMode || mode !== 'tung' || tungView !== 'groups' ? undefined : () => { setInfoOpen(false); setIndicationsOpen(true) },
      onMarkerTap: editMode ? id => setSelectedId(id) : undefined,
      onChannelPointTap: channelPointsVisible
        ? id => {
            const pinyin = whoPointInfo[id]?.pinyin ?? meridian.controlPoints.find(cp => cp.id === id)?.pinyin
            setToast(pinyin ? `${id} · ${pinyin}` : id)
            window.setTimeout(() => setToast(null), 2200)
          }
        : undefined,
      onBodyTap: editMode
        ? point => {
            const next: Edits = { ...edits, [sex]: { ...edits[sex], [layer]: { ...layerEdits, [activeSelectedId]: point } } }
            setEdits(next)
            writeStorage(EDITS_KEY, next)
            // הבחירה נשארת על אותה נקודה, כדי שלחיצה נוספת תדייק אותה ולא תזיז את הבאה
          }
        : undefined,
    }
  })

  function showToast(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(null), 2200)
  }

  function updateEdits(next: Edits) {
    setEdits(next)
    writeStorage(EDITS_KEY, next)
  }

  function undoPoint() {
    const current = { ...layerEdits }
    delete current[activeSelectedId]
    updateEdits({ ...edits, [sex]: { ...edits[sex], [layer]: current } })
  }

  function clearAll() {
    if (!window.confirm('למחוק את כל התיקונים ולחזור למיקומים המקוריים, בשני הגופים?')) return
    updateEdits(emptyEdits())
    showToast('חזרנו למיקומים המקוריים')
  }

  async function copyAll() {
    // רק מה שתוקן, לפי גוף ושכבה - אני ממזג לקבצי הנתונים
    try {
      await navigator.clipboard.writeText(JSON.stringify(edits))
      showToast('המיקומים הועתקו. אפשר להדביק בשיחה')
    } catch {
      showToast('ההעתקה נחסמה בדפדפן')
    }
  }

  function pickMode(next: Mode) {
    setMode(next)
    setIndicationsOpen(false)
    setFingerId(null)
    setView('front')
    setInfoOpen(false)
  }

  const selected = editItems.find(i => i.id === activeSelectedId)
  const clockMeridian = meridians[clockIndex] ?? meridians[0]
  const chipColor = mode === 'tung' ? group.color : allActive ? ALL_CHANNELS_DOT : meridian.color
  const card = mode === 'tung'
    ? { title: group.hebrewName, subtitle: `${group.id} · ${group.chineseName}`, explanation: group.explanation }
    : allActive
      ? (clockActive ? BODY_CLOCK_CARD : ALL_CHANNELS_CARD)
      : { title: meridian.hebrewName, subtitle: meridian.chineseName, explanation: meridian.explanation }
  const chipLabel = mode === 'tung' ? `${group.hebrewName} ← ${group.organName}` : allActive ? (clockActive ? BODY_CLOCK_CARD.title : ALL_CHANNELS_CARD.title) : meridian.hebrewName

  // בחירת ערוץ או קבוצת נקודות. בטלפון בתחתית המסך, כדי לא לכסות את הגוף
  const pickerChips = (
    <div className={`flex gap-2 ${editMode ? 'flex-wrap' : 'flex-nowrap overflow-x-auto max-w-full pointer-events-auto [scrollbar-width:none] touch-pan-x overscroll-x-contain'}`}>
      {mode === 'channel'
        ? <>
            {!editMode && (
              <ColorChip
                color={ALL_CHANNELS_DOT}
                label={ALL_CHANNELS_CARD.title}
                active={allActive && !clockActive}
                onClick={() => { setChannelView('all'); setInfoOpen(false) }}
              />
            )}
            {!editMode && (
              <ColorChip
                color={BODY_CLOCK_DOT}
                label={BODY_CLOCK_CARD.title}
                active={clockActive}
                onClick={() => { setChannelView('clock'); setInfoOpen(false) }}
              />
            )}
            {meridians.map(m => (
              <ColorChip
                key={m.id}
                color={m.color}
                label={m.hebrewName}
                active={!allActive && m.id === meridianId}
                onClick={() => { setChannelView('single'); setMeridianId(m.id); setInfoOpen(false) }}
              />
            ))}
          </>
        : fingersActive
        ? ([0, 1, 2, 3, 4, 5] as const).map(f => (
            <ColorChip
              key={f}
              color="#ffe08a"
              label={f ? FINGER_NAMES[f] : 'כל האצבעות'}
              active={fingerFilter === f}
              onClick={() => setFingerFilter(f)}
            />
          ))
        : tungGroups.map(g => (
            <ColorChip
              key={g.id}
              color={g.color}
              label={`${g.hebrewName} ← ${g.organName}`}
              active={g.id === groupId}
              onClick={() => { setGroupId(g.id); setInfoOpen(false) }}
            />
          ))}
    </div>
  )

  return (
    <div dir="rtl" className="fixed inset-0 bg-[#0e1a1b] text-[#e6efed] overflow-hidden select-none touch-none overscroll-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" aria-label="מודל תלת ממדי של הגוף" />

      {loaded !== sex && (
        <div className="absolute inset-0 grid place-items-center text-[#93aaa7] pointer-events-none">
          {loadError ? 'הגוף לא נטען. בדוק את החיבור ורענן את הדף.' : 'טוען את הגוף…'}
        </div>
      )}

      {/* סרגל עליון */}
      <div ref={topBarRef} className="absolute top-0 inset-x-0 p-3 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className="pointer-events-auto w-10 h-10 rounded-full grid place-items-center bg-[#142426]/85 border border-white/10 hover:bg-[#1c3234]"
            aria-label="חזרה לדף הבית"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Segmented
            value={mode}
            onChange={v => pickMode(v as Mode)}
            options={[{ id: 'channel', label: 'רפואה סינית' }, { id: 'tung', label: 'שיטת דונג' }]}
          />
          <Segmented
            value={sex}
            onChange={v => { setLoadError(false); setSex(v as BodySex) }}
            options={[{ id: 'female', label: 'מטופלת' }, { id: 'male', label: 'מטופל' }]}
          />
          <Segmented value={view} onChange={v => setView(v as ViewPreset)} options={VIEWS} />
          {mode === 'tung' && !editMode && (
            <Segmented
              value={tungView}
              onChange={v => { setTungView(v as TungView); setFingerId(null); setIndicationsOpen(false); setInfoOpen(false) }}
              options={[{ id: 'groups', label: 'קבוצות' }, { id: 'fingers', label: 'אצבעות' }]}
            />
          )}
        </div>

        {editMode && pickerChips}

        {/* שעון הגוף: הערוץ שהשביט עובר בו עכשיו, והשעות שלו */}
        {clockActive && (
          <div className="self-center flex items-center gap-2 rounded-full bg-[#142426]/85 border border-white/10 px-4 py-1.5 text-sm backdrop-blur" role="status" aria-live="polite">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: clockMeridian.color, boxShadow: `0 0 8px ${clockMeridian.color}` }} />
            <span className="font-medium text-white">{clockMeridian.hebrewName}</span>
            <span className="text-[#93aaa7] tabular-nums" dir="ltr">{BODY_CLOCK_HOURS[clockMeridian.id]}</span>
          </div>
        )}
      </div>

      {/* מקרא ותחתית */}
      {!editMode && (
        <div ref={bottomBarRef} className="absolute bottom-0 inset-x-0 p-3 flex flex-col items-start gap-2 pointer-events-none">
          {pickerChips}
          <div className="flex flex-wrap gap-2">
          {mode === 'channel' && !allActive && (
            <button
              onClick={() => { const next = !showPoints; setShowPoints(next); writeStorage(POINTS_KEY, next) }}
              aria-pressed={showPoints}
              className={`pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-[15px] ${
                showPoints ? 'bg-[#0d7377] border-transparent text-white' : 'bg-[#142426]/85 border-white/10 text-[#93aaa7] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-[3px]" aria-hidden="true">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </span>
              נקודות
            </button>
          )}
          {fingersActive ? (
            <FingerPointCard
              pointId={fingerId}
              onMore={() => setIndicationsOpen(true)}
            />
          ) : (
          <button
            onClick={() => setInfoOpen(true)}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#142426]/85 border border-white/10 px-4 py-2 text-[15px] hover:bg-[#1c3234]"
          >
            <span className="w-3 h-3 rounded-full" style={{ background: chipColor, boxShadow: `0 0 10px ${chipColor}` }} />
            {chipLabel}
            <span className="text-[#93aaa7] text-sm">· לחצו להסבר</span>
          </button>
          )}
          {mode === 'tung' && !fingersActive && (
            <button
              onClick={() => { setInfoOpen(false); setIndicationsOpen(true) }}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#f7f4ee] text-[#1d2b2c] px-4 py-2 text-[15px] font-medium hover:bg-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              במה הנקודות עוזרות
            </button>
          )}
          </div>
          <p dir="ltr" className="text-[11px] text-[#93aaa7]/80 text-left">{BODY_MODEL_CREDIT}</p>
        </div>
      )}

      {/* כרטיס הסבר למטופל */}
      {infoOpen && !editMode && (
        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center" role="dialog" aria-label={card.title}>
          <div className="w-full max-w-xl rounded-2xl bg-[#142426]/95 border border-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: chipColor, boxShadow: `0 0 10px ${chipColor}` }} />
                  {card.title}
                </h2>
                <p className="text-sm text-[#93aaa7] mt-0.5">{card.subtitle}</p>
              </div>
              <button
                onClick={() => setInfoOpen(false)}
                className="w-9 h-9 rounded-full grid place-items-center hover:bg-white/10"
                aria-label="סגירת ההסבר"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-3 space-y-2 text-[16px] leading-relaxed">
              {card.explanation.map(p => <p key={p}>{p}</p>)}
            </div>
          </div>
        </div>
      )}

      {indicationsOpen && mode === 'tung' && !editMode && (
        <IndicationsSheet group={fingersActive && fingerId ? fingerSheetGroup(fingerId) : group} onClose={() => setIndicationsOpen(false)} />
      )}

      {/* חלון היד המוגדלת: התלת ממד מצויר מתחת, בתוך המסגרת הזו */}
      {fingersActive && (
        <div
          ref={insetRef}
          // בטלפון מתחת לסרגל העליון (שגובהו משתנה), במסך רחב באמצע הגובה
          style={{ '--inset-top': `${safeArea.top + 8}px` } as CSSProperties}
          className="absolute left-2 top-[var(--inset-top)] w-[46vw] h-[34vh] sm:left-4 sm:top-1/2 sm:-translate-y-1/2 sm:w-[300px] sm:h-[400px] rounded-lg border border-white/15 pointer-events-none"
        >
          <div className="absolute top-2 inset-x-2 flex justify-center">
            <div className="pointer-events-auto inline-flex rounded-full bg-[#0e1a1b]/80 border border-white/10 p-0.5 text-[13px]">
              {(['palmar', 'dorsal'] as const).map(side => (
                <button
                  key={side}
                  onClick={() => setFingerSide(side)}
                  aria-pressed={fingerSide === side}
                  className={`rounded-full px-3 py-1 ${fingerSide === side ? 'bg-[#0d7377] text-white' : 'text-[#93aaa7]'}`}
                >
                  {side === 'palmar' ? 'כף היד' : 'גב היד'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* מצב עריכה */}
      {editMode && (
        <aside className="absolute inset-x-3 bottom-3 max-h-[42vh] sm:inset-x-auto sm:max-h-none sm:top-36 sm:right-3 sm:w-72 flex flex-col rounded-2xl bg-[#142426]/95 border border-white/10 shadow-2xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold">עריכת {card.title} · {sex === 'female' ? 'מטופלת' : 'מטופל'}</h2>
            <p className="text-sm text-[#93aaa7] mt-1 leading-snug">
              בוחרים נקודה מהרשימה ולוחצים על הגוף במקום הנכון. אפשר ללחוץ שוב כדי לדייק. הצד השני מתעדכן לבד.
            </p>
            {selected && (
              <p className="mt-2 text-sm leading-snug">
                <span dir="ltr" className="font-bold text-[#3fb5b0]">{selected.id}</span> {selected.hint}
              </p>
            )}
          </div>
          <ol className="flex-1 overflow-y-auto p-2 touch-pan-y overscroll-contain">
            {editItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-right rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm ${
                    item.id === activeSelectedId ? 'bg-[#0d7377] text-white' : 'hover:bg-white/5'
                  }`}
                >
                  <span dir="ltr" className="font-bold w-12 text-left tabular-nums">{item.id}</span>
                  <span className="flex-1 text-right text-[#c9d8d5] truncate">{item.label}</span>
                  {editedIds.has(item.id) && <span className="w-2 h-2 rounded-full bg-[#ffb547]" aria-label="תוקן" />}
                </button>
              </li>
            ))}
          </ol>
          <div className="p-3 border-t border-white/10 space-y-2">
            <p className="text-xs text-[#93aaa7]">
              תוקנו {editedIds.size} נקודות כאן. התיקונים נשמרים בדפדפן הזה בלבד.
            </p>
            <button onClick={copyAll} className="w-full rounded-lg bg-[#0d7377] hover:bg-[#0f8589] py-2 font-bold">
              העתקת המיקומים
            </button>
            <div className="flex gap-2">
              <button
                onClick={undoPoint}
                disabled={!editedIds.has(activeSelectedId)}
                className="flex-1 rounded-lg border border-white/15 py-1.5 text-sm disabled:opacity-40"
              >
                ביטול לנקודה
              </button>
              <button onClick={clearAll} className="flex-1 rounded-lg border border-white/15 py-1.5 text-sm text-[#f3a5a5]">
                מחיקת הכל
              </button>
            </div>
          </div>
        </aside>
      )}

      {toast && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 rounded-full bg-white text-[#0e1a1b] px-4 py-2 text-sm font-medium shadow-lg" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

function Segmented({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="pointer-events-auto inline-flex rounded-full bg-[#142426]/85 border border-white/10 p-1 backdrop-blur">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={o.id === value}
          className={`rounded-full px-3.5 py-1.5 text-[15px] transition-colors ${
            o.id === value ? 'bg-[#0d7377] text-white' : 'text-[#93aaa7] hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** נקודת הצבע של "כל הערוצים": גלגל מכל צבעי הערוצים, לפי סדר המחזור */
const ALL_CHANNELS_DOT = `conic-gradient(${meridians.map(m => m.color).join(', ')})`

const ALL_CHANNELS_CARD = {
  title: 'כל הערוצים',
  subtitle: '十二經脈 · 12 הערוצים הראשיים',
  explanation: [
    'כאן רואים את כל 12 הערוצים יחד, וכל נקודת אור מראה לאיזה כיוון זורם הערוץ שלה.',
    'הערוצים לא עובדים כל אחד לבד. הם מחוברים זה לזה ברצף אחד: ערוץ הריאות ממשיך לערוץ המעי הגס, ממנו לקיבה, לטחול, ללב, וכך הלאה עד ערוץ הכבד, שחוזר ומתחבר לריאות.',
    'לכן דיקור בנקודה אחת משפיע על כל המערכת. לחיצה על קו פותחת את הערוץ הזה לבד, עם ההסבר שלו.',
  ],
}

/** שעון הגוף לפי הרפואה הסינית: שעתיים לכל ערוץ */
const BODY_CLOCK_HOURS: Record<string, string> = {
  lung: '03:00-05:00', largeIntestine: '05:00-07:00', stomach: '07:00-09:00', spleen: '09:00-11:00',
  heart: '11:00-13:00', smallIntestine: '13:00-15:00', bladder: '15:00-17:00', kidney: '17:00-19:00',
  pericardium: '19:00-21:00', tripleBurner: '21:00-23:00', gallbladder: '23:00-01:00', liver: '01:00-03:00',
}

const BODY_CLOCK_DOT = 'radial-gradient(circle, #fff 0 30%, #6cb8ff 31% 100%)'

const BODY_CLOCK_CARD = {
  title: 'שעון הגוף',
  subtitle: '子午流注 · מחזור הזרימה בין הערוצים',
  explanation: [
    'נקודת האור עוברת בין הערוצים לפי הסדר שבו הם מחוברים: מהריאות למעי הגס, לקיבה, לטחול, ללב וכך הלאה, עד הכבד, שחוזר לריאות.',
    'ברפואה הסינית מתארים את המחזור הזה גם כשעון של 24 שעות: לכל ערוץ יש שעתיים ביממה שבהן הוא בשיא. השעות מופיעות למעלה.',
    'בגלל שהערוצים מחוברים ברצף אחד, איזון של ערוץ אחד משפיע גם על הערוצים שלפניו ושאחריו.',
  ],
}

function ColorChip({ color, label, active, onClick }: {
  color: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`pointer-events-auto shrink-0 whitespace-nowrap flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm backdrop-blur transition-colors ${
        active ? 'bg-[#142426] border-white/40 text-white' : 'bg-[#142426]/70 border-white/10 text-[#93aaa7] hover:text-white'
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: active ? `0 0 8px ${color}` : 'none' }} />
      {label}
    </button>
  )
}

/** נקודת אצבע בודדת במבנה של קבוצה, בשביל מסך ההתוויות */
function fingerSheetGroup(pointId: string) {
  const record = allPoints.find(p => p.id === pointId)
  return { id: pointId, hebrewName: record?.hebrewName ?? pointId, chineseName: record?.chineseName ?? '', pointIds: [pointId] }
}

/** "11.09 · Xin Xi", ובנקודות שהמזהה שלהן הוא כבר השם - רק השם */
function codeLabel(id: string, pinyin?: string) {
  if (!pinyin) return id
  const plain = (t: string) => t.normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return /^\d/.test(id) &&!plain(pinyin).startsWith(plain(id)) ? `${id} · ${pinyin}` : pinyin
}

/** כרטיס הנקודה שנבחרה ביד: שם, על מה היא משפיעה בעיקר לפי דונג, וההתוויות הראשונות */
function FingerPointCard({ pointId, onMore }: { pointId: string | null; onMore: () => void }) {
  if (!pointId) {
    return (
      // אותו גובה כמו הכרטיס המלא, כדי שהגוף לא יקפוץ כשבוחרים נקודה
      <div className="pointer-events-auto w-full max-w-md min-h-[136px] grid place-items-center rounded-2xl bg-[#142426]/90 border border-white/10 px-4 text-[15px] text-[#c9d8d5] text-center">
        לחצו על נקודה ביד כדי לראות על מה היא משפיעה
      </div>
    )
  }
  const record = allPoints.find(p => p.id === pointId)
  const target = fingerTargets[pointId]
  const uses = mainDongUses(pointId)
  return (
    <div className="pointer-events-auto w-full max-w-md min-h-[136px] rounded-2xl bg-[#142426]/95 border border-white/10 p-4 shadow-2xl">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold">{record?.hebrewName ?? pointId}</h2>
        <span dir="ltr" className="text-sm text-[#93aaa7] tabular-nums">{codeLabel(pointId, record?.pinyinName)}</span>
      </div>
      {target && (
        <p className="mt-1 text-[15px]">
          משפיעה בעיקר על <span className="font-bold text-[#ffd36e]">{regionNames[target]}</span>
        </p>
      )}
      {uses.length > 0 && <p className="mt-1 text-sm text-[#c9d8d5]">דונג: {uses.join(' · ')}</p>}
      <button onClick={onMore} className="mt-3 rounded-full bg-[#f7f4ee] text-[#1d2b2c] px-4 py-1.5 text-sm font-medium hover:bg-white">
        במה הנקודה עוזרת
      </button>
    </div>
  )
}
