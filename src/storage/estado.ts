import type { IdEjercicio } from '../engine/types'
import type { Racha } from '../engine/racha'
import type { ResultadoBloque } from '../engine/sesion'

export interface ResumenSesion {
  fecha: string // YYYY-MM-DD local
  tipo: 'rutina' | 'libre'
  resultados: ResultadoBloque[]
}

export interface EstadoApp {
  version: 1
  racha: Racha
  niveles: Partial<Record<IdEjercicio, number>>
  sesiones: ResumenSesion[]
}

const CLAVE = 'flowos-estado'

type StorageMinimo = Pick<Storage, 'getItem' | 'setItem'>

export function estadoInicial(): EstadoApp {
  return {
    version: 1,
    racha: { actual: 0, mejor: 0, ultimaFecha: null },
    niveles: {},
    sesiones: [],
  }
}

export interface ResultadoCarga {
  estado: EstadoApp
  /** true si había datos pero estaban corruptos o de versión desconocida */
  recuperado: boolean
}

export function cargarEstado(storage: StorageMinimo = localStorage): ResultadoCarga {
  try {
    const crudo = storage.getItem(CLAVE)
    if (crudo === null) return { estado: estadoInicial(), recuperado: false }
    const datos: unknown = JSON.parse(crudo)
    if (!esEstadoValido(datos)) return { estado: estadoInicial(), recuperado: true }
    return { estado: datos, recuperado: false }
  } catch {
    return { estado: estadoInicial(), recuperado: true }
  }
}

export function guardarEstado(estado: EstadoApp, storage: StorageMinimo = localStorage): void {
  try {
    storage.setItem(CLAVE, JSON.stringify(estado))
  } catch {
    // almacenamiento lleno o bloqueado: la sesión sigue funcionando en memoria
  }
}

export function exportarEstado(estado: EstadoApp): string {
  return JSON.stringify(estado, null, 2)
}

export function importarEstado(json: string): EstadoApp | null {
  try {
    const datos: unknown = JSON.parse(json)
    return esEstadoValido(datos) ? datos : null
  } catch {
    return null
  }
}

function esEstadoValido(d: unknown): d is EstadoApp {
  if (typeof d !== 'object' || d === null) return false
  const e = d as Record<string, unknown>
  return (
    e.version === 1 &&
    typeof e.racha === 'object' &&
    e.racha !== null &&
    typeof e.niveles === 'object' &&
    e.niveles !== null &&
    Array.isArray(e.sesiones)
  )
}
