import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { points } from '../data/points'
import { zones } from '../data/zones'

export default function Home() {
  const pointsPerZone = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of points) {
      counts[p.zone] = (counts[p.zone] || 0) + 1
    }
    return counts
  }, [])

  const absolute72 = useMemo(() => points.filter(p => p.absoluteNeedle === '72').length, [])
  const solution32 = useMemo(() => points.filter(p => p.absoluteNeedle === '32').length, [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">נקודות דיקור</h1>
        <p className="text-teal-100 text-sm">מאסטר דונג &bull; שון גודמן</p>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-4">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-primary">{points.length}</div>
              <div className="text-sm text-gray-500 dark:text-dark-muted mt-1">נקודות במאגר</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-primary">{zones.length}</div>
              <div className="text-sm text-gray-500 dark:text-dark-muted mt-1">אזורים</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
            <Link
              to="/explore?filter=72"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <span className="text-lg">🥇</span>
              <div className="text-right">
                <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{absolute72}</div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400">מחטים מוחלטות</div>
              </div>
            </Link>
            <Link
              to="/explore?filter=32"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-lg">🥈</span>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-600 dark:text-gray-300">{solution32}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">נותנות פתרון</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Smart Diagnosis - prominent placement */}
      <div className="px-6 mt-4 space-y-2.5">
        <Link
          to="/smart-diagnosis"
          className="flex items-center gap-4 p-5 bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-white dark:bg-dark-card shadow-sm flex items-center justify-center">
            <span className="text-2xl">🩺</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 dark:text-dark-text">אבחון חכם</div>
            <div className="text-sm text-gray-500 dark:text-dark-muted">בחר איבר ישירות או השתמש בשאלון מודרך</div>
          </div>
        </Link>
        <Link
          to="/diagnosis"
          className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border hover:border-teal-primary/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-primary/20 flex items-center justify-center shrink-0">
            <span className="text-lg">📋</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-dark-text">אבחון לפי סימפטומים</div>
            <div className="text-xs text-gray-400 dark:text-dark-muted">חיפוש סימפטומים → נקודות מדורגות</div>
          </div>
        </Link>
      </div>

      {/* Zone Grid */}
      <div className="px-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-3">בחר אזור</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {zones.map(zone => (
            <Link
              key={zone.id}
              to={`/explore?zone=${zone.id}`}
              className="flex items-center justify-between p-3.5 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border hover:border-teal-primary/40 hover:bg-teal-50/30 dark:hover:bg-teal-primary/10 active:bg-teal-50 transition-colors"
            >
              <span className="text-xs text-gray-400 dark:text-dark-muted">{pointsPerZone[zone.id] || 0}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800 dark:text-dark-text">{zone.name}</span>
                <span className="text-sm font-bold text-teal-primary">{zone.id}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6 pb-6 space-y-3">
        <Link
          to="/mirror"
          className="flex items-center gap-4 p-5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover:border-teal-primary/30 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center">
            <span className="text-2xl">🪞</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-dark-text">מפת הדמיה</div>
            <div className="text-sm text-gray-500 dark:text-dark-muted">בחר אזור כאב → קבל אפשרויות דיקור</div>
          </div>
        </Link>

        <Link
          to="/dao-ma"
          className="flex items-center gap-4 p-5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover:border-teal-primary/30 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center">
            <span className="text-2xl">🐴</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-dark-text">שילובי דאו-מא</div>
            <div className="text-sm text-gray-500 dark:text-dark-muted">שילובי נקודות לפי איברים וחמש הפאזות</div>
          </div>
        </Link>


      </div>
    </div>
  )
}
