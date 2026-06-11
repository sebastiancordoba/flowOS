import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../rng'
import { OBJETIVO_SART, sart } from './sart'

describe('sart.generar', () => {
  it('cuando sale el objetivo lo correcto es no responder (timeout)', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 500; i++) {
      const t = sart.generar(5, rng, [])
      if (t.estimulo.texto === String(OBJETIVO_SART)) expect(t.correcta).toBe('timeout')
      else expect(t.correcta).toBe('Tocar')
    }
  })

  it('el objetivo aparece aproximadamente 1 de cada 5 trials', () => {
    const rng = mulberry32(7)
    let objetivos = 0
    for (let i = 0; i < 1000; i++) {
      if (sart.generar(5, rng, []).estimulo.texto === String(OBJETIVO_SART)) objetivos++
    }
    expect(objetivos).toBeGreaterThan(120)
    expect(objetivos).toBeLessThan(280)
  })

  it('tiene un solo botón Tocar', () => {
    expect(sart.generar(1, mulberry32(1), []).opciones).toEqual(['Tocar'])
  })
})
