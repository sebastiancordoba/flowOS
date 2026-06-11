import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../rng'
import { calculo } from './calculo'

function evaluar(texto: string): number {
  const [a, op, b] = texto.split(' ')
  const x = Number(a)
  const y = Number(b)
  if (op === '+') return x + y
  if (op === '-') return x - y
  return x * y
}

describe('calculo.generar', () => {
  it('la correcta es el resultado real y está entre 4 opciones únicas', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 200; i++) {
      const t = calculo.generar(5, rng, [])
      expect(t.opciones).toHaveLength(4)
      expect(new Set(t.opciones).size).toBe(4)
      expect(t.opciones).toContain(t.correcta)
      expect(Number(t.correcta)).toBe(evaluar(t.estimulo.texto))
    }
  })

  it('en niveles bajos solo hay suma y resta', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 100; i++) {
      const t = calculo.generar(1, rng, [])
      expect(t.estimulo.texto).not.toContain('×')
    }
  })

  it('el tiempo límite baja al subir el nivel', () => {
    const rng = mulberry32(1)
    const facil = calculo.generar(1, rng, [])
    const dificil = calculo.generar(10, rng, [])
    expect(dificil.tiempoLimiteMs).toBeLessThan(facil.tiempoLimiteMs)
  })

  it('nunca produce resultados negativos en las opciones', () => {
    const rng = mulberry32(3)
    for (let i = 0; i < 200; i++) {
      const t = calculo.generar(8, rng, [])
      for (const o of t.opciones) expect(Number(o)).toBeGreaterThanOrEqual(0)
    }
  })
})
