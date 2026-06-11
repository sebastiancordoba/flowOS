import { describe, expect, it } from 'vitest'
import { avanzarEscalera } from './escalera'

describe('avanzarEscalera (3-arriba-1-abajo)', () => {
  it('sube de nivel tras 3 aciertos seguidos y reinicia el contador', () => {
    let e = { nivel: 4, aciertosSeguidos: 0 }
    e = avanzarEscalera(e, true, 10)
    e = avanzarEscalera(e, true, 10)
    expect(e).toEqual({ nivel: 4, aciertosSeguidos: 2 })
    e = avanzarEscalera(e, true, 10)
    expect(e).toEqual({ nivel: 5, aciertosSeguidos: 0 })
  })

  it('baja un nivel con un solo error y reinicia el contador', () => {
    const e = avanzarEscalera({ nivel: 4, aciertosSeguidos: 2 }, false, 10)
    expect(e).toEqual({ nivel: 3, aciertosSeguidos: 0 })
  })

  it('no baja de nivel 1', () => {
    expect(avanzarEscalera({ nivel: 1, aciertosSeguidos: 0 }, false, 10).nivel).toBe(1)
  })

  it('no sube más allá de nivelMax', () => {
    let e = { nivel: 10, aciertosSeguidos: 2 }
    e = avanzarEscalera(e, true, 10)
    expect(e.nivel).toBe(10)
  })
})
