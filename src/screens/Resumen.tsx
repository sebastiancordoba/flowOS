import type { ResultadoBloque } from '../engine/sesion'
import { ejercicioPorId } from '../engine/ejercicios'

interface Props {
  resultados: ResultadoBloque[]
  racha: number
  tipo: 'rutina' | 'libre'
  onInicio: () => void
}

export function Resumen({ resultados, racha, tipo, onInicio }: Props) {
  const aciertos = resultados.reduce((s, r) => s + r.aciertos, 0)
  const total = resultados.reduce((s, r) => s + r.total, 0)
  const porcentaje = total > 0 ? ` (${Math.round((aciertos / total) * 100)}%)` : ''
  const dias = racha === 1 ? 'día' : 'días'
  return (
    <main className="pantalla resumen">
      <h2>Resumen</h2>
      <p className="grande">
        {aciertos} / {total} aciertos{porcentaje}
      </p>
      <ul>
        {resultados.map((r, i) => (
          <li key={i}>
            {ejercicioPorId(r.id).nombre}: {r.aciertos}/{r.total} · nivel {r.nivelFinal}
          </li>
        ))}
      </ul>
      {tipo === 'rutina' && (
        <>
          <p className="racha">
            🔥 Racha: {racha} {dias}
          </p>
          <p className="cierre">Cerebro encendido. Ahora ve a hacer algo difícil. 💪</p>
        </>
      )}
      <button className="principal" onClick={onInicio}>
        Listo
      </button>
    </main>
  )
}
