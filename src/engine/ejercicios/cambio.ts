import type { Ejercicio } from '../types'
import { enteroEn } from '../rng'

const REGLAS = ['¿Par o impar?', '¿Mayor o menor que 5?'] as const

export const cambio: Ejercicio = {
  id: 'cambio',
  nombre: 'Cambio de tarea',
  descripcion: 'Responde según la regla que aparece arriba. La regla cambia sin avisar.',
  nivelMax: 10,
  generar(nivel, rng, historial) {
    const reglaPrevia = historial.at(-1)?.estimulo.regla
    const probCambio = 0.3 + nivel * 0.04
    let regla: string = reglaPrevia ?? (rng() < 0.5 ? REGLAS[0] : REGLAS[1])
    if (reglaPrevia && rng() < probCambio) {
      regla = REGLAS.find((r) => r !== reglaPrevia)!
    }
    let digito = enteroEn(rng, 1, 9)
    while (digito === 5) digito = enteroEn(rng, 1, 9)
    const esParImpar = regla === REGLAS[0]
    const correcta = esParImpar
      ? digito % 2 === 0
        ? 'Par'
        : 'Impar'
      : digito > 5
        ? 'Mayor'
        : 'Menor'
    return {
      estimulo: { texto: String(digito), regla },
      opciones: esParImpar ? ['Par', 'Impar'] : ['Mayor', 'Menor'],
      correcta,
      tiempoLimiteMs: Math.max(2000, 4500 - nivel * 250),
    }
  },
}
