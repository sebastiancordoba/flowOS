export interface Racha {
  actual: number
  mejor: number
  ultimaFecha: string | null
}

export function fechaLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dia}`
}

/** Registra la rutina completada en la fecha local `hoy` (YYYY-MM-DD). */
export function registrarRutina(racha: Racha, hoy: string): Racha {
  if (racha.ultimaFecha === hoy) return { ...racha }
  // mediodía esquiva los cambios de horario de verano; sin 'Z' el string se
  // parsea como hora local (ES2015+). Una ultimaFecha futura cuenta como hueco.
  const ayer = fechaLocal(new Date(new Date(`${hoy}T12:00:00`).getTime() - 86_400_000))
  const actual = racha.ultimaFecha === ayer ? racha.actual + 1 : 1
  return { actual, mejor: Math.max(actual, racha.mejor), ultimaFecha: hoy }
}
