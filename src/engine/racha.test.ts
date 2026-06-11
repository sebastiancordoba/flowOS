import { describe, expect, it } from 'vitest'
import { fechaLocal, registrarRutina } from './racha'

describe('fechaLocal', () => {
  it('formatea como YYYY-MM-DD', () => {
    expect(fechaLocal(new Date(2026, 5, 11))).toBe('2026-06-11')
    expect(fechaLocal(new Date(2026, 0, 3))).toBe('2026-01-03')
  })
})

describe('registrarRutina', () => {
  const vacia = { actual: 0, mejor: 0, ultimaFecha: null }

  it('primera rutina inicia la racha en 1', () => {
    expect(registrarRutina(vacia, '2026-06-11')).toEqual({
      actual: 1,
      mejor: 1,
      ultimaFecha: '2026-06-11',
    })
  })

  it('día consecutivo incrementa la racha', () => {
    const r = { actual: 3, mejor: 5, ultimaFecha: '2026-06-10' }
    expect(registrarRutina(r, '2026-06-11')).toEqual({
      actual: 4,
      mejor: 5,
      ultimaFecha: '2026-06-11',
    })
  })

  it('repetir el mismo día no cambia nada', () => {
    const r = { actual: 3, mejor: 5, ultimaFecha: '2026-06-11' }
    expect(registrarRutina(r, '2026-06-11')).toEqual(r)
  })

  it('un día saltado reinicia la racha a 1 pero conserva la mejor', () => {
    const r = { actual: 7, mejor: 7, ultimaFecha: '2026-06-08' }
    expect(registrarRutina(r, '2026-06-11')).toEqual({
      actual: 1,
      mejor: 7,
      ultimaFecha: '2026-06-11',
    })
  })

  it('actualiza la mejor racha al superarla', () => {
    const r = { actual: 5, mejor: 5, ultimaFecha: '2026-06-10' }
    expect(registrarRutina(r, '2026-06-11').mejor).toBe(6)
  })

  it('maneja el cambio de mes', () => {
    const r = { actual: 2, mejor: 2, ultimaFecha: '2026-05-31' }
    expect(registrarRutina(r, '2026-06-01').actual).toBe(3)
  })

  it('maneja el cambio de año', () => {
    const r = { actual: 4, mejor: 4, ultimaFecha: '2025-12-31' }
    expect(registrarRutina(r, '2026-01-01').actual).toBe(5)
  })
})
