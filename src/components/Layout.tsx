import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useDarkMode } from '../hooks/useDarkMode'
import Sidebar from './Sidebar'

export default function Layout() {
  const { dark, toggle } = useDarkMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen pb-16 bg-gray-50 dark:bg-dark-bg">
      {/* Hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 w-10 h-10 rounded-full bg-teal-primary/90
          flex items-center justify-center shadow-lg hover:bg-teal-primary transition-colors"
        aria-label="תפריט עקרונות יסוד"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Outlet />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border z-50" aria-label="ניווט ראשי">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <NavLink
            to="/"
            aria-label="דף הבית"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center px-2 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-teal-primary' : 'text-gray-400 dark:text-dark-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>בית</span>
          </NavLink>

          <NavLink
            to="/explore"
            aria-label="חקור נקודות"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center px-2 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-teal-primary' : 'text-gray-400 dark:text-dark-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>חקור</span>
          </NavLink>

          <NavLink
            to="/favorites"
            aria-label="נקודות מועדפות"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center px-2 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-teal-primary' : 'text-gray-400 dark:text-dark-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>מועדפים</span>
          </NavLink>

          <NavLink
            to="/rubric"
            aria-label="רובריקה"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center px-2 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-teal-primary' : 'text-gray-400 dark:text-dark-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>רובריקה</span>
          </NavLink>

          <NavLink
            to="/organs"
            aria-label="איברים"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center px-2 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-teal-primary' : 'text-gray-400 dark:text-dark-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>איברים</span>
          </NavLink>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label={dark ? 'מצב בהיר' : 'מצב כהה'}
            className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center px-2 py-2 text-xs font-medium text-gray-400 dark:text-dark-muted transition-colors"
          >
            {dark ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span>{dark ? 'בהיר' : 'כהה'}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
