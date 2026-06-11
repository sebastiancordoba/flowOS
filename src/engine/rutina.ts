import type { IdEjercicio, Rng } from './types'
import { mezclar } from './rng'
import { EJERCICIOS } from './ejercicios'

export const DURACION_BLOQUE_MS = 75_000
export const BLOQUES_POR_RUTINA = 4

/** Elige 4 de los 5 ejercicios cognitivos, en orden aleatorio. */
export function planRutina(rng: Rng): IdEjercicio[] {
  return mezclar(rng, EJERCICIOS.map((e) => e.id)).slice(0, BLOQUES_POR_RUTINA)
}
