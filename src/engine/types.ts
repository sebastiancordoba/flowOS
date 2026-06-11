export type Rng = () => number

export type IdEjercicio = 'calculo' | 'stroop' | 'nback' | 'sart' | 'cambio'

export interface Estimulo {
  texto: string
  /** color CSS de la tinta del texto (Stroop) */
  color?: string
  /** etiqueta de la regla activa, mostrada arriba del estímulo (n-back, cambio de tarea) */
  regla?: string
}

export interface Trial {
  estimulo: Estimulo
  /** botones de respuesta; SART tiene un solo botón "Tocar" */
  opciones: string[]
  /** respuesta correcta; 'timeout' cuando lo correcto es NO responder (SART no-go) */
  correcta: string
  tiempoLimiteMs: number
}

export interface Ejercicio {
  id: IdEjercicio
  nombre: string
  descripcion: string
  nivelMax: number
  /** historial = trials previos del bloque actual (lo usa n-back y cambio de tarea) */
  generar(nivel: number, rng: Rng, historial: Trial[]): Trial
}
