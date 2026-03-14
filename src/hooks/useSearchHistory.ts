import { useState, useCallback } from 'react'

const STORAGE_KEY = 'searchHistory'
const MAX_ITEMS = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const addSearch = useCallback((query: string) => {
    const q = query.trim()
    if (!q || q.length < 2) return

    setHistory(prev => {
      const filtered = prev.filter(item => item !== q)
      const next = [q, ...filtered].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addSearch, clearHistory }
}
