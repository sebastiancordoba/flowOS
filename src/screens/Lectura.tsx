import { useEffect, useRef, useState } from 'react'
import { AJUSTE_MAX, AJUSTE_MIN, minutosObjetivo } from '../engine/lectura'

interface Props {
  /** nivel de lectura actual (determina el objetivo propuesto) */
  nivel: number
  /** racha de lectura vigente, solo para mostrar */
  racha: number
  /** registra la lectura completada (no navega) */
  onCompletar: (objetivoMin: number, minutosLeidos: number) => void
  /** vuelve al inicio sin registrar (cancelar o abortar) */
  onVolver: () => void
}

type Fase = 'inicio' | 'corriendo' | 'completado'

const TICK_MS = 500

function mmss(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function Lectura({ nivel, racha, onCompletar, onVolver }: Props) {
  const [fase, setFase] = useState<Fase>('inicio')
  const [objetivoMin, setObjetivoMin] = useState(() => minutosObjetivo(nivel))
  const [restanteMs, setRestanteMs] = useState(0)
  const inicioRef = useRef(0)
  const registrado = useRef(false)

  function comenzar() {
    inicioRef.current = Date.now()
    setRestanteMs(objetivoMin * 60_000)
    setFase('corriendo')
  }

  // cuenta regresiva anclada a Date.now() (sobrevive a throttling y bloqueo de pantalla)
  useEffect(() => {
    if (fase !== 'corriendo') return
    const totalMs = objetivoMin * 60_000
    const tick = () => {
      const restante = Math.max(0, totalMs - (Date.now() - inicioRef.current))
      setRestanteMs(restante)
      if (restante <= 0) setFase('completado')
    }
    const t = setInterval(tick, TICK_MS)
    return () => clearInterval(t)
  }, [fase, objetivoMin])

  // mantiene la pantalla encendida mientras se lee; degrada en silencio si no hay soporte
  useEffect(() => {
    if (fase !== 'corriendo' || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let activo = true
    navigator.wakeLock.request('screen').then(
      (s) => {
        if (activo) sentinel = s
        else void s.release()
      },
      () => {
        // no disponible o rechazado: el cronómetro sigue funcionando igual
      },
    )
    return () => {
      activo = false
      void sentinel?.release()
    }
  }, [fase])

  // registra la lectura una sola vez al completarse
  useEffect(() => {
    if (fase === 'completado' && !registrado.current) {
      registrado.current = true
      onCompletar(objetivoMin, objetivoMin)
    }
  }, [fase, objetivoMin, onCompletar])

  if (fase === 'corriendo') {
    return (
      <main className="pantalla lectura">
        <p className="subtitulo">Lee tu libro. El teléfono solo lleva el tiempo.</p>
        <p className="cronometro">{mmss(restanteMs)}</p>
        <button className="enlace" onClick={onVolver}>
          Terminar
        </button>
      </main>
    )
  }

  if (fase === 'completado') {
    return (
      <main className="pantalla lectura">
        <h2>📖 ¡Listo!</h2>
        <p className="grande">Completaste {objetivoMin} min de lectura enfocada.</p>
        <p className="cierre">Esa es la atención que el scroll te quita. Bien hecho.</p>
        <button className="principal" onClick={onVolver}>
          Listo
        </button>
      </main>
    )
  }

  const dias = racha === 1 ? 'día' : 'días'
  return (
    <main className="pantalla lectura">
      <h2>Lectura enfocada</h2>
      <p className="subtitulo">
        Toma un libro de verdad y léelo sin parar. El teléfono solo cuenta el tiempo.
      </p>
      {racha > 0 && (
        <p className="racha">
          📖 Racha de lectura: {racha} {dias}
        </p>
      )}
      <div className="ajuste">
        <button
          aria-label="Menos un minuto"
          onClick={() => setObjetivoMin((m) => Math.max(AJUSTE_MIN, m - 1))}
        >
          −
        </button>
        <span className="grande">{objetivoMin} min</span>
        <button
          aria-label="Más un minuto"
          onClick={() => setObjetivoMin((m) => Math.min(AJUSTE_MAX, m + 1))}
        >
          +
        </button>
      </div>
      <button className="principal" onClick={comenzar}>
        Comenzar
      </button>
      <button className="enlace" onClick={onVolver}>
        Volver
      </button>
    </main>
  )
}
