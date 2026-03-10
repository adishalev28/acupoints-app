import { useState, useEffect } from 'react'

const STORAGE_KEY = 'acupoints-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
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
