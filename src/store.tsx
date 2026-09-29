import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getTemplate } from './content'
import { localISO } from './lib/dates'
import { uid } from './lib/id'
import { STORAGE_KEY, isAppState, repository } from './lib/repository'
import type { AppState, DayLog, Measurement, Session, SetLog, Settings } from './types'

type Actions = {
  updateSettings: (patch: Partial<Settings>) => void
  startDraft: (templateId: string) => void
  discardDraft: () => void
  setDraftNote: (note: string) => void
  logSet: (set: Omit<SetLog, 'id'>) => void
  removeSet: (id: string) => void
  finishDraft: () => void
  saveDay: (day: DayLog) => void
  saveMeasurement: (measurement: Omit<Measurement, 'id'> & { id?: string }) => void
  removeMeasurement: (id: string) => void
  removeSession: (id: string) => void
  replaceAll: (state: AppState) => void
}

const StoreContext = createContext<{ state: AppState; actions: Actions } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => repository.load())

  useEffect(() => {
    repository.save(state)
  }, [state])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try {
        const parsed: unknown = JSON.parse(event.newValue)
        if (isAppState(parsed)) setState(parsed)
      } catch {
        /* ignore malformed cross-tab writes */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const actions = useMemo<Actions>(
    () => ({
      updateSettings(patch) {
        setState((current) => ({ ...current, settings: { ...current.settings, ...patch } }))
      },
      startDraft(templateId) {
        setState((current) => {
          if (current.draft || !getTemplate(templateId)) return current
          const draft: Session = {
            id: uid(),
            templateId,
            date: localISO(),
            startedAt: new Date().toISOString(),
            sets: [],
            note: '',
          }
          return { ...current, draft }
        })
      },
      discardDraft() {
        setState((current) => ({ ...current, draft: null }))
      },
      setDraftNote(note) {
        setState((current) => (current.draft ? { ...current, draft: { ...current.draft, note } } : current))
      },
      logSet(set) {
        setState((current) => {
          if (!current.draft) return current
          return { ...current, draft: { ...current.draft, sets: [...current.draft.sets, { ...set, id: uid() }] } }
        })
      },
      removeSet(id) {
        setState((current) => {
          if (!current.draft) return current
          return { ...current, draft: { ...current.draft, sets: current.draft.sets.filter((set) => set.id !== id) } }
        })
      },
      finishDraft() {
        setState((current) => {
          if (!current.draft || current.draft.sets.length === 0) return current
          const finished: Session = { ...current.draft, finishedAt: new Date().toISOString() }
          return { ...current, draft: null, sessions: [...current.sessions, finished] }
        })
      },
      saveDay(day) {
        setState((current) => ({
          ...current,
          days: current.days.some((item) => item.date === day.date)
            ? current.days.map((item) => (item.date === day.date ? day : item))
            : [...current.days, day],
        }))
      },
      saveMeasurement(measurement) {
        setState((current) => {
          const existing = current.measurements.find((item) => item.date === measurement.date)
          const next: Measurement = { ...measurement, id: existing?.id ?? measurement.id ?? uid() }
          const measurements = existing
            ? current.measurements.map((item) => (item.date === measurement.date ? next : item))
            : [...current.measurements, next]
          return { ...current, measurements }
        })
      },
      removeMeasurement(id) {
        setState((current) => ({ ...current, measurements: current.measurements.filter((item) => item.id !== id) }))
      },
      removeSession(id) {
        setState((current) => ({ ...current, sessions: current.sessions.filter((item) => item.id !== id) }))
      },
      replaceAll(next) {
        setState(next)
      },
    }),
    [],
  )

  return <StoreContext.Provider value={{ state, actions }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
