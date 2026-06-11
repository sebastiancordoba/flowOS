import { useEffect, useState } from 'react'

const FASES = [
  { nombre: 'Inhala', ms: 4000 },
  { nombre: 'Sostén', ms: 2000 },
  { nombre: 'Exhala', ms: 6000 },
] as const

const DURACION_TOTAL_MS = 3 * 60 * 1000

interface Props {
  onFin: () => void
}

export function Respiracion({ onFin }: Props) {
  const [comenzada, setComenzada] = useState(false)
  const [fase, setFase] = useState(0)
  const [restanteMs, setRestanteMs] = useState(DURACION_TOTAL_MS)

  useEffect(() => {
    if (!comenzada) return
    const t = setTimeout(() => setFase((f) => (f + 1) % FASES.length), FASES[fase].ms)
    return () => clearTimeout(t)
  }, [comenzada, fase])

  useEffect(() => {
    if (!comenzada || restanteMs === 0) return
    const t = setInterval(() => setRestanteMs((r) => Math.max(0, r - 1000)), 1000)
    return () => clearInterval(t)
  }, [comenzada, restanteMs])

  useEffect(() => {
    if (comenzada && restanteMs === 0) onFin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comenzada, restanteMs])

  if (!comenzada) {
    return (
      <main className="pantalla respiracion">
        <h2>Cierre opcional</h2>
        <p className="subtitulo">
          3 minutos de respiración guiada. Es la parte con mejor evidencia de toda la app.
        </p>
        <button className="principal" onClick={() => setComenzada(true)}>
          Comenzar (3 min)
        </button>
        <button onClick={onFin}>Saltar</button>
      </main>
    )
  }

  return (
    <main className="pantalla respiracion">
      <div className={`circulo fase-${fase}`} />
      <p className="fase">{FASES[fase].nombre}</p>
      <p className="subtitulo">{Math.ceil(restanteMs / 1000)} s</p>
      <button className="enlace" onClick={onFin}>
        Terminar
      </button>
    </main>
  )
}
