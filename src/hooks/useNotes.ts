import { useState, useEffect } from 'react'

const STORAGE_KEY = 'acupoints-notes'

export function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const setNote = (pointId: string, note: string) => {
    setNotes(prev => {
      if (!note.trim()) {
        const { [pointId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [pointId]: note }
    })
  }

  const getNote = (pointId: string) => notes[pointId] || ''

  return { notes, setNote, getNote }
}
