import { describe, expect, it } from 'vitest'
import { mulberry32 } from './rng'
import { EJERCICIOS } from './ejercicios'
import { BLOQUES_POR_RUTINA, planRutina } from './rutina'

describe('planRutina', () => {
  it('elige 4 ejercicios distintos del registro', () => {
    const plan = planRutina(mulberry32(42))
    expect(plan).toHaveLength(BLOQUES_POR_RUTINA)
    expect(new Set(plan).size).toBe(BLOQUES_POR_RUTINA)
    const ids = EJERCICIOS.map((e) => e.id)
    for (const id of plan) expect(ids).toContain(id)
  })

  it('el orden varía con distintas semillas', () => {
    const planes = new Set<string>()
    for (let s = 0; s < 20; s++) planes.add(planRutina(mulberry32(s)).join(','))
    expect(planes.size).toBeGreaterThan(1)
  })
})
