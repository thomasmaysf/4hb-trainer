import { programsFor } from '../content'
import type { AppState, ObjectiveId, ProgramId, Settings } from '../types'

export const STORAGE_KEY = '4hb-trainer-v1'

const objectiveIds: ObjectiveId[] = ['fat-loss', 'muscle', 'muscle-plus', 'recomp', 'durable', 'custom']
const programIds: ProgramId[] = ['slow-carb', 'swings', 'occam', 'prehab', 'strength-b']
const legacyFocus = ['swings', 'strength', 'both']

export function defaultSettings(): Settings {
  return {
    weightUnit: 'kg',
    lengthUnit: 'cm',
    offDay: 6,
    objective: 'fat-loss',
    activePrograms: programsFor('fat-loss'),
    swingTarget: 75,
    bellKg: 16,
  }
}

export function normalizeSettings(input: Partial<Settings> & { focus?: string }): Settings {
  const defaults = defaultSettings()
  const legacyObjective: ObjectiveId = input.focus === 'strength' ? 'muscle' : input.focus === 'both' ? 'recomp' : 'fat-loss'
  const objective = input.objective && objectiveIds.includes(input.objective) ? input.objective : legacyObjective
  const listed = Array.isArray(input.activePrograms) ? input.activePrograms.filter((id): id is ProgramId => programIds.includes(id)) : []
  const resolvedObjective = input.objective === 'custom' && listed.length ? 'custom' : objective === 'custom' ? 'fat-loss' : objective
  return {
    weightUnit: input.weightUnit === 'lb' ? 'lb' : 'kg',
    lengthUnit: input.lengthUnit === 'in' ? 'in' : 'cm',
    offDay: typeof input.offDay === 'number' ? input.offDay : defaults.offDay,
    objective: resolvedObjective,
    activePrograms: resolvedObjective === 'custom' ? listed : programsFor(resolvedObjective),
    swingTarget: typeof input.swingTarget === 'number' ? input.swingTarget : defaults.swingTarget,
    bellKg: typeof input.bellKg === 'number' ? input.bellKg : defaults.bellKg,
  }
}

export function defaultState(): AppState {
  return {
    version: 1,
    settings: defaultSettings(),
    sessions: [],
    days: [],
    measurements: [],
    draft: null,
  }
}

export function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const state = value as AppState
  if (state.version !== 1 || !state.settings) return false
  const settings = state.settings as Settings & { focus?: string }
  if (settings.weightUnit !== 'kg' && settings.weightUnit !== 'lb') return false
  if (settings.lengthUnit !== 'cm' && settings.lengthUnit !== 'in') return false
  const hasPlan = (settings.objective && objectiveIds.includes(settings.objective)) || (settings.focus && legacyFocus.includes(settings.focus))
  if (!hasPlan) return false
  if (typeof settings.offDay !== 'number' || typeof settings.swingTarget !== 'number' || typeof settings.bellKg !== 'number') return false
  if (!Array.isArray(state.sessions) || !Array.isArray(state.days) || !Array.isArray(state.measurements)) return false
  if (state.draft != null && typeof state.draft !== 'object') return false
  return true
}

export const repository = {
  load(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultState()
      const parsed: unknown = JSON.parse(raw)
      if (!isAppState(parsed)) return defaultState()
      return {
        ...parsed,
        settings: normalizeSettings(parsed.settings),
        draft: parsed.draft ?? null,
      }
    } catch {
      return defaultState()
    }
  },
  save(state: AppState) {
    const next = JSON.stringify(state)
    if (localStorage.getItem(STORAGE_KEY) === next) return
    localStorage.setItem(STORAGE_KEY, next)
  },
}
