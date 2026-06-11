import { useEffect, useRef, useState } from 'react'
import type { IdEjercicio, Rng } from '../engine/types'
import { crearSesion, responder, type EstadoSesion, type ResultadoBloque } from '../engine/sesion'
import { ejercicioPorId } from '../engine/ejercicios'
import { TrialView } from '../components/TrialView'

interface Props {
  plan: IdEjercicio[]
  niveles: Partial<Record<IdEjercicio, number>>
  onFin: (
    resultados: ResultadoBloque[],
    niveles: Partial<Record<IdEjercicio, number>>,
  ) => void
}

export function SesionView({ plan, niveles, onFin }: Props) {
  const rngRef = useRef<Rng>(Math.random)
  const [sesion, setSesion] = useState<EstadoSesion>(() =>
    crearSesion(plan, niveles, rngRef.current),
  )
  const inicioBloque = useRef(Date.now())
  const [feedback, setFeedback] = useState<'acierto' | 'error' | null>(null)

  function manejar(respuesta: string) {
    if (sesion.terminada || !sesion.trial) return
    setFeedback(respuesta === sesion.trial.correcta ? 'acierto' : 'error')
    const nuevo = responder(sesion, respuesta, Date.now() - inicioBloque.current, rngRef.current)
    if (nuevo.bloque !== sesion.bloque) inicioBloque.current = Date.now()
    setSesion(nuevo)
  }

  // timeout del trial actual: si no responde, cuenta como 'timeout'
  useEffect(() => {
    if (!sesion.trial || sesion.terminada) return
    const t = setTimeout(() => manejar('timeout'), sesion.trial.tiempoLimiteMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion])

  useEffect(() => {
    if (feedback === null) return
    const t = setTimeout(() => setFeedback(null), 300)
    return () => clearTimeout(t)
  }, [feedback])

  useEffect(() => {
    if (sesion.terminada) onFin(sesion.resultados, sesion.niveles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion.terminada])

  const ejercicio = ejercicioPorId(sesion.plan[sesion.bloque])
  return (
    <main className="pantalla sesion">
      <header className="hud">
        <span>{ejercicio.nombre}</span>
        <span>
          Bloque {sesion.bloque + 1} / {sesion.plan.length}
        </span>
        <span>Nivel {sesion.escalera.nivel}</span>
      </header>
      <p className="descripcion">{ejercicio.descripcion}</p>
      {sesion.trial && <TrialView trial={sesion.trial} feedback={feedback} onRespuesta={manejar} />}
    </main>
  )
}
