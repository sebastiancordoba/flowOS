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
    expect(objetivos).toBeGreaterThan(150)
    expect(objetivos).toBeLessThan(250)
  })

  it('tiene un solo botón Tocar', () => {
    expect(sart.generar(1, mulberry32(1), []).opciones).toEqual(['Tocar'])
  })

  it('el tiempo límite decrece estrictamente del nivel 1 al 10', () => {
    const rng = mulberry32(1)
    const tiempos: number[] = []
    for (let nivel = 1; nivel <= 10; nivel++) tiempos.push(sart.generar(nivel, rng, []).tiempoLimiteMs)
    for (let i = 1; i < tiempos.length; i++) expect(tiempos[i]).toBeLessThan(tiempos[i - 1])
  })
})
