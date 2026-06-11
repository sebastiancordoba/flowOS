import { useRef, useState } from 'react'
import { exportarEstado, importarEstado, type EstadoApp } from '../storage/estado'
import { EJERCICIOS } from '../engine/ejercicios'

interface Props {
  estado: EstadoApp
  onImportar: (estado: EstadoApp) => void
  onVolver: () => void
}

export function Estadisticas({ estado, onImportar, onVolver }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [errorImport, setErrorImport] = useState(false)

  function descargar() {
    const blob = new Blob([exportarEstado(estado)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowos-respaldo.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function manejarArchivo(archivo: File) {
    const texto = await archivo.text()
    const importado = importarEstado(texto)
    if (importado) {
      setErrorImport(false)
      onImportar(importado)
    } else {
      setErrorImport(true)
    }
  }

  const rutinas = estado.sesiones.filter((s) => s.tipo === 'rutina').length
  return (
    <main className="pantalla stats">
      <h2>Estadísticas</h2>
      <p>
        🔥 Racha actual: {estado.racha.actual} · Mejor: {estado.racha.mejor}
      </p>
      <p>
        Rutinas completadas: {rutinas} · Sesiones libres: {estado.sesiones.length - rutinas}
      </p>
      <h3>Nivel por ejercicio</h3>
      <ul>
        {EJERCICIOS.map((e) => (
          <li key={e.id}>
            {e.nombre}: nivel {estado.niveles[e.id] ?? 1}
          </li>
        ))}
      </ul>
      <h3>Respaldo</h3>
      <p className="subtitulo">
        Tus datos viven solo en este navegador. Exporta un respaldo de vez en cuando.
      </p>
      <button onClick={descargar}>Exportar datos</button>
      <button onClick={() => inputRef.current?.click()}>Importar datos</button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(ev) => {
          const archivo = ev.target.files?.[0]
          if (archivo) void manejarArchivo(archivo)
        }}
      />
      {errorImport && (
        <p className="aviso" role="alert">
          Ese archivo no es un respaldo válido de flowOS.
        </p>
      )}
      <button className="enlace" onClick={onVolver}>
        Volver
      </button>
    </main>
  )
}
