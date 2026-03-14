import { useState, useMemo } from 'react'
import { points } from '../data/points'
import { useFavorites } from '../hooks/useFavorites'
import { flattenIndications } from '../types'
import SearchBar from '../components/SearchBar'
import PointCard from '../components/PointCard'

export default function Favorites() {
  const { favorites } = useFavorites()
  const [search, setSearch] = useState('')
  const [exportStatus, setExportStatus] = useState<'idle' | 'copied'>('idle')

  const favoritePoints = useMemo(() => {
    let result = points.filter(p => favorites.includes(p.id))

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(p =>
        p.id.includes(q) ||
        p.pinyinName.toLowerCase().includes(q) ||
        p.hebrewName.includes(q) ||
        p.chineseName.includes(q)
      )
    }

    return result
  }, [favorites, search])

  const handleExport = async () => {
    const lines = favoritePoints.map(p => {
      const indications = flattenIndications(p.indications).join(', ')
      return `${p.id} — ${p.pinyinName} (${p.hebrewName})\n  ${p.chineseName}\n  ${indications}`
    })
    const text = `נקודות מועדפות (${favoritePoints.length})\n${'─'.repeat(30)}\n\n${lines.join('\n\n')}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'נקודות מועדפות', text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      setExportStatus('copied')
      setTimeout(() => setExportStatus('idle'), 2000)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">מועדפים</h1>
          {favoritePoints.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
              aria-label="ייצוא מועדפים"
            >
              {exportStatus === 'copied' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>הועתק</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>ייצוא</span>
                </>
              )}
            </button>
          )}
        </div>
        {favorites.length > 0 && (
          <SearchBar value={search} onChange={setSearch} placeholder="חיפוש במועדפים..." />
        )}
      </div>

      <div className="px-6 py-4">
        {favoritePoints.length > 0 ? (
          <div className="space-y-2">
            {favoritePoints.map(point => (
              <PointCard key={point.id} point={point} />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-dark-muted">
            <p>לא נמצאו תוצאות</p>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 dark:text-dark-muted">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-lg mb-2">אין מועדפים עדיין</p>
            <p className="text-sm">לחץ על הכוכב בדף נקודה כדי להוסיף למועדפים</p>
          </div>
        )}
      </div>
    </div>
  )
}
