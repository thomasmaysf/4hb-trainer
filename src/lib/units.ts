import type { LengthUnit, WeightUnit } from '../types'

export function trimNumber(value: number) {
  return (Math.round(value * 10) / 10).toString()
}

export function weightToDisplay(kg: number, unit: WeightUnit) {
  return unit === 'kg' ? kg : kg * 2.2046226218
}

export function weightToKg(value: number, unit: WeightUnit) {
  return unit === 'kg' ? value : value / 2.2046226218
}

export function lengthToDisplay(cm: number, unit: LengthUnit) {
  return unit === 'cm' ? cm : cm / 2.54
}

export function lengthToCm(value: number, unit: LengthUnit) {
  return unit === 'cm' ? value : value * 2.54
}

export function formatWeight(kg: number, unit: WeightUnit) {
  return `${trimNumber(weightToDisplay(kg, unit))} ${unit}`
}

export function formatLength(cm: number, unit: LengthUnit) {
  return `${trimNumber(lengthToDisplay(cm, unit))} ${unit}`
}

export function formatSigned(value: number) {
  const shown = trimNumber(value)
  return value > 0 ? `+${shown}` : shown
}
