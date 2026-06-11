import type { IdEjercicio, Rng } from './types'
import { mezclar } from './rng'
import { EJERCICIOS } from './ejercicios'

export const DURACION_BLOQUE_MS = 75_000
export const BLOQUES_POR_RUTINA = 4

/** Elige BLOQUES_POR_RUTINA ejercicios del registro, en orden aleatorio. */
export function planRutina(rng: Rng): IdEjercicio[] {
  if (BLOQUES_POR_RUTINA > EJERCICIOS.length) {
    throw new Error('BLOQUES_POR_RUTINA excede los ejercicios disponibles')
  }
  return mezclar(rng, EJERCICIOS.map((e) => e.id)).slice(0, BLOQUES_POR_RUTINA)
}
