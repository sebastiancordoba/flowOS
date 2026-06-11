import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../rng'
import { COLORES, stroop } from './stroop'

describe('stroop.generar', () => {
  it('la correcta es el nombre del color de la tinta, no la palabra', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 200; i++) {
      const t = stroop.generar(5, rng, [])
      const tinta = COLORES.find((c) => c.css === t.estimulo.color)
      expect(tinta).toBeDefined()
      expect(t.correcta).toBe(tinta!.nombre)
    }
  })

  it('las opciones son los 4 nombres de color', () => {
    const t = stroop.generar(1, mulberry32(1), [])
    expect([...t.opciones].sort()).toEqual(COLORES.map((c) => c.nombre).sort())
  })

  it('genera trials incongruentes (palabra ≠ tinta) con frecuencia', () => {
    const rng = mulberry32(7)
    let incongruentes = 0
    for (let i = 0; i < 200; i++) {
      const t = stroop.generar(5, rng, [])
      const tinta = COLORES.find((c) => c.css === t.estimulo.color)!
      if (tinta.nombre !== t.estimulo.texto) incongruentes++
    }
    expect(incongruentes).toBeGreaterThan(90)
    expect(incongruentes).toBeLessThan(150)
  })

  it('el tiempo límite decrece estrictamente del nivel 1 al 10', () => {
    const rng = mulberry32(1)
    const tiempos: number[] = []
    for (let nivel = 1; nivel <= 10; nivel++) tiempos.push(stroop.generar(nivel, rng, []).tiempoLimiteMs)
    for (let i = 1; i < tiempos.length; i++) expect(tiempos[i]).toBeLessThan(tiempos[i - 1])
  })
})
