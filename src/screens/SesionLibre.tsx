import type { IdEjercicio } from '../engine/types'
import { EJERCICIOS } from '../engine/ejercicios'

interface Props {
  onElegir: (id: IdEjercicio) => void
  onRespiracion: () => void
  onVolver: () => void
}

export function SesionLibre({ onElegir, onRespiracion, onVolver }: Props) {
  return (
    <main className="pantalla libre">
      <h2>Sesión libre</h2>
      <p className="subtitulo">Un bloque de 75 segundos del ejercicio que elijas.</p>
      {EJERCICIOS.map((e) => (
        <button key={e.id} onClick={() => onElegir(e.id)}>
          {e.nombre}
        </button>
      ))}
      <button onClick={onRespiracion}>Respiración (3 min)</button>
      <button className="enlace" onClick={onVolver}>
        Volver
      </button>
    </main>
  )
}
