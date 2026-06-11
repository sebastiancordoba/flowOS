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

  it('en niveles 1-2 solo hay suma y resta; desde nivel 3 aparece la multiplicación', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 100; i++) {
      expect(calculo.generar(1, rng, []).estimulo.texto).not.toContain('×')
      expect(calculo.generar(2, rng, []).estimulo.texto).not.toContain('×')
    }
    let multiplicaciones = 0
    for (let i = 0; i < 100; i++) {
      if (calculo.generar(3, rng, []).estimulo.texto.includes('×')) multiplicaciones++
    }
    expect(multiplicaciones).toBeGreaterThan(0)
  })

  it('el tiempo límite decrece estrictamente del nivel 1 al 10', () => {
    const rng = mulberry32(1)
    const tiempos: number[] = []
    for (let nivel = 1; nivel <= 10; nivel++) tiempos.push(calculo.generar(nivel, rng, []).tiempoLimiteMs)
    for (let i = 1; i < tiempos.length; i++) expect(tiempos[i]).toBeLessThan(tiempos[i - 1])
  })

  it('nunca produce resultados negativos en las opciones', () => {
    const rng = mulberry32(3)
    for (let i = 0; i < 200; i++) {
      const t = calculo.generar(8, rng, [])
      for (const o of t.opciones) expect(Number(o)).toBeGreaterThanOrEqual(0)
    }
  })

  it('la resta nunca produce resultado 0', () => {
    const rng = mulberry32(11)
    for (let i = 0; i < 300; i++) {
      const t = calculo.generar(2, rng, [])
      if (t.estimulo.texto.includes('-')) expect(Number(t.correcta)).toBeGreaterThanOrEqual(1)
    }
  })
})
