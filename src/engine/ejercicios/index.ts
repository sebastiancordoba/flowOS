import type { Ejercicio, IdEjercicio } from '../types'
import { calculo } from './calculo'
import { stroop } from './stroop'
import { nback } from './nback'
import { sart } from './sart'
import { cambio } from './cambio'

export const EJERCICIOS: readonly Ejercicio[] = [calculo, stroop, nback, sart, cambio]

export function ejercicioPorId(id: IdEjercicio): Ejercicio {
  const ejercicio = EJERCICIOS.find((e) => e.id === id)
  if (!ejercicio) throw new Error(`Ejercicio desconocido: ${id}`)
  return ejercicio
}
