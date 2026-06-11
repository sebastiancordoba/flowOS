import type { Ejercicio } from '../types'
import { enteroEn } from '../rng'

export const OBJETIVO_SART = 3

export const sart: Ejercicio = {
  id: 'sart',
  nombre: 'Atención sostenida',
  descripcion: `Toca con cada número EXCEPTO el ${OBJETIVO_SART}. Si sale el ${OBJETIVO_SART}, quédate quieto.`,
  nivelMax: 10,
  generar(nivel, rng) {
    const esObjetivo = rng() < 0.2
    let digito = OBJETIVO_SART
    if (!esObjetivo) {
      do {
        digito = enteroEn(rng, 1, 9)
      } while (digito === OBJETIVO_SART)
    }
    return {
      estimulo: { texto: String(digito) },
      opciones: ['Tocar'],
      correcta: esObjetivo ? 'timeout' : 'Tocar',
      tiempoLimiteMs: Math.max(800, 1600 - nivel * 80),
    }
  },
}
