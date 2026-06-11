export interface EstadoEscalera {
  nivel: number
  aciertosSeguidos: number
}

const ACIERTOS_PARA_SUBIR = 3

/** Escalera 3-arriba-1-abajo: converge cerca del 79% de aciertos (zona de flow). */
export function avanzarEscalera(
  estado: EstadoEscalera,
  acierto: boolean,
  nivelMax: number,
): EstadoEscalera {
  if (!acierto) {
    return { nivel: Math.max(1, estado.nivel - 1), aciertosSeguidos: 0 }
  }
  const seguidos = estado.aciertosSeguidos + 1
  if (seguidos >= ACIERTOS_PARA_SUBIR) {
    return { nivel: Math.min(nivelMax, estado.nivel + 1), aciertosSeguidos: 0 }
  }
  return { nivel: estado.nivel, aciertosSeguidos: seguidos }
}
