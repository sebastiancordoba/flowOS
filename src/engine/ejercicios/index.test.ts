import { describe, expect, it } from 'vitest'
import { EJERCICIOS, ejercicioPorId } from './index'

describe('registro de ejercicios', () => {
  it('contiene los 5 ejercicios cognitivos con ids únicos', () => {
    expect(EJERCICIOS).toHaveLength(5)
    expect(new Set(EJERCICIOS.map((e) => e.id)).size).toBe(5)
  })

  it('ejercicioPorId encuentra cada ejercicio', () => {
    for (const e of EJERCICIOS) {
      expect(ejercicioPorId(e.id)).toBe(e)
    }
  })
})
