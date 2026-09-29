export type ProgramId = 'slow-carb' | 'swings' | 'occam' | 'prehab' | 'strength-b'
export type ObjectiveId = 'fat-loss' | 'muscle' | 'muscle-plus' | 'recomp' | 'durable' | 'custom'
export type WeightUnit = 'kg' | 'lb'
export type LengthUnit = 'cm' | 'in'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'extra'

export type Settings = {
  weightUnit: WeightUnit
  lengthUnit: LengthUnit
  offDay: number
  objective: ObjectiveId
  activePrograms: ProgramId[]
  swingTarget: number
  bellKg: number
}

export type SetLog = {
  id: string
  exerciseId: string
  kind: 'warmup' | 'work'
  reps: number
  weightKg: number
}

export type Session = {
  id: string
  templateId: string
  date: string
  startedAt: string
  finishedAt?: string
  sets: SetLog[]
  note: string
}

export type MealLog = {
  id: string
  slot: MealSlot
  label: string
  onPlate: boolean
}

export type DayLog = {
  date: string
  offDay: boolean
  meals: MealLog[]
  water: number
  note: string
}

export type Measurement = {
  id: string
  date: string
  weightKg?: number
  waistCm?: number
  hipsCm?: number
  thighCm?: number
  note: string
  photosTaken: boolean
}

export type AppState = {
  version: 1
  settings: Settings
  sessions: Session[]
  days: DayLog[]
  measurements: Measurement[]
  draft: Session | null
}
