import { describe, expect, it } from 'vitest'
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

  it('conserva el blob corrupto bajo otra clave para rescate manual', () => {
    const storage = storageFalso({ 'flowos-estado': '{{{' })
    cargarEstado(storage)
    expect(storage.getItem('flowos-estado-corrupto')).toBe('{{{')
  })

  it('getItem que lanza devuelve estado inicial y marca recuperado', () => {
    const storage = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {},
    }
    const { estado, recuperado } = cargarEstado(storage)
    expect(estado).toEqual(estadoInicial())
    expect(recuperado).toBe(true)
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

  it('una racha sin campos no pasa la validación', () => {
    expect(importarEstado('{"version":1,"racha":{},"niveles":{},"sesiones":[]}')).toBeNull()
  })
})

describe('migración v1 → v2', () => {
  const v1 = JSON.stringify({
    version: 1,
    racha: { actual: 4, mejor: 9, ultimaFecha: '2026-06-11' },
    niveles: { calculo: 7 },
    sesiones: [{ fecha: '2026-06-11', tipo: 'rutina', resultados: [] }],
  })

  it('un estado v1 guardado se carga migrado a v2 con los campos de lectura por defecto', () => {
    const { estado, recuperado } = cargarEstado(storageFalso({ 'flowos-estado': v1 }))
    expect(recuperado).toBe(false)
    expect(estado.version).toBe(2)
    // conserva lo de v1
    expect(estado.racha).toEqual({ actual: 4, mejor: 9, ultimaFecha: '2026-06-11' })
    expect(estado.niveles).toEqual({ calculo: 7 })
    expect(estado.sesiones).toHaveLength(1)
    // añade los defaults de lectura
    expect(estado.lectura).toEqual({ nivel: 1, racha: { actual: 0, mejor: 0, ultimaFecha: null } })
    expect(estado.lecturas).toEqual([])
  })

  it('importar un respaldo v1 también lo migra a v2', () => {
    const importado = importarEstado(v1)
    expect(importado?.version).toBe(2)
    expect(importado?.lectura.nivel).toBe(1)
  })

  it('un v2 con lectura inválida no pasa la validación', () => {
    const malo = JSON.stringify({
      version: 2,
      racha: { actual: 0, mejor: 0, ultimaFecha: null },
      niveles: {},
      sesiones: [],
      lectura: {},
      lecturas: [],
    })
    expect(importarEstado(malo)).toBeNull()
  })

  it('un v2 completo hace round-trip fiel', () => {
    const estado = {
      ...estadoInicial(),
      lectura: { nivel: 6, racha: { actual: 3, mejor: 8, ultimaFecha: '2026-06-11' } },
      lecturas: [{ fecha: '2026-06-11', objetivoMin: 10, minutosLeidos: 10 }],
    }
    expect(importarEstado(exportarEstado(estado))).toEqual(estado)
  })
})
