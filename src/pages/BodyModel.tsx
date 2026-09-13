import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BodyScene, type ViewPreset } from '../components/body/BodyScene'
import { BODY_MODEL_CREDIT, stomachMeridian, type BodySex, type SurfacePoint } from '../data/bodyModel/meridians'
import { meridianPaths } from '../data/bodyModel/meridianPaths'

type Edits = Record<BodySex, Record<string, Record<string, SurfacePoint>>>

const SEX_KEY = 'bodyModel.sex'
const EDITS_KEY = 'bodyModel.edits.v1'
const meridian = stomachMeridian

const VIEWS: { id: ViewPreset; label: string }[] = [
  { id: 'front', label: 'חזית' },
  { id: 'side', label: 'צד' },
  { id: 'back', label: 'גב' },
  { id: 'head', label: 'ראש' },
  { id: 'leg', label: 'רגל' },
]

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

export default function BodyModel() {
  const [searchParams] = useSearchParams()
  const editMode = searchParams.get('edit') === '1'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<BodyScene | null>(null)
  const [sex, setSex] = useState<BodySex>(() => readStorage<BodySex>(SEX_KEY, 'female'))
  const [view, setView] = useState<ViewPreset>('front')
  const [loaded, setLoaded] = useState<BodySex | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [edits, setEdits] = useState<Edits>(() => readStorage(EDITS_KEY, emptyEdits()))
  const [selectedId, setSelectedId] = useState<string>(meridian.controlPoints[0].id)
  const [toast, setToast] = useState<string | null>(null)

  const paths = useMemo(
    () => ({ ...meridianPaths[sex][meridian.id], ...edits[sex][meridian.id] }),
    [sex, edits],
  )
  const editedIds = new Set(Object.keys(edits[sex][meridian.id] ?? {}))

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
    sceneRef.current?.loadBody(sex)
      .then(() => setLoaded(sex))
      .catch(() => setLoadError(true))
  }, [sex])

  useEffect(() => {
    if (loaded !== sex) return
    sceneRef.current?.setMeridian(meridian, paths)
    sceneRef.current?.setMarkers(editMode ? paths : null, selectedId)
  }, [loaded, sex, paths, editMode, selectedId])

  useEffect(() => {
    if (loaded) sceneRef.current?.setView(view)
  }, [view, loaded])

  // האירועים נקראים מתוך הסצנה, ולכן מתעדכנים בכל רינדור עם הערכים העדכניים
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    scene.events = {
      onMeridianTap: editMode ? undefined : () => setInfoOpen(true),
      onMarkerTap: editMode ? id => setSelectedId(id) : undefined,
      onBodyTap: editMode
        ? point => {
            const next: Edits = {
              ...edits,
              [sex]: { ...edits[sex], [meridian.id]: { ...edits[sex][meridian.id], [selectedId]: point } },
            }
            setEdits(next)
            writeStorage(EDITS_KEY, next)
            const i = meridian.controlPoints.findIndex(cp => cp.id === selectedId)
            const nextPoint = meridian.controlPoints[i + 1]
            if (nextPoint) setSelectedId(nextPoint.id)
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
    const current = { ...edits[sex][meridian.id] }
    delete current[selectedId]
    updateEdits({ ...edits, [sex]: { ...edits[sex], [meridian.id]: current } })
  }

  function clearAll() {
    if (!window.confirm('למחוק את כל התיקונים של שני הגופים? אי אפשר לבטל.')) return
    updateEdits(emptyEdits())
    showToast('התיקונים נמחקו')
  }

  async function copyAll() {
    const merged = {
      female: { [meridian.id]: { ...meridianPaths.female[meridian.id], ...edits.female[meridian.id] } },
      male: { [meridian.id]: { ...meridianPaths.male[meridian.id], ...edits.male[meridian.id] } },
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(merged))
      showToast('המיקומים הועתקו. אפשר להדביק בשיחה')
    } catch {
      showToast('ההעתקה נחסמה בדפדפן')
    }
  }

  const selected = meridian.controlPoints.find(cp => cp.id === selectedId)

  return (
    <div dir="rtl" className="fixed inset-0 bg-[#0e1a1b] text-[#e6efed] overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" aria-label="מודל תלת ממדי של הגוף" />

      {loaded !== sex && (
        <div className="absolute inset-0 grid place-items-center text-[#93aaa7] pointer-events-none">
          {loadError ? 'הגוף לא נטען. בדוק את החיבור ורענן את הדף.' : 'טוען את הגוף…'}
        </div>
      )}

      {/* סרגל עליון */}
      <div className="absolute top-0 inset-x-0 p-3 flex flex-wrap items-center gap-2 pointer-events-none">
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
          value={sex}
          onChange={v => { setLoadError(false); setSex(v as BodySex) }}
          options={[{ id: 'female', label: 'מטופלת' }, { id: 'male', label: 'מטופל' }]}
        />
        <Segmented value={view} onChange={v => setView(v as ViewPreset)} options={VIEWS} />
      </div>

      {/* מקרא ותחתית */}
      {!editMode && (
        <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col items-start gap-2 pointer-events-none">
          <button
            onClick={() => setInfoOpen(true)}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#142426]/85 border border-white/10 px-4 py-2 text-[15px] hover:bg-[#1c3234]"
          >
            <span className="w-3 h-3 rounded-full" style={{ background: meridian.color, boxShadow: `0 0 10px ${meridian.color}` }} />
            {meridian.hebrewName}
            <span className="text-[#93aaa7] text-sm">· לחצו להסבר</span>
          </button>
          <p dir="ltr" className="text-[11px] text-[#93aaa7]/80 text-left">{BODY_MODEL_CREDIT}</p>
        </div>
      )}

      {/* כרטיס הסבר למטופל */}
      {infoOpen && !editMode && (
        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center" role="dialog" aria-label={meridian.hebrewName}>
          <div className="w-full max-w-xl rounded-2xl bg-[#142426]/95 border border-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: meridian.color, boxShadow: `0 0 10px ${meridian.color}` }} />
                  {meridian.hebrewName}
                </h2>
                <p className="text-sm text-[#93aaa7] mt-0.5">{meridian.chineseName}</p>
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
              {meridian.explanation.map(p => <p key={p}>{p}</p>)}
            </div>
          </div>
        </div>
      )}

      {/* מצב עריכה */}
      {editMode && (
        <aside className="absolute inset-x-3 bottom-3 max-h-[42vh] sm:inset-x-auto sm:max-h-none sm:top-16 sm:right-3 sm:w-72 flex flex-col rounded-2xl bg-[#142426]/95 border border-white/10 shadow-2xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold">עריכת {meridian.hebrewName} · {sex === 'female' ? 'מטופלת' : 'מטופל'}</h2>
            <p className="text-sm text-[#93aaa7] mt-1 leading-snug">
              בוחרים נקודה ולוחצים על הגוף במקום הנכון. הצד השני מתעדכן לבד, והרשימה עוברת לנקודה הבאה.
            </p>
            {selected && (
              <p className="mt-2 text-sm">
                <span className="font-bold text-[#3fb5b0]">{selected.id}</span> {selected.hint}
              </p>
            )}
          </div>
          <ol className="flex-1 overflow-y-auto p-2">
            {meridian.controlPoints.map(cp => (
              <li key={cp.id}>
                <button
                  onClick={() => setSelectedId(cp.id)}
                  className={`w-full text-right rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm ${
                    cp.id === selectedId ? 'bg-[#0d7377] text-white' : 'hover:bg-white/5'
                  }`}
                >
                  <span dir="ltr" className="font-bold w-12 text-left tabular-nums">{cp.id}</span>
                  <span dir="ltr" className="flex-1 text-left text-[#c9d8d5]">{cp.pinyin}</span>
                  {editedIds.has(cp.id) && <span className="w-2 h-2 rounded-full bg-[#ffb547]" aria-label="תוקן" />}
                </button>
              </li>
            ))}
          </ol>
          <div className="p-3 border-t border-white/10 space-y-2">
            <p className="text-xs text-[#93aaa7]">
              תוקנו {editedIds.size} נקודות בגוף הזה. התיקונים נשמרים בדפדפן הזה בלבד.
            </p>
            <button onClick={copyAll} className="w-full rounded-lg bg-[#0d7377] hover:bg-[#0f8589] py-2 font-bold">
              העתקת המיקומים
            </button>
            <div className="flex gap-2">
              <button
                onClick={undoPoint}
                disabled={!editedIds.has(selectedId)}
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
        <div className="absolute top-16 left-1/2 -translate-x-1/2 rounded-full bg-white text-[#0e1a1b] px-4 py-2 text-sm font-medium shadow-lg" role="status">
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
