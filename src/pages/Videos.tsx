import { useMemo, useState } from 'react'
import { treatmentVideos, videoCategories } from '../data/videos'
import VideoCard from '../components/VideoCard'

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // ספירת סרטונים לכל קטגוריה
  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const v of treatmentVideos) {
      counts[v.category] = (counts[v.category] || 0) + 1
    }
    return counts
  }, [])

  if (selectedCategory) {
    return (
      <CategoryView
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">סרטוני טיפול 🎬</h1>
        <p className="text-teal-100 text-sm">בחר נושא כדי לראות את הסרטונים</p>
      </div>

      {/* Category grid */}
      <div className="px-6 mt-5 pb-8 grid grid-cols-2 gap-3">
        {videoCategories.map(cat => {
          const count = countByCategory[cat.name] || 0
          const empty = count === 0
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`text-right flex flex-col gap-1.5 p-4 rounded-2xl border transition-colors ${
                empty
                  ? 'bg-gray-50 dark:bg-dark-card/50 border-gray-100 dark:border-dark-border opacity-60'
                  : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border hover:border-teal-primary/40 hover:bg-teal-50/30 dark:hover:bg-teal-primary/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{cat.emoji}</span>
                <span
                  className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    empty
                      ? 'bg-gray-100 dark:bg-dark-border text-gray-400 dark:text-dark-muted'
                      : 'bg-teal-50 dark:bg-teal-primary/15 text-teal-primary'
                  }`}
                >
                  {count}
                </span>
              </div>
              <div className="font-bold text-sm text-gray-900 dark:text-dark-text leading-snug">
                {cat.name}
              </div>
              <div className="text-[11px] text-gray-400 dark:text-dark-muted leading-relaxed">
                {cat.description}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface CategoryViewProps {
  category: string
  onBack: () => void
}

function CategoryView({ category, onBack }: CategoryViewProps) {
  const [query, setQuery] = useState('')
  const meta = videoCategories.find(c => c.name === category)

  const videos = useMemo(() => {
    const q = query.trim().toLowerCase()
    return treatmentVideos
      .filter(v => v.category === category)
      .filter(
        v =>
          !q ||
          v.title.toLowerCase().includes(q) ||
          (v.description?.toLowerCase().includes(q) ?? false),
      )
  }, [category, query])

  const total = useMemo(
    () => treatmentVideos.filter(v => v.category === category).length,
    [category],
  )

  return (
    <div className="min-h-screen">
      {/* Header with back */}
      <div className="bg-teal-primary text-white px-6 pt-12 pb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-teal-100 text-sm mb-3 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          כל הקטגוריות
        </button>
        <h1 className="text-2xl font-bold mb-1">
          {meta?.emoji} {category}
        </h1>
        <p className="text-teal-100 text-sm">{total} סרטונים</p>
      </div>

      {/* Search (only if there are several videos) */}
      {total > 3 && (
        <div className="px-6 -mt-4">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="חפש בקטגוריה..."
              className="w-full bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border py-3.5 pr-11 pl-4 text-sm text-gray-800 dark:text-dark-text placeholder:text-gray-400 focus:outline-none focus:border-teal-primary/50"
            />
            <svg className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-6 mt-4 pb-8 space-y-4">
        {videos.length === 0 ? (
          <EmptyState hasAny={total > 0} />
        ) : (
          videos.map(video => <VideoCard key={video.id} video={video} />)
        )}
      </div>
    </div>
  )
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">🎬</div>
      <h2 className="text-lg font-bold text-gray-700 dark:text-dark-text mb-2">
        {hasAny ? 'לא נמצאו סרטונים תואמים' : 'עדיין אין סרטונים בקטגוריה'}
      </h2>
      <p className="text-sm text-gray-400 dark:text-dark-muted leading-relaxed max-w-xs mx-auto">
        {hasAny
          ? 'נסה מילת חיפוש אחרת'
          : 'שלח קישור לריל מפייסבוק יחד עם כותרת, והוא יופיע כאן.'}
      </p>
    </div>
  )
}
