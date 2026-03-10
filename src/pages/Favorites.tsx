import { useState, useMemo } from 'react'
import { points } from '../data/points'
import { useFavorites } from '../hooks/useFavorites'
import SearchBar from '../components/SearchBar'
import PointCard from '../components/PointCard'

export default function Favorites() {
  const { favorites } = useFavorites()
  const [search, setSearch] = useState('')

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-8 pb-6">
        <h1 className="text-xl font-bold mb-4">מועדפים</h1>
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
          <div className="text-center py-12 text-gray-400">
            <p>לא נמצאו תוצאות</p>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
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
