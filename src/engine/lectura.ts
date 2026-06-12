export const MINUTOS_INICIAL = 5
export const MINUTOS_TOPE = 20
export const AJUSTE_MIN = 1
export const AJUSTE_MAX = 30

/** Nivel máximo: aquel cuyo objetivo alcanza el tope de minutos. */
export const NIVEL_MAX = MINUTOS_TOPE - MINUTOS_INICIAL + 1 // 16

/** Minutos objetivo propuestos para un nivel dado (5 min en nivel 1, +1 por nivel, tope 20). */
export function minutosObjetivo(nivel: number): number {
  const clamped = Math.max(1, Math.min(NIVEL_MAX, nivel))
  return MINUTOS_INICIAL + (clamped - 1)
}

/**
 * Nuevo nivel tras completar una lectura de `minutosLeidos`.
 * Sube de a uno solo si se leyó al menos el objetivo propuesto del nivel actual;
 * nunca pasa de NIVEL_MAX.
 */
export function avanzarNivelLectura(nivel: number, minutosLeidos: number): number {
  if (minutosLeidos >= minutosObjetivo(nivel)) {
    return Math.min(nivel + 1, NIVEL_MAX)
  }
  return nivel
}
