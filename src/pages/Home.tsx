import { Link } from 'react-router-dom'
import { points } from '../data/points'
import { zones } from '../data/zones'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-bold mb-1">נקודות דיקור</h1>
        <p className="text-teal-100 text-sm">מאסטר דונג &bull; שון גודמן</p>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-primary">{points.length}</div>
              <div className="text-sm text-gray-500 mt-1">נקודות במאגר</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-primary">{zones.length}</div>
              <div className="text-sm text-gray-500 mt-1">אזורים</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6 space-y-3">
        <Link
          to="/explore"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-teal-primary/30 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900">חקור נקודות</div>
            <div className="text-sm text-gray-500">חיפוש לפי שם, אינדיקציה או אזור</div>
          </div>
        </Link>

        <Link
          to="/favorites"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-teal-primary/30 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900">מועדפים</div>
            <div className="text-sm text-gray-500">הנקודות השמורות שלך</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
