import { useState, useEffect } from 'react'

const STORAGE_KEY = 'acupoints-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch { /* storage blocked - favorites stay in memory for this visit */ }
  }, [favorites])

  const toggleFavorite = (pointId: string) => {
    setFavorites(prev =>
      prev.includes(pointId)
        ? prev.filter(id => id !== pointId)
        : [...prev, pointId]
    )
  }

  const isFavorite = (pointId: string) => favorites.includes(pointId)

  return { favorites, toggleFavorite, isFavorite }
}
