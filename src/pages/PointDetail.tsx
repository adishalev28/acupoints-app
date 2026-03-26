import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { points } from '../data/points'
import { zones } from '../data/zones'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'
import { isGroupedIndications } from '../types'
import { categorizeIndications, categoryColors } from '../utils/categorizeIndications'
import { normalizeReactionArea, HIERARCHY_LEVELS } from '../utils/reactionAreaNormalization'
import { getTreatmentPrinciples } from '../utils/treatmentPrinciples'

/** Try point image: .jpg then .png then .webp, hide if none exists */
function PointImage({ pointId, imageId }: { pointId: string; imageId?: string }) {
  const formats = ['jpg', 'png', 'webp']
  const [formatIdx, setFormatIdx] = useState(0)
  const fileBase = imageId || pointId

  if (formatIdx >= formats.length) return null

  return (
    <div className="flex justify-center">
      <img
        src={`/images/${fileBase}.${formats[formatIdx]}`}
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
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/80 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
        <span className="text-teal-primary">{icon}</span>
        <h3 className="font-bold text-gray-800 dark:text-dark-text text-sm">{title}</h3>
      </div>
      <div className="px-4 py-3">
        {children}
      </div>
    </div>
  )
}

/** Render additionalInfo with paragraph breaks and section headers */
function AdditionalInfoContent({ text }: { text: string }) {
  let processed = text

  // Insert paragraph breaks before English person names mid-text (after ". ")
  // Pattern: 2-4 capitalized words (may include hyphens), followed by colon
  processed = processed.replace(
    /\.\s+((?:[A-Z][a-z]+(?:-[A-Z][a-z]+)?\s+){1,3}[A-Z][a-z]+(?:-[A-Z][a-z]+)?):\s/g,
    '.\n\n$1: '
  )

  // Split into paragraphs
  const paragraphs = processed.split(/\n\n/).map(p => p.trim()).filter(Boolean)

  // English person name at start: "Hu Wen Zhi:", "Chen Du Ren:", "Lai Jing-Xiong:"
  const enNameRe = /^((?:[A-Z][a-z]+(?:-[A-Z][a-z]+)?\s+){1,3}[A-Z][a-z]+(?:-[A-Z][a-z]+)?):\s*([\s\S]*)$/

  // Hebrew section header keywords (transliterated names with ', ד"ר, מקרים, etc.)
  const HEADER_KEYWORDS = /['׳]|ד"ר|מקרים|הדמיה|^שם\sה|מאסטר/

  const sections = paragraphs.map(para => {
    const enMatch = para.match(enNameRe)
    if (enMatch) return { name: enMatch[1], content: enMatch[2] }

    // Hebrew section header: short text (≤60 chars) before first colon, with keyword
    const heMatch = para.match(/^(.{3,60}?):\s*([\s\S]*)$/)
    if (heMatch && HEADER_KEYWORDS.test(heMatch[1])) {
      return { name: heMatch[1], content: heMatch[2] }
    }

    return { content: para }
  })

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i}>
          {section.name && (
            <h5 className="font-bold text-teal-700 text-sm mb-1">{section.name}</h5>
          )}
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {section.content}
          </p>
        </div>
      ))}
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
  const [showSwipeHint, setShowSwipeHint] = useState(() => !localStorage.getItem('swipeHintSeen'))
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

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

  const handleShare = async () => {
    const url = window.location.href
    const text = `${point.pinyinName} (${point.hebrewName}) — ${point.chineseName}`

    if (navigator.share) {
      try {
        await navigator.share({ title: point.pinyinName, text, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-24">
      {/* Header — compact with point identity */}
      <div className="bg-teal-primary text-white px-5 pt-7 pb-5">
        {/* Top row: back + zone + favorite */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="p-2.5 -mr-2" aria-label="חזרה">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {prevPoint ? (
              <button onClick={() => navigate(`/point/${prevPoint.id}`)} className="p-2.5 text-white/70 hover:text-white" aria-label={`נקודה קודמת: ${prevPoint.pinyinName}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : <div className="w-10" />}
            {zone && (
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {zone.name} ({point.zone})
              </span>
            )}
            {nextPoint ? (
              <button onClick={() => navigate(`/point/${nextPoint.id}`)} className="p-2.5 text-white/70 hover:text-white" aria-label={`נקודה הבאה: ${nextPoint.pinyinName}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : <div className="w-10" />}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleShare} className="p-2.5" aria-label="שתף נקודה">
              {shareStatus === 'copied' ? (
                <svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white/50 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
            <button onClick={() => toggleFavorite(point.id)} className="p-2.5 -ml-2" aria-label={isFavorite(point.id) ? 'הסר ממועדפים' : 'הוסף למועדפים'}>
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
        </div>

        {/* Point ID + Pinyin */}
        <div className="text-center">
          {/^\d/.test(point.id) ? (
            <>
              <div className="text-2xl font-bold tracking-wide">
                {point.id}
              </div>
              <div className="text-lg font-medium mt-0.5 text-white/90">
                {point.pinyinName}
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold tracking-wide">
              {point.pinyinName}
            </div>
          )}
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

      {/* Swipe hint - shown once */}
      {showSwipeHint && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-2 px-4 py-2.5 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-700">
          <span>החלק ימינה/שמאלה למעבר בין נקודות</span>
          <button
            onClick={() => {
              setShowSwipeHint(false)
              localStorage.setItem('swipeHintSeen', '1')
            }}
            className="text-teal-500 hover:text-teal-700 font-bold"
            aria-label="סגור רמז"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content sections */}
      <div className="px-4 py-4 space-y-3">

        {/* Image (if exists) */}
        <PointImage pointId={point.id} imageId={point.imageId} />

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
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{point.location}</p>
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
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{point.needling}</p>

          {/* Treatment principles inline */}
          {(() => {
            const tp = getTreatmentPrinciples(point)
            return (
              <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-1.5">
                <div className="text-xs font-bold text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
                  <span>📐</span> עקרונות בחירת צד
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-800/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                    {tp.sideEmoji} {tp.sideHebrew}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    📍 {tp.levelHebrew}
                  </span>
                </div>
                {tp.levelPrinciple && (
                  <div className="text-[11px] text-blue-700 dark:text-blue-300">{tp.levelPrinciple}</div>
                )}
                {tp.notes.length > 0 && (
                  <div className="text-[10px] text-blue-600/80 dark:text-blue-400/70 space-y-0.5">
                    {tp.notes.map((note, i) => (
                      <div key={i}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
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
            {point.reactionAreas.map((area, i) => {
              const norm = normalizeReactionArea(area)
              const lvl = norm.level ? HIERARCHY_LEVELS[norm.level] : null
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    lvl
                      ? `${lvl.bg} ${lvl.darkBg} ${lvl.text} ${lvl.darkText} ${lvl.border} ${lvl.darkBorder}`
                      : 'bg-teal-50 dark:bg-teal-primary/10 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-primary/30'
                  }`}
                >
                  {lvl && <span className={`w-2 h-2 rounded-full ${lvl.dot}`} />}
                  {norm.normalized}
                  {norm.sourceNote && <span className="opacity-50">({norm.sourceNote})</span>}
                </span>
              )
            })}
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
          {(() => {
            const groups = isGroupedIndications(point.indications)
              ? point.indications
              : categorizeIndications(point.indications)
            return (
              <div className="space-y-3">
                {groups.map((group, gi) => {
                  const colors = categoryColors[group.category] || categoryColors['כללי']
                  return (
                    <div key={gi}>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-dark-muted mb-1.5">{group.category}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((item, ii) => (
                          <span key={ii} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
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
            <AdditionalInfoContent text={point.additionalInfo} />
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
                <div key={i} className="text-xs text-gray-500 dark:text-dark-muted">
                  <span className="font-medium text-gray-600 dark:text-gray-400">{sourceLabel(s.source)}</span>
                  {s.notes && <span className="text-gray-400 dark:text-gray-500"> — {s.notes}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 7. Personal Note */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50/80 dark:bg-amber-500/10 border-b border-amber-100/50 dark:border-amber-500/20">
            <span className="text-amber-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </span>
            <h3 className="font-bold text-gray-800 dark:text-dark-text text-sm">הערה אישית</h3>
          </div>
          <div className="px-4 py-3">
            {editingNote ? (
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text text-sm focus:outline-none focus:border-teal-primary focus:ring-2 focus:ring-teal-primary/30 resize-none"
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
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-text text-xs font-medium rounded-lg"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            ) : savedNote ? (
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{savedNote}</p>
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
                className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl text-gray-400 dark:text-dark-muted text-xs hover:border-teal-primary/30 transition-colors"
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
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span>{/^\d/.test(prevPoint.id) ? prevPoint.id : prevPoint.pinyinName}</span>
            </button>
          ) : <div className="flex-1" />}
          {nextPoint ? (
            <button
              onClick={() => navigate(`/point/${nextPoint.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
            >
              <span>{/^\d/.test(nextPoint.id) ? nextPoint.id : nextPoint.pinyinName}</span>
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
