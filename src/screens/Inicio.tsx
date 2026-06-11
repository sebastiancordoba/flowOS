import type { EstadoApp } from '../storage/estado'

interface Props {
  estado: EstadoApp
  avisoRecuperado: boolean
  onRutina: () => void
  onLibre: () => void
  onStats: () => void
  onPorQue: () => void
}

export function Inicio({ estado, avisoRecuperado, onRutina, onLibre, onStats, onPorQue }: Props) {
  const dias = estado.racha.actual === 1 ? 'día' : 'días'
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
      {estado.racha.actual > 0 && (
        <p className="racha">
          🔥 Racha: {estado.racha.actual} {dias}
        </p>
      )}
      <button className="principal" onClick={onRutina}>
        Rutina de la mañana
      </button>
      <button onClick={onLibre}>Sesión libre</button>
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
