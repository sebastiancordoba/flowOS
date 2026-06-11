import type { Trial } from '../engine/types'

interface Props {
  trial: Trial
  feedback: 'acierto' | 'error' | null
  onRespuesta: (respuesta: string) => void
}

export function TrialView({ trial, feedback, onRespuesta }: Props) {
  return (
    <div className={`trial ${feedback ?? ''}`}>
      {trial.estimulo.regla && <p className="regla">{trial.estimulo.regla}</p>}
      <p
        className="estimulo"
        style={trial.estimulo.color ? { color: trial.estimulo.color } : undefined}
      >
        {trial.estimulo.texto}
      </p>
      <div className="opciones">
        {trial.opciones.map((opcion) => (
          <button key={opcion} onClick={() => onRespuesta(opcion)}>
            {opcion}
          </button>
        ))}
      </div>
    </div>
  )
}
