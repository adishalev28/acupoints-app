import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { points } from '../data/points'
import { zones } from '../data/zones'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'
import { isGroupedIndications } from '../types'

/** Try point image: .jpg then .png then .webp, hide if none exists */
function PointImage({ pointId }: { pointId: string }) {
  const formats = ['jpg', 'png', 'webp']
  const [formatIdx, setFormatIdx] = useState(0)

  if (formatIdx >= formats.length) return null

  return (
    <div className="flex justify-center">
      <img
        src={`/images/${pointId}.${formats[formatIdx]}`}
        alt={`${pointId}`}
        className="w-full max-w-xs rounded-xl border border-gray-100"
        onError={() => setFormatIdx(prev => prev + 1)}
      />
    </div>
  )
}

/** Section wrapper with icon and title */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/80 border-b border-gray-100">
        <span className="text-teal-primary">{icon}</span>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="px-4 py-3">
        {children}
      </div>
    </div>
  )
}

/** Source label */
function sourceLabel(source: string): string {
  switch (source) {
    case 'tung-study': return 'A Study on Tung\'s Acupuncture'
    case 'sean-goodman': return 'Sean Goodman'
    case 'mccann-atlas': return 'McCann Atlas'
    default: return source
  }
}

export default function PointDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { getNote, setNote } = useNotes()
  const [noteText, setNoteText] = useState('')
  const [editingNote, setEditingNote] = useState(false)

  const point = points.find(p => p.id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Swipe navigation
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const goNext = useCallback(() => {
    const idx = points.findIndex(p => p.id === id)
    if (idx < points.length - 1) navigate(`/point/${points[idx + 1].id}`)
  }, [id, navigate])
  const goPrev = useCallback(() => {
    const idx = points.findIndex(p => p.id === id)
    if (idx > 0) navigate(`/point/${points[idx - 1].id}`)
  }, [id, navigate])

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return
      const dx = e.changedTouches[0].clientX - touchStart.current.x
      const dy = e.changedTouches[0].clientY - touchStart.current.y
      touchStart.current = null
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return
      if (dx > 0) goNext()
      else goPrev()
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [goNext, goPrev])

  if (!point) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">הנקודה לא נמצאה</p>
      </div>
    )
  }

  const zone = zones.find(z => z.id === point.zone)
  const savedNote = getNote(point.id)

  // Find prev/next points
  const pointIdx = points.findIndex(p => p.id === id)
  const prevPoint = pointIdx > 0 ? points[pointIdx - 1] : null
  const nextPoint = pointIdx < points.length - 1 ? points[pointIdx + 1] : null

  // Find other points in same Dao Ma group
  const daoMaSiblings = point.daoMaGroup
    ? points.filter(p => p.daoMaGroup === point.daoMaGroup && p.id !== point.id)
    : []

  const handleSaveNote = () => {
    setNote(point.id, noteText)
    setEditingNote(false)
  }

  const handleStartEdit = () => {
    setNoteText(savedNote)
    setEditingNote(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header — compact with point identity */}
      <div className="bg-teal-primary text-white px-5 pt-7 pb-5">
        {/* Top row: back + zone + favorite */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="p-1 -mr-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {prevPoint ? (
              <button onClick={() => navigate(`/point/${prevPoint.id}`)} className="p-1 text-white/70 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : <div className="w-7" />}
            {zone && (
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {zone.name} ({point.zone})
              </span>
            )}
            {nextPoint ? (
              <button onClick={() => navigate(`/point/${nextPoint.id}`)} className="p-1 text-white/70 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : <div className="w-7" />}
          </div>
          <button onClick={() => toggleFavorite(point.id)} className="p-1 -ml-1">
            <svg
              className={`w-6 h-6 ${isFavorite(point.id) ? 'text-amber-300 fill-amber-300' : 'text-white/50'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        {/* Point ID + Pinyin */}
        <div className="text-center">
          <div className="text-2xl font-bold tracking-wide">
            {point.id}
          </div>
          <div className="text-lg font-medium mt-0.5 text-white/90">
            {point.pinyinName}
          </div>
          <div className="text-sm text-white/70 mt-1">
            [{point.chineseName}]
          </div>
          <div className="text-base font-semibold mt-1">
            {point.hebrewName}
          </div>
          {point.englishName && (
            <div className="text-xs text-white/60 mt-0.5">
              {point.englishName}
            </div>
          )}
        </div>

        {/* Dao Ma group badge */}
        {point.daoMaGroup && (
          <div className="mt-3 flex justify-center">
            <span className="text-xs bg-amber-400/90 text-gray-900 px-3 py-1 rounded-full font-medium">
              {'\u9053\u99AC'} {point.daoMaGroup}
              {daoMaSiblings.length > 0 && (
                <span className="mr-1">
                  {' '}({[point.id, ...daoMaSiblings.map(p => p.id)].join(', ')})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="px-4 py-4 space-y-3">

        {/* Image (if exists) */}
        <PointImage pointId={point.id} />

        {/* 1. Location */}
        <Section
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          }
          title="מיקום"
        >
          <p className="text-gray-700 text-sm leading-relaxed">{point.location}</p>
        </Section>

        {/* 2. Needling */}
        <Section
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.13a18 18 0 01-14.726 0l-.772-.13c-1.717-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          }
          title="טכניקת דיקור"
        >
          <p className="text-gray-700 text-sm leading-relaxed">{point.needling}</p>
        </Section>

        {/* 3. Reaction Areas */}
        <Section
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
          title="אזור תגובה"
        >
          <div className="flex flex-wrap gap-2">
            {point.reactionAreas.map((area, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100">
                {area}
              </span>
            ))}
          </div>
        </Section>

        {/* 4. Indications */}
        <Section
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
          title="התוויות"
        >
          {isGroupedIndications(point.indications) ? (
            <div className="space-y-3">
              {point.indications.map((group, gi) => (
                <div key={gi}>
                  <h4 className="text-xs font-bold text-gray-500 mb-1.5">{group.category}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item, ii) => (
                      <span key={ii} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {point.indications.map((indication, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                  {indication}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* 5. Additional Info */}
        {point.additionalInfo && (
          <Section
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            }
            title="מידע נוסף"
          >
            <p className="text-gray-700 text-sm leading-relaxed">{point.additionalInfo}</p>
          </Section>
        )}

        {/* 6. Sources */}
        {point.sources.length > 0 && (
          <Section
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            }
            title="מקורות"
          >
            <div className="space-y-1">
              {point.sources.map((s, i) => (
                <div key={i} className="text-xs text-gray-500">
                  <span className="font-medium text-gray-600">{sourceLabel(s.source)}</span>
                  {s.notes && <span className="text-gray-400"> — {s.notes}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 7. Personal Note */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50/80 border-b border-amber-100/50">
            <span className="text-amber-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </span>
            <h3 className="font-bold text-gray-800 text-sm">הערה אישית</h3>
          </div>
          <div className="px-4 py-3">
            {editingNote ? (
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary resize-none"
                  placeholder="כתוב הערה..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-teal-primary text-white text-xs font-medium rounded-lg"
                  >
                    שמור
                  </button>
                  <button
                    onClick={() => setEditingNote(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            ) : savedNote ? (
              <div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{savedNote}</p>
                <button
                  onClick={handleStartEdit}
                  className="mt-2 text-teal-primary text-xs font-medium"
                >
                  עריכה
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEdit}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs hover:border-teal-primary/30 transition-colors"
              >
                הוסף הערה...
              </button>
            )}
          </div>
        </div>

        {/* Navigation: prev/next */}
        <div className="flex gap-2 pt-2">
          {prevPoint ? (
            <button
              onClick={() => navigate(`/point/${prevPoint.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span>{prevPoint.id}</span>
            </button>
          ) : <div className="flex-1" />}
          {nextPoint ? (
            <button
              onClick={() => navigate(`/point/${nextPoint.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              <span>{nextPoint.id}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : <div className="flex-1" />}
        </div>
      </div>
    </div>
  )
}
