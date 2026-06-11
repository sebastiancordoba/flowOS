import type { IdEjercicio, Rng, Trial } from './types'
import { avanzarEscalera, type EstadoEscalera } from './escalera'
import { ejercicioPorId } from './ejercicios'
import { DURACION_BLOQUE_MS } from './rutina'

export interface ResultadoBloque {
  id: IdEjercicio
  aciertos: number
  total: number
  nivelFinal: number
}

export interface EstadoSesion {
  plan: IdEjercicio[]
  niveles: Partial<Record<IdEjercicio, number>>
  bloque: number
  trial: Trial | null
  /** trials ya respondidos del bloque actual (contexto para n-back y cambio) */
  historial: Trial[]
  escalera: EstadoEscalera
  aciertos: number
  total: number
  resultados: ResultadoBloque[]
  terminada: boolean
}

export function crearSesion(
  plan: IdEjercicio[],
  niveles: Partial<Record<IdEjercicio, number>>,
  rng: Rng,
): EstadoSesion {
  if (plan.length === 0) throw new Error('crearSesion: plan vacío')
  const ejercicio = ejercicioPorId(plan[0])
  const escalera: EstadoEscalera = { nivel: niveles[plan[0]] ?? 1, aciertosSeguidos: 0 }
  return {
    plan: [...plan],
    niveles: { ...niveles },
    bloque: 0,
    trial: ejercicio.generar(escalera.nivel, rng, []),
    historial: [],
    escalera,
    aciertos: 0,
    total: 0,
    resultados: [],
    terminada: false,
  }
}

/**
 * Procesa una respuesta ('timeout' si venció el tiempo del trial).
 * Si msEnBloque >= DURACION_BLOQUE_MS, cierra el bloque y abre el siguiente.
 */
export function responder(
  estado: EstadoSesion,
  respuesta: string,
  msEnBloque: number,
  rng: Rng,
): EstadoSesion {
  if (estado.terminada || !estado.trial) return estado
  const id = estado.plan[estado.bloque]
  const ejercicio = ejercicioPorId(id)
  const acierto = respuesta === estado.trial.correcta
  const escalera = avanzarEscalera(estado.escalera, acierto, ejercicio.nivelMax)
  const base: EstadoSesion = {
    ...estado,
    escalera,
    niveles: { ...estado.niveles, [id]: escalera.nivel },
    aciertos: estado.aciertos + (acierto ? 1 : 0),
    total: estado.total + 1,
    historial: [...estado.historial, estado.trial],
  }
  if (msEnBloque < DURACION_BLOQUE_MS) {
    return { ...base, trial: ejercicio.generar(escalera.nivel, rng, base.historial) }
  }
  const resultados: ResultadoBloque[] = [
    ...base.resultados,
    { id, aciertos: base.aciertos, total: base.total, nivelFinal: escalera.nivel },
  ]
  const siguiente = estado.bloque + 1
  if (siguiente >= estado.plan.length) {
    return { ...base, resultados, trial: null, terminada: true }
  }
  const proxId = estado.plan[siguiente]
  const proxEjercicio = ejercicioPorId(proxId)
  const proxEscalera: EstadoEscalera = { nivel: base.niveles[proxId] ?? 1, aciertosSeguidos: 0 }
  return {
    ...base,
    resultados,
    bloque: siguiente,
    escalera: proxEscalera,
    aciertos: 0,
    total: 0,
    historial: [],
    trial: proxEjercicio.generar(proxEscalera.nivel, rng, []),
  }
}
