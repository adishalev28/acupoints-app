import { useState, useEffect } from 'react'

const STORAGE_KEY = 'acupoints-notes'

export function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch { /* storage blocked - notes stay in memory for this visit */ }
  }, [notes])

  const setNote = (pointId: string, note: string) => {
    setNotes(prev => {
      if (!note.trim()) {
        const rest = { ...prev }
        delete rest[pointId]
        return rest
      }
      return { ...prev, [pointId]: note }
    })
  }

  const getNote = (pointId: string) => notes[pointId] || ''

  return { notes, setNote, getNote }
}
