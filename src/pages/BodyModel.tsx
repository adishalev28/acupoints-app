import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BodyScene, type ViewPreset } from '../components/body/BodyScene'
import IndicationsSheet from '../components/body/IndicationsSheet'
import { BODY_MODEL_CREDIT, meridians, type BodySex, type SurfacePoint } from '../data/bodyModel/meridians'
import { meridianPaths } from '../data/bodyModel/meridianPaths'
import { tungGroups } from '../data/bodyModel/tungGroups'
import { tungPoints } from '../data/bodyModel/tungPoints'
import { points as allPoints } from '../data/points'

/** תיקונים ממצב העריכה, לפי גוף ושכבה: מזהה ערוץ, או 'tung' לנקודות דונג */
type Edits = Record<BodySex, Record<string, Record<string, SurfacePoint>>>
type Mode = 'channel' | 'tung'

const SEX_KEY = 'bodyModel.sex'
const EDITS_KEY = 'bodyModel.edits.v1'
const TUNG_LAYER = 'tung'

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
  const [showAll, setShowAll] = useState(() => searchParams.get('channel') === 'all')
  const [groupId, setGroupId] = useState(() =>
    tungGroups.find(g => g.id === searchParams.get('group'))?.id ?? tungGroups[0].id)
  const [sex, setSex] = useState<BodySex>(() => readStorage<BodySex>(SEX_KEY, 'female'))
  const [view, setView] = useState<ViewPreset>('front')
  const [loaded, setLoaded] = useState<BodySex | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [indicationsOpen, setIndicationsOpen] = useState(false)
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
    () => ({ ...meridianPaths[sex][meridian.id], ...edits[sex][meridian.id] }),
    [sex, edits, meridian],
  )
  const tungPaths = useMemo(
    () => ({ ...tungPoints[sex], ...edits[sex][TUNG_LAYER] }),
    [sex, edits],
  )
  const layerEdits = edits[sex][layer] ?? {}
  const editedIds = new Set(Object.keys(layerEdits).filter(id => editItems.some(i => i.id === id)))

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
  const allActive = showAll && mode === 'channel' && !editMode
  const allChannels = useMemo(
    () => meridians.map(def => ({ def, paths: { ...meridianPaths[sex][def.id], ...edits[sex][def.id] } })),
    [sex, edits],
  )

  useEffect(() => {
    if (loaded !== sex) return
    if (allActive) sceneRef.current?.setMeridians(allChannels)
    else sceneRef.current?.setMeridian(meridian, channelPaths)
  }, [loaded, sex, meridian, channelPaths, allActive, allChannels])

  useEffect(() => {
    if (loaded === sex) sceneRef.current?.setTungGroup(mode === 'tung' ? group : null, tungPaths)
  }, [loaded, sex, mode, group, tungPaths])

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
              setShowAll(false)
              setMeridianId(id)
            }
            setInfoOpen(true)
          },
      onTungPointTap: editMode || mode !== 'tung' ? undefined : () => { setInfoOpen(false); setIndicationsOpen(true) },
      onMarkerTap: editMode ? id => setSelectedId(id) : undefined,
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
    setView('front')
    setInfoOpen(false)
  }

  const selected = editItems.find(i => i.id === activeSelectedId)
  const chipColor = mode === 'tung' ? group.color : allActive ? ALL_CHANNELS_DOT : meridian.color
  const card = mode === 'tung'
    ? { title: group.hebrewName, subtitle: `${group.id} · ${group.chineseName}`, explanation: group.explanation }
    : allActive
      ? ALL_CHANNELS_CARD
      : { title: meridian.hebrewName, subtitle: meridian.chineseName, explanation: meridian.explanation }
  const chipLabel = mode === 'tung' ? `${group.hebrewName} ← ${group.organName}` : allActive ? ALL_CHANNELS_CARD.title : meridian.hebrewName

  // בחירת ערוץ או קבוצת נקודות. בטלפון בתחתית המסך, כדי לא לכסות את הגוף
  const pickerChips = (
    <div className={`flex gap-2 ${editMode ? 'flex-wrap' : 'flex-nowrap overflow-x-auto max-w-full pointer-events-auto [scrollbar-width:none]'}`}>
      {mode === 'channel'
        ? <>
            {!editMode && (
              <ColorChip
                color={ALL_CHANNELS_DOT}
                label={ALL_CHANNELS_CARD.title}
                active={allActive}
                onClick={() => { setShowAll(true); setInfoOpen(false) }}
              />
            )}
            {meridians.map(m => (
              <ColorChip
                key={m.id}
                color={m.color}
                label={m.hebrewName}
                active={!allActive && m.id === meridianId}
                onClick={() => { setShowAll(false); setMeridianId(m.id); setInfoOpen(false) }}
              />
            ))}
          </>
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
    <div dir="rtl" className="fixed inset-0 bg-[#0e1a1b] text-[#e6efed] overflow-hidden select-none">
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
        </div>

        {editMode && pickerChips}
      </div>

      {/* מקרא ותחתית */}
      {!editMode && (
        <div ref={bottomBarRef} className="absolute bottom-0 inset-x-0 p-3 flex flex-col items-start gap-2 pointer-events-none">
          {pickerChips}
          <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInfoOpen(true)}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#142426]/85 border border-white/10 px-4 py-2 text-[15px] hover:bg-[#1c3234]"
          >
            <span className="w-3 h-3 rounded-full" style={{ background: chipColor, boxShadow: `0 0 10px ${chipColor}` }} />
            {chipLabel}
            <span className="text-[#93aaa7] text-sm">· לחצו להסבר</span>
          </button>
          {mode === 'tung' && (
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
        <IndicationsSheet group={group} onClose={() => setIndicationsOpen(false)} />
      )}

      {/* מצב עריכה */}
      {editMode && (
        <aside className="absolute inset-x-3 bottom-3 max-h-[42vh] sm:inset-x-auto sm:max-h-none sm:top-28 sm:right-3 sm:w-72 flex flex-col rounded-2xl bg-[#142426]/95 border border-white/10 shadow-2xl">
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
          <ol className="flex-1 overflow-y-auto p-2">
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
