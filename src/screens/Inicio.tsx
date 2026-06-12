import { rachaVigente } from '../engine/racha'
import type { EstadoApp } from '../storage/estado'

interface Props {
  estado: EstadoApp
  avisoRecuperado: boolean
  hoy: string
  onRutina: () => void
  onLibre: () => void
  onLectura: () => void
  onStats: () => void
  onPorQue: () => void
}

export function Inicio({
  estado,
  avisoRecuperado,
  hoy,
  onRutina,
  onLibre,
  onLectura,
  onStats,
  onPorQue,
}: Props) {
  const racha = rachaVigente(estado.racha, hoy)
  const dias = racha === 1 ? 'día' : 'días'
  return (
    <main className="pantalla inicio">
      {avisoRecuperado && (
        <p className="aviso" role="alert">
          No se pudieron leer tus datos guardados, así que empezamos de cero. Si tienes un
          respaldo, impórtalo en Estadísticas.
        </p>
      )}
      <h1>flowOS</h1>
      <p className="subtitulo">Enciende el cerebro antes de tocar el teléfono.</p>
      {racha > 0 && (
        <p className="racha">
          🔥 Racha: {racha} {dias}
        </p>
      )}
      <button className="principal" onClick={onRutina}>
        Rutina de la mañana
      </button>
      <button onClick={onLibre}>Sesión libre</button>
      <button onClick={onLectura}>Lectura enfocada</button>
      <nav>
        <button className="enlace" onClick={onStats}>
          Estadísticas
        </button>
        <button className="enlace" onClick={onPorQue}>
          ¿Por qué funciona?
        </button>
      </nav>
    </main>
  )
}
