import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { points } from '../data/points'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'

/** Try point image: .jpg then .png, hide if neither exists */
function PointImage({ pointId }: { pointId: string }) {
  const formats = ['jpg', 'png', 'webp']
  const [formatIdx, setFormatIdx] = useState(0)

  if (formatIdx >= formats.length) return null

  return (
    <div className="mb-4 flex justify-center">
      <img
        src={`/images/${pointId}.${formats[formatIdx]}`}
        alt={`תרשים נקודה ${pointId}`}
        className="w-full max-w-xs rounded-xl border border-gray-100"
        onError={() => setFormatIdx(prev => prev + 1)}
      />
    </div>
  )
}

type Tab = 'location' | 'needling' | 'reactionArea' | 'indications' | 'info'

const tabLabels: { id: Tab; label: string }[] = [
  { id: 'location', label: 'מיקום' },
  { id: 'needling', label: 'דיקור' },
  { id: 'reactionArea', label: 'אזור תגובה' },
  { id: 'indications', label: 'התוויות' },
  { id: 'info', label: 'מידע נוסף' },
]

export default function PointDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('location')
  const { isFavorite, toggleFavorite } = useFavorites()
  const { getNote, setNote } = useNotes()
  const [noteText, setNoteText] = useState('')
  const [editingNote, setEditingNote] = useState(false)

  const point = points.find(p => p.id === id)

  if (!point) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">הנקודה לא נמצאה</p>
      </div>
    )
  }

  const savedNote = getNote(point.id)

  const handleSaveNote = () => {
    setNote(point.id, noteText)
    setEditingNote(false)
  }

  const handleStartEdit = () => {
    setNoteText(savedNote)
    setEditingNote(true)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-teal-primary text-white px-6 pt-8 pb-4">
        <button onClick={() => navigate(-1)} className="mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">נקודות דיקור</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex whitespace-nowrap px-4">
          {tabLabels.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-primary text-teal-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Point Title */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold text-lg text-gray-900">
              {point.id} {point.pinyinName}
            </div>
            <div className="text-gray-500">[{point.chineseName}]</div>
            <div className="text-teal-primary font-medium">{point.hebrewName}</div>
          </div>
          <button
            onClick={() => toggleFavorite(point.id)}
            className="p-2 -ml-2"
          >
            <svg
              className={`w-7 h-7 ${isFavorite(point.id) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-5">
        {activeTab === 'location' && (
          <div>
            {/* External image (user-provided) or SVG fallback */}
            <PointImage pointId={point.id} />
            <h3 className="font-bold text-gray-900 mb-3">מיקום</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
              {point.location}
            </p>
          </div>
        )}

        {activeTab === 'needling' && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">טכניקת דיקור</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
              {point.needling}
            </p>
          </div>
        )}

        {activeTab === 'reactionArea' && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">אזור תגובה</h3>
            <div className="space-y-2">
              {point.reactionAreas.map((area, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-gray-700">
                  {area}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'indications' && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">התוויות</h3>
            <div className="space-y-2">
              {point.indications.map((indication, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-gray-700">
                  {indication}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">מידע נוסף</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
              {point.additionalInfo}
            </p>
          </div>
        )}

        {/* Personal Note */}
        <div className="mt-8">
          <h3 className="font-bold text-gray-900 mb-3">הערה אישית</h3>
          {editingNote ? (
            <div className="space-y-3">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-teal-primary resize-none"
                placeholder="כתוב הערה..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-teal-primary text-white text-sm font-medium rounded-lg"
                >
                  שמור
                </button>
                <button
                  onClick={() => setEditingNote(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg"
                >
                  ביטול
                </button>
              </div>
            </div>
          ) : savedNote ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{savedNote}</p>
              <button
                onClick={handleStartEdit}
                className="mt-2 text-teal-primary text-sm font-medium"
              >
                עריכה
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-teal-primary/30 transition-colors"
            >
              הוסף הערה...
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
