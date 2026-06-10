import { useState } from 'react'
import type { TreatmentVideo } from '../data/videos'

/** בונה את כתובת ההטמעה (iframe) לפי הפלטפורמה */
function buildEmbedSrc(video: TreatmentVideo): string {
  if (video.platform === 'youtube') {
    const id = extractYouTubeId(video.url)
    return id ? `https://www.youtube.com/embed/${id}` : video.url
  }
  // facebook (reels / videos) - הטמעה דרך iframe קליל, ללא ה-SDK
  const href = encodeURIComponent(video.url)
  return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&t=0`
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  return match ? match[1] : null
}

/** כתובת תמונת הכריכה השמורה (אם קיימת לסרטון הזה) */
function thumbSrc(video: TreatmentVideo): string | null {
  // הכריכות נשמרו לפי מזהה הריל המספרי בפייסבוק
  if (video.platform === 'facebook' && /^\d+$/.test(video.id)) {
    return `${import.meta.env.BASE_URL}reel-thumbs/${video.id}.jpg`
  }
  return null
}

interface VideoCardProps {
  video: TreatmentVideo
}

export default function VideoCard({ video }: VideoCardProps) {
  const [playing, setPlaying] = useState(false)
  const [thumbFailed, setThumbFailed] = useState(false)
  const thumb = thumbSrc(video)
  const showThumb = thumb && !thumbFailed

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm">
      {/* כותרת + מטא */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="inline-block text-[11px] font-medium text-teal-primary bg-teal-50 dark:bg-teal-primary/15 rounded-full px-2.5 py-0.5">
            {video.category}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-dark-muted truncate">
            {video.source}
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-dark-text leading-snug">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>

      {/* אזור הנגן - נטען רק בלחיצה (lazy load) */}
      {playing ? (
        <div className="relative w-full bg-black" style={{ aspectRatio: '9 / 16', maxHeight: '70vh' }}>
          <iframe
            src={buildEmbedSrc(video)}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className={`group relative w-full flex items-center justify-center overflow-hidden ${
            showThumb
              ? 'bg-black'
              : 'bg-gradient-to-br from-teal-50 to-gray-100 dark:from-teal-900/20 dark:to-dark-bg py-10 flex-col gap-2 hover:from-teal-100 transition-colors'
          }`}
          style={showThumb ? { aspectRatio: '9 / 16', maxHeight: '70vh' } : undefined}
          aria-label={`נגן: ${video.title}`}
        >
          {showThumb && (
            <img
              src={thumb}
              alt={video.title}
              onError={() => setThumbFailed(true)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
          )}
          {/* כפתור Play צף מעל הכריכה */}
          <span
            className={`relative z-10 w-16 h-16 rounded-full bg-teal-primary text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${
              showThumb ? 'ring-4 ring-white/30' : ''
            }`}
          >
            <svg className="w-7 h-7 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {!showThumb && (
            <span className="text-xs text-gray-500 dark:text-dark-muted">לחץ לצפייה</span>
          )}
        </button>
      )}

      {/* קישור למקור */}
      <div className="px-4 py-2 border-t border-gray-50 dark:border-dark-border/50">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-dark-muted hover:text-teal-primary transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          פתח במקור
        </a>
      </div>
    </div>
  )
}
