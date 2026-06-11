import type { Ejercicio, Rng } from '../types'
import { elegir, enteroEn, mezclar } from '../rng'

function generarOperacion(nivel: number, rng: Rng): { texto: string; resultado: number } {
  const ops = nivel < 3 ? ['+', '-'] : ['+', '-', '×']
  const op = elegir(rng, ops)
  let a: number
  let b: number
  if (op === '×') {
    a = enteroEn(rng, 2, 4 + nivel)
    b = enteroEn(rng, 2, 4 + nivel)
  } else {
    const max = 5 + nivel * 5
    a = enteroEn(rng, 2, max)
    // en resta, b < a garantiza resultado >= 1 (nunca 0 ni negativo)
    b = op === '-' ? enteroEn(rng, 1, a - 1) : enteroEn(rng, 2, max)
  }
  const resultado = op === '+' ? a + b : op === '-' ? a - b : a * b
  return { texto: `${a} ${op} ${b}`, resultado }
}

function distractores(resultado: number, rng: Rng): number[] {
  const set = new Set<number>()
  // desvio nunca es 0, así que candidato !== resultado siempre; el único guard real es >= 0
  for (let intentos = 0; set.size < 3; intentos++) {
    if (intentos > 50) throw new Error('distractores: no se pudo completar el set')
    const desvio = enteroEn(rng, 1, 10) * (rng() < 0.5 ? -1 : 1)
    const candidato = resultado + desvio
    if (candidato >= 0) set.add(candidato)
  }
  return [...set]
}

export const calculo: Ejercicio = {
  id: 'calculo',
  nombre: 'Cálculo rápido',
  descripcion: 'Resuelve la operación antes de que se acabe el tiempo.',
  nivelMax: 10,
  generar(nivel, rng) {
    const { texto, resultado } = generarOperacion(nivel, rng)
    const opciones = mezclar(rng, [resultado, ...distractores(resultado, rng)]).map(String)
    return {
      estimulo: { texto },
      opciones,
      correcta: String(resultado),
      tiempoLimiteMs: Math.max(3000, 9000 - nivel * 600),
    }
  },
}
