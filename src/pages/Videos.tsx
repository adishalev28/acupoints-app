import { useMemo, useState } from 'react'
import { treatmentVideos, getVideoCategories } from '../data/videos'
import VideoCard from '../components/VideoCard'

export default function Videos() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(() => getVideoCategories(treatmentVideos), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return treatmentVideos.filter(v => {
      const matchesCategory = !activeCategory || v.category === activeCategory
      const matchesQuery =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        (v.description?.toLowerCase().includes(q) ?? false)
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">סרטוני טיפול 🎬</h1>
        <p className="text-teal-100 text-sm">תרגילים וטכניקות לכאבי לסת, צוואר וראש</p>
      </div>

      {/* Search */}
      <div className="px-6 -mt-4">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="חפש לפי כותרת או נושא..."
            className="w-full bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border py-3.5 pr-11 pl-4 text-sm text-gray-800 dark:text-dark-text placeholder:text-gray-400 focus:outline-none focus:border-teal-primary/50"
          />
          <svg className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="px-6 mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 text-xs font-medium rounded-full px-3.5 py-1.5 transition-colors ${
              !activeCategory
                ? 'bg-teal-primary text-white'
                : 'bg-white dark:bg-dark-card text-gray-500 dark:text-dark-muted border border-gray-200 dark:border-dark-border'
            }`}
          >
            הכל
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 text-xs font-medium rounded-full px-3.5 py-1.5 transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-primary text-white'
                  : 'bg-white dark:bg-dark-card text-gray-500 dark:text-dark-muted border border-gray-200 dark:border-dark-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="px-6 mt-4 pb-8 space-y-4">
        {filtered.length === 0 && treatmentVideos.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-dark-muted py-10">
            לא נמצאו סרטונים תואמים
          </p>
        ) : (
          filtered.map(video => <VideoCard key={video.id} video={video} />)
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">🎬</div>
      <h2 className="text-lg font-bold text-gray-700 dark:text-dark-text mb-2">
        עדיין אין סרטונים
      </h2>
      <p className="text-sm text-gray-400 dark:text-dark-muted leading-relaxed max-w-xs mx-auto">
        כדי להוסיף סרטון - שלח קישור לריל מפייסבוק יחד עם כותרת מסודרת, והוא יופיע כאן.
      </p>
    </div>
  )
}
