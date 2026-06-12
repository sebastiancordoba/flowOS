import type { IdEjercicio } from '../engine/types'
import type { Racha } from '../engine/racha'
import type { ResultadoBloque } from '../engine/sesion'

export interface ResumenSesion {
  fecha: string // YYYY-MM-DD local
  tipo: 'rutina' | 'libre'
  resultados: ResultadoBloque[]
}

export interface EstadoLectura {
  /** nivel de lectura: determina la duración objetivo propuesta */
  nivel: number
  racha: Racha
}

export interface RegistroLectura {
  fecha: string // YYYY-MM-DD local
  objetivoMin: number
  minutosLeidos: number
}

export interface EstadoApp {
  version: 2
  racha: Racha
  niveles: Partial<Record<IdEjercicio, number>>
  sesiones: ResumenSesion[]
  lectura: EstadoLectura
  lecturas: RegistroLectura[]
}

const CLAVE = 'flowos-estado'

type StorageMinimo = Pick<Storage, 'getItem' | 'setItem'>
type Crudo = Record<string, unknown>

function rachaInicial(): Racha {
  return { actual: 0, mejor: 0, ultimaFecha: null }
}

export function estadoInicial(): EstadoApp {
  return {
    version: 2,
    racha: rachaInicial(),
    niveles: {},
    sesiones: [],
    lectura: { nivel: 1, racha: rachaInicial() },
    lecturas: [],
  }
}

export interface ResultadoCarga {
  estado: EstadoApp
  /** true si había datos pero estaban corruptos o de versión desconocida */
  recuperado: boolean
}

export function cargarEstado(storage: StorageMinimo = localStorage): ResultadoCarga {
  let crudo: string | null = null
  try {
    crudo = storage.getItem(CLAVE)
    if (crudo === null) return { estado: estadoInicial(), recuperado: false }
    const migrado = migrar(JSON.parse(crudo))
    if (migrado === null) return rescatar(crudo, storage)
    return { estado: migrado, recuperado: false }
  } catch {
    return rescatar(crudo, storage)
  }
}

/** Conserva el blob ilegible en otra clave para un rescate manual por devtools. */
function rescatar(crudo: string | null, storage: StorageMinimo): ResultadoCarga {
  if (crudo !== null) {
    try {
      storage.setItem(`${CLAVE}-corrupto`, crudo)
    } catch {
      // si tampoco se puede guardar el respaldo, no hay nada más que hacer
    }
  }
  return { estado: estadoInicial(), recuperado: true }
}

export function guardarEstado(estado: EstadoApp, storage: StorageMinimo = localStorage): void {
  try {
    storage.setItem(CLAVE, JSON.stringify(estado))
  } catch (e) {
    // almacenamiento lleno o bloqueado: la sesión sigue funcionando en memoria
    console.warn('flowOS: no se pudo guardar el estado', e)
  }
}

export function exportarEstado(estado: EstadoApp): string {
  return JSON.stringify(estado, null, 2)
}

export function importarEstado(json: string): EstadoApp | null {
  try {
    return migrar(JSON.parse(json))
  } catch {
    return null
  }
}

function esRachaValida(r: unknown): r is Racha {
  if (typeof r !== 'object' || r === null) return false
  const x = r as Crudo
  return (
    typeof x.actual === 'number' &&
    typeof x.mejor === 'number' &&
    (x.ultimaFecha === null || typeof x.ultimaFecha === 'string')
  )
}

function esLecturaValida(l: unknown): l is EstadoLectura {
  if (typeof l !== 'object' || l === null) return false
  const x = l as Crudo
  return typeof x.nivel === 'number' && esRachaValida(x.racha)
}

/** Campos comunes a v1 y v2. */
function baseValida(e: Crudo): boolean {
  return (
    esRachaValida(e.racha) &&
    typeof e.niveles === 'object' &&
    e.niveles !== null &&
    Array.isArray(e.sesiones)
  )
}

/**
 * Valida cualquier estado guardado y lo migra a la versión actual.
 * Devuelve null si es irreconocible (corrupto o versión desconocida).
 */
function migrar(datos: unknown): EstadoApp | null {
  if (typeof datos !== 'object' || datos === null) return null
  const e = datos as Crudo
  if (!baseValida(e)) return null
  const base = {
    racha: e.racha as Racha,
    niveles: e.niveles as Partial<Record<IdEjercicio, number>>,
    sesiones: e.sesiones as ResumenSesion[],
  }
  // v1 → v2: añade los campos de lectura con defaults
  if (e.version === 1) {
    return { version: 2, ...base, lectura: { nivel: 1, racha: rachaInicial() }, lecturas: [] }
  }
  if (e.version === 2 && esLecturaValida(e.lectura) && Array.isArray(e.lecturas)) {
    return { version: 2, ...base, lectura: e.lectura, lecturas: e.lecturas as RegistroLectura[] }
  }
  return null
}
