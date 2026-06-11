import type { Ejercicio } from '../types'
import { elegir } from '../rng'

const LETRAS = ['B', 'D', 'K', 'M', 'P', 'R', 'S', 'T'] as const

export function nPorNivel(nivel: number): number {
  if (nivel <= 3) return 1
  if (nivel <= 7) return 2
  return 3
}

export const nback: Ejercicio = {
  id: 'nback',
  nombre: 'N-atrás',
  descripcion: '¿La letra es igual a la que apareció hace N posiciones?',
  nivelMax: 10,
  generar(nivel, rng, historial) {
    const n = nPorNivel(nivel)
    const previa = historial.length >= n ? historial[historial.length - n].estimulo.texto : null
    const repetir = previa !== null && rng() < 0.35
    const letra = repetir ? previa : elegir(rng, LETRAS.filter((l) => l !== previa))
    return {
      estimulo: { texto: letra, regla: `${n} atrás` },
      opciones: ['Igual', 'Distinto'],
      correcta: letra === previa ? 'Igual' : 'Distinto',
      tiempoLimiteMs: Math.max(1800, 3500 - nivel * 150),
    }
  },
}
