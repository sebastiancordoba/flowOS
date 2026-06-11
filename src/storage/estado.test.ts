import { beforeEach, describe, expect, it } from 'vitest'
import {
  cargarEstado,
  estadoInicial,
  exportarEstado,
  guardarEstado,
  importarEstado,
} from './estado'

function storageFalso(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial))
  return {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
  }
}

describe('cargarEstado', () => {
  beforeEach(() => localStorage.clear())

  it('sin datos devuelve el estado inicial sin marcar recuperación', () => {
    const { estado, recuperado } = cargarEstado(storageFalso())
    expect(estado).toEqual(estadoInicial())
    expect(recuperado).toBe(false)
  })

  it('JSON corrupto devuelve estado inicial y marca recuperado', () => {
    const { estado, recuperado } = cargarEstado(storageFalso({ 'flowos-estado': '{{{' }))
    expect(estado).toEqual(estadoInicial())
    expect(recuperado).toBe(true)
  })

  it('versión desconocida devuelve estado inicial y marca recuperado', () => {
    const crudo = JSON.stringify({ version: 99 })
    const { recuperado } = cargarEstado(storageFalso({ 'flowos-estado': crudo }))
    expect(recuperado).toBe(true)
  })

  it('guardar y cargar es un round-trip fiel', () => {
    const storage = storageFalso()
    const estado = {
      ...estadoInicial(),
      racha: { actual: 3, mejor: 5, ultimaFecha: '2026-06-11' },
      niveles: { calculo: 7 },
    }
    guardarEstado(estado, storage)
    expect(cargarEstado(storage).estado).toEqual(estado)
  })
})

describe('exportar/importar', () => {
  it('round-trip por JSON', () => {
    const estado = { ...estadoInicial(), niveles: { stroop: 4 } }
    expect(importarEstado(exportarEstado(estado))).toEqual(estado)
  })

  it('importar JSON inválido devuelve null', () => {
    expect(importarEstado('no es json')).toBeNull()
    expect(importarEstado('{"version":99}')).toBeNull()
    expect(importarEstado('null')).toBeNull()
  })
})
