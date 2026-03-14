import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { principles } from '../data/principles'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // סגירה ב-Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // נעילת scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <nav
        className={`fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white dark:bg-dark-card
          shadow-xl z-[70] transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-label="תפריט עקרונות יסוד"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-dark-border bg-teal-primary text-white">
          <h2 className="text-lg font-bold font-heebo">עקרונות יסוד</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="סגור תפריט"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-4 py-3 bg-teal-light/50 dark:bg-teal-primary/10 border-b border-gray-100 dark:border-dark-border">
          <p className="text-xs text-gray-600 dark:text-dark-muted leading-relaxed">
            הבסיס התיאורטי לשיטת הדיקור של מאסטר דונג
          </p>
        </div>

        {/* Principle Links */}
        <ul className="py-1">
          {principles.map((principle) => (
            <li key={principle.id}>
              <Link
                to={`/principle/${principle.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 dark:text-dark-text
                  hover:bg-teal-50 dark:hover:bg-teal-primary/10 transition-colors
                  border-b border-gray-50 dark:border-dark-border/50"
              >
                <span
                  className="w-7 h-7 rounded-full bg-teal-light dark:bg-teal-primary/20
                    flex items-center justify-center text-xs font-bold text-teal-primary flex-shrink-0"
                >
                  {principle.number}
                </span>
                <span className="leading-snug font-heebo">{principle.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
