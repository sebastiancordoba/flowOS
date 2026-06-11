import { describe, expect, it } from 'vitest'
import { elegir, enteroEn, mezclar, mulberry32 } from './rng'

describe('mulberry32', () => {
  it('misma semilla produce la misma secuencia', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const secA = [a(), a(), a()]
    const secB = [b(), b(), b()]
    expect(secA).toEqual(secB)
  })

  it('devuelve valores en [0, 1)', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('enteroEn', () => {
  it('respeta los límites inclusive', () => {
    const rng = mulberry32(1)
    const vistos = new Set<number>()
    for (let i = 0; i < 1000; i++) {
      const v = enteroEn(rng, 2, 5)
      expect(v).toBeGreaterThanOrEqual(2)
      expect(v).toBeLessThanOrEqual(5)
      vistos.add(v)
    }
    expect(vistos.size).toBe(4)
  })
})

describe('mezclar', () => {
  it('conserva los mismos elementos', () => {
    const rng = mulberry32(3)
    const resultado = mezclar(rng, [1, 2, 3, 4, 5])
    expect([...resultado].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('no muta el arreglo original', () => {
    const original = [1, 2, 3]
    mezclar(mulberry32(3), original)
    expect(original).toEqual([1, 2, 3])
  })
})

describe('elegir', () => {
  it('devuelve un elemento del arreglo', () => {
    const rng = mulberry32(9)
    for (let i = 0; i < 100; i++) {
      expect(['a', 'b', 'c']).toContain(elegir(rng, ['a', 'b', 'c']))
    }
  })
})
