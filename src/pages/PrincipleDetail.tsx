import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { principles } from '../data/principles'

export default function PrincipleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const principle = principles.find((p) => p.id === id)
  const idx = principles.findIndex((p) => p.id === id)
  const prev = idx > 0 ? principles[idx - 1] : null
  const next = idx < principles.length - 1 ? principles[idx + 1] : null

  // scroll to top בניווט בין עקרונות
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!principle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <p className="text-gray-400 dark:text-dark-muted text-lg">העקרון לא נמצא</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-24 overflow-x-hidden">
      {/* Header */}
      <div className="bg-teal-primary text-white px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 -mr-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="חזרה"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            עקרון {principle.number} מתוך {principles.length}
          </span>
          <div className="w-10" />
        </div>
        <div className="text-center">
          <div className="text-xl font-bold font-heebo leading-tight break-words">{principle.title}</div>
          {principle.titleEn && (
            <div className="text-sm text-white/70 mt-1" dir="ltr">{principle.titleEn}</div>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div className="px-4 py-4 space-y-3">
        {principle.sections.length > 0 ? (
          principle.sections.map((section, i) => (
            <div
              key={i}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm p-4"
            >
              {section.heading && (
                <h3 className="font-bold text-gray-800 dark:text-dark-text text-sm mb-2 font-heebo" dir="ltr">
                  {section.heading}
                </h3>
              )}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line" dir="ltr">
                {section.body}
              </p>
              {section.listItems && section.listItems.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {section.listItems.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-teal-primary mt-0.5">&#8226;</span>
                      <span dir="ltr" className="text-left">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.imageUrl && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={section.imageUrl}
                    alt={section.heading || ''}
                    className="w-full max-w-sm rounded-xl border border-gray-100 dark:border-dark-border"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-400 dark:text-dark-muted">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-border"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="text-lg font-medium mb-1">התוכן יתווסף בקרוב</p>
            <p className="text-sm">עקרון זה ממתין להוספת תוכן</p>
          </div>
        )}

        {/* Prev/Next navigation */}
        <div className="flex gap-2 pt-2">
          {prev ? (
            <button
              onClick={() => navigate(`/principle/${prev.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white
                dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border
                text-sm text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border
                transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="truncate">{prev.title}</span>
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <button
              onClick={() => navigate(`/principle/${next.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white
                dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border
                text-sm text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border
                transition-colors"
            >
              <span className="truncate">{next.title}</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  )
}
