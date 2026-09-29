import { canonicalTemplateId, getExercise } from '../content'
import type { AppState, Measurement, ObjectiveId, ProgramId, Session, SetLog, Settings, WeightUnit } from '../types'
import { addDays, weekdayIndex } from './dates'
import { formatWeight } from './units'

export function swingReps(sets: SetLog[]) {
  return sets.filter((set) => set.exerciseId === 'swing').reduce((sum, set) => sum + set.reps, 0)
}

export function finishedSessions(state: AppState) {
  return state.sessions
    .filter((session) => session.finishedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export function sessionSummary(session: Session, unit: WeightUnit) {
  if (canonicalTemplateId(session.templateId) === 'swings') return `${swingReps(session.sets)} swings`
  if (canonicalTemplateId(session.templateId) === 'prehab') {
    const count = session.sets.filter((set) => set.kind === 'work').length
    return count ? `${count} prehab sets` : 'Prehab'
  }
  const parts = session.sets
    .filter((set) => set.kind === 'work')
    .map((set) => `${getExercise(set.exerciseId)?.short ?? 'Set'} ${formatWeight(set.weightKg, unit).replace(' ', '')}×${set.reps}`)
  return parts.join(' · ') || 'Logged'
}

export function lastWorkSet(state: AppState, exerciseId: string) {
  for (const session of finishedSessions(state)) {
    const set = [...session.sets].reverse().find((item) => item.exerciseId === exerciseId && item.kind === 'work')
    if (set) return { set, date: session.date }
  }
  return null
}

const plannedWeeks: Record<Exclude<ObjectiveId, 'custom'>, Partial<Record<number, string>>> = {
  'fat-loss': { 1: 'swings', 3: 'prehab', 5: 'swings' },
  muscle: { 2: 'occam', 4: 'prehab', 6: 'occam' },
  'muscle-plus': { 1: 'prehab', 2: 'occam', 5: 'strength-b' },
  recomp: { 1: 'swings', 3: 'prehab', 4: 'occam' },
  durable: { 1: 'prehab', 3: 'prehab', 5: 'prehab' },
}

const customDays: Record<Exclude<ProgramId, 'slow-carb'>, number[]> = {
  swings: [1, 5],
  occam: [2, 6],
  'strength-b': [4],
  prehab: [3, 1, 5],
}

export function weekSchedule(settings: Settings) {
  if (settings.objective !== 'custom') return plannedWeeks[settings.objective]
  const training = settings.activePrograms.filter((id) => id !== 'slow-carb')
  const prehabOnly = training.length === 1 && training[0] === 'prehab'
  const taken = new Set<number>()
  const result: Partial<Record<number, string>> = {}
  for (const id of ['swings', 'occam', 'strength-b', 'prehab'] as const) {
    if (!training.includes(id)) continue
    const days = prehabOnly ? [1, 3, 5] : customDays[id]
    const limit = id === 'prehab' && !prehabOnly ? 1 : days.length
    let placed = 0
    for (const day of days) {
      if (placed >= limit || taken.has(day)) continue
      taken.add(day)
      result[day] = id
      placed += 1
    }
  }
  return result
}

export function suggestedTemplateId(state: AppState, iso: string) {
  const slot = weekSchedule(state.settings)[weekdayIndex(iso)]
  if (!slot) return null
  if (!state.settings.activePrograms.includes(slot as ProgramId)) return null
  return slot
}

export function finishedToday(state: AppState, iso: string, templateId: string) {
  return finishedSessions(state).some((session) => session.date === iso && canonicalTemplateId(session.templateId) === canonicalTemplateId(templateId))
}

export function nextTraining(state: AppState, fromISO: string) {
  for (let offset = 0; offset <= 7; offset += 1) {
    const date = addDays(fromISO, offset)
    const templateId = suggestedTemplateId(state, date)
    if (!templateId) continue
    if (offset === 0 && finishedToday(state, date, templateId)) continue
    return { date, templateId }
  }
  return null
}

export function latestDelta(measurements: Measurement[], key: 'weightKg' | 'waistCm' | 'hipsCm' | 'thighCm') {
  const series = measurements.filter((item) => typeof item[key] === 'number').sort((a, b) => a.date.localeCompare(b.date))
  if (series.length < 2) return null
  const last = series[series.length - 1]
  const prev = series[series.length - 2]
  return { last, prev, delta: (last[key] as number) - (prev[key] as number) }
}

export type DayStatus = 'empty' | 'off' | 'on' | 'slip'

export function dayStatus(state: AppState, iso: string): DayStatus {
  const day = state.days.find((item) => item.date === iso)
  if (!day) return 'empty'
  if (day.offDay) return 'off'
  if (day.meals.length === 0) return 'empty'
  if (day.meals.some((meal) => !meal.onPlate)) return 'slip'
  return 'on'
}
