import { describe, expect, it } from 'vitest'
import {
  AJUSTE_MAX,
  MINUTOS_INICIAL,
  MINUTOS_TOPE,
  NIVEL_MAX,
  avanzarNivelLectura,
  minutosObjetivo,
} from './lectura'

describe('minutosObjetivo', () => {
  it('empieza en 5 min en el nivel 1 y sube de a uno', () => {
    expect(minutosObjetivo(1)).toBe(MINUTOS_INICIAL)
    expect(minutosObjetivo(2)).toBe(6)
    expect(minutosObjetivo(3)).toBe(7)
  })

  it('llega al tope de 20 min en el nivel máximo y no lo supera', () => {
    expect(minutosObjetivo(NIVEL_MAX)).toBe(MINUTOS_TOPE)
    expect(minutosObjetivo(NIVEL_MAX + 5)).toBe(MINUTOS_TOPE)
  })

  it('clampa niveles inválidos (<1) al nivel 1', () => {
    expect(minutosObjetivo(0)).toBe(MINUTOS_INICIAL)
    expect(minutosObjetivo(-3)).toBe(MINUTOS_INICIAL)
  })
})

describe('avanzarNivelLectura', () => {
  it('sube un nivel si se completó al menos el objetivo propuesto', () => {
    expect(avanzarNivelLectura(1, 5)).toBe(2)
    expect(avanzarNivelLectura(3, 10)).toBe(4) // objetivo de nivel 3 es 7, leyó 10
  })

  it('no sube si se leyó menos que el objetivo propuesto', () => {
    expect(avanzarNivelLectura(3, 6)).toBe(3) // objetivo 7, leyó 6
  })

  it('sube solo de a uno aunque se lea mucho más', () => {
    expect(avanzarNivelLectura(2, AJUSTE_MAX)).toBe(3)
  })

  it('no supera el nivel máximo', () => {
    expect(avanzarNivelLectura(NIVEL_MAX, MINUTOS_TOPE)).toBe(NIVEL_MAX)
  })
})
