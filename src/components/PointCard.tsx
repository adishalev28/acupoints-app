import { Link } from 'react-router-dom'
import type { Point } from '../types'

interface PointCardProps {
  point: Point
}

export default function PointCard({ point }: PointCardProps) {
  return (
    <Link
      to={`/point/${point.id}`}
      className="flex items-center gap-4 px-4 py-3.5 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all"
    >
      {/* Point image or placeholder */}
      <div className="w-14 h-14 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {point.imageId ? (
          <img
            src={`/images/${point.imageId}.jpg`}
            alt={point.pinyinName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 text-base">
          {/^\d/.test(point.id) ? `${point.id} ${point.pinyinName}` : point.pinyinName}
        </div>
        <div className="text-sm text-gray-500">
          [{point.chineseName}]
        </div>
        <div className="text-sm text-gray-600">
          {point.hebrewName}
        </div>
      </div>

      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  )
}
