import { describe, expect, it } from 'vitest'
import type { Trial } from '../types'
import { mulberry32 } from '../rng'
import { cambio } from './cambio'

describe('cambio.generar', () => {
  it('la correcta es coherente con la regla y el dígito', () => {
    const rng = mulberry32(42)
    let historial: Trial[] = []
    for (let i = 0; i < 300; i++) {
      const t = cambio.generar(5, rng, historial)
      const d = Number(t.estimulo.texto)
      if (t.estimulo.regla === '¿Par o impar?') {
        expect(t.opciones).toEqual(['Par', 'Impar'])
        expect(t.correcta).toBe(d % 2 === 0 ? 'Par' : 'Impar')
      } else {
        expect(t.estimulo.regla).toBe('¿Mayor o menor que 5?')
        expect(t.opciones).toEqual(['Mayor', 'Menor'])
        expect(t.correcta).toBe(d > 5 ? 'Mayor' : 'Menor')
      }
      historial = [...historial, t]
    }
  })

  it('nunca usa el dígito 5', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 300; i++) {
      expect(cambio.generar(5, rng, []).estimulo.texto).not.toBe('5')
    }
  })

  it('la regla cambia entre trials con frecuencia', () => {
    const rng = mulberry32(3)
    let historial: Trial[] = []
    let cambios = 0
    for (let i = 0; i < 200; i++) {
      const t = cambio.generar(5, rng, historial)
      const previa = historial.at(-1)?.estimulo.regla
      if (previa && t.estimulo.regla !== previa) cambios++
      historial = [...historial, t]
    }
    expect(cambios).toBeGreaterThan(40)
  })
})
