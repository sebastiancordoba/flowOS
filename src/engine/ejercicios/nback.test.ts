import { describe, expect, it } from 'vitest'
import type { Trial } from '../types'
import { mulberry32 } from '../rng'
import { nPorNivel, nback } from './nback'

function trialCon(letra: string): Trial {
  return { estimulo: { texto: letra }, opciones: ['Igual', 'Distinto'], correcta: 'Distinto', tiempoLimiteMs: 3000 }
}

describe('nPorNivel', () => {
  it('mapea niveles a N', () => {
    expect(nPorNivel(1)).toBe(1)
    expect(nPorNivel(3)).toBe(1)
    expect(nPorNivel(4)).toBe(2)
    expect(nPorNivel(7)).toBe(2)
    expect(nPorNivel(8)).toBe(3)
    expect(nPorNivel(10)).toBe(3)
  })
})

describe('nback.generar', () => {
  it('sin historial suficiente la correcta es Distinto', () => {
    const t = nback.generar(1, mulberry32(1), [])
    expect(t.correcta).toBe('Distinto')
  })

  it('la correcta es Igual exactamente cuando la letra coincide con la de hace N', () => {
    const rng = mulberry32(42)
    // nivel 4 → N=2
    const historial = [trialCon('B'), trialCon('K')]
    for (let i = 0; i < 100; i++) {
      const t = nback.generar(4, rng, historial)
      if (t.estimulo.texto === 'B') expect(t.correcta).toBe('Igual')
      else expect(t.correcta).toBe('Distinto')
    }
  })

  it('genera repeticiones (Igual) con frecuencia razonable', () => {
    const rng = mulberry32(7)
    let iguales = 0
    let historial: Trial[] = [trialCon('B')]
    for (let i = 0; i < 300; i++) {
      const t = nback.generar(1, rng, historial)
      if (t.correcta === 'Igual') iguales++
      historial = [...historial, t]
    }
    expect(iguales).toBeGreaterThan(50)
    expect(iguales).toBeLessThan(200)
  })

  it('muestra la regla N atrás', () => {
    expect(nback.generar(8, mulberry32(1), []).estimulo.regla).toBe('3 atrás')
  })

  it('nivel 4 (N=2) con un solo trial previo da Distinto', () => {
    const t = nback.generar(4, mulberry32(1), [trialCon('B')])
    expect(t.correcta).toBe('Distinto')
  })
})
