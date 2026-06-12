import { useRef, useState } from 'react'
import { rachaVigente } from '../engine/racha'
import { minutosObjetivo } from '../engine/lectura'
import { exportarEstado, importarEstado, type EstadoApp } from '../storage/estado'
import { EJERCICIOS } from '../engine/ejercicios'

interface Props {
  estado: EstadoApp
  hoy: string
  onImportar: (estado: EstadoApp) => void
  onVolver: () => void
}

export function Estadisticas({ estado, hoy, onImportar, onVolver }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [errorImport, setErrorImport] = useState(false)

  function descargar() {
    const blob = new Blob([exportarEstado(estado)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowos-respaldo.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function manejarArchivo(archivo: File) {
    try {
      const texto = await archivo.text()
      const importado = importarEstado(texto)
      if (importado) {
        setErrorImport(false)
        onImportar(importado)
      } else {
        setErrorImport(true)
      }
    } catch {
      setErrorImport(true)
    }
  }

  const rutinas = estado.sesiones.filter((s) => s.tipo === 'rutina').length
  const minutosLeidos = estado.lecturas.reduce((s, l) => s + l.minutosLeidos, 0)
  return (
    <main className="pantalla stats">
      <h2>Estadísticas</h2>
      <p>
        🔥 Racha actual: {rachaVigente(estado.racha, hoy)} · Mejor: {estado.racha.mejor}
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
      <h3>Lectura</h3>
      <p>
        📖 Racha de lectura: {rachaVigente(estado.lectura.racha, hoy)} · Mejor:{' '}
        {estado.lectura.racha.mejor}
      </p>
      <p>
        Objetivo actual: {minutosObjetivo(estado.lectura.nivel)} min · Sesiones:{' '}
        {estado.lecturas.length} · Total: {minutosLeidos} min
      </p>
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
          ev.target.value = ''
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
