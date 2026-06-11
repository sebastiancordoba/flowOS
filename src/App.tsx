import { useEffect, useState } from 'react'
import type { IdEjercicio } from './engine/types'
import type { ResultadoBloque } from './engine/sesion'
import { planRutina } from './engine/rutina'
import { fechaLocal, registrarRutina } from './engine/racha'
import { cargarEstado, guardarEstado, type EstadoApp } from './storage/estado'
import { Inicio } from './screens/Inicio'
import { SesionView } from './screens/SesionView'
import { Resumen } from './screens/Resumen'
import { Respiracion } from './screens/Respiracion'
import { SesionLibre } from './screens/SesionLibre'
import { Estadisticas } from './screens/Estadisticas'
import { PorQue } from './screens/PorQue'

type Pantalla =
  | { id: 'inicio' }
  | { id: 'sesion'; plan: IdEjercicio[]; tipo: 'rutina' | 'libre' }
  | { id: 'respiracion'; alTerminar: Pantalla }
  | { id: 'resumen'; resultados: ResultadoBloque[]; tipo: 'rutina' | 'libre' }
  | { id: 'libre' }
  | { id: 'stats' }
  | { id: 'porque' }

export default function App() {
  const [carga] = useState(() => cargarEstado())
  const [estado, setEstado] = useState<EstadoApp>(carga.estado)
  const [pantalla, setPantalla] = useState<Pantalla>({ id: 'inicio' })
  const [hoy] = useState(() => fechaLocal(new Date()))

  useEffect(() => {
    guardarEstado(estado)
  }, [estado])

  function finalizarSesion(
    tipo: 'rutina' | 'libre',
    resultados: ResultadoBloque[],
    niveles: Partial<Record<IdEjercicio, number>>,
  ) {
    const hoy = fechaLocal(new Date())
    setEstado((e) => ({
      ...e,
      niveles: { ...e.niveles, ...niveles },
      racha: tipo === 'rutina' ? registrarRutina(e.racha, hoy) : e.racha,
      sesiones: [...e.sesiones, { fecha: hoy, tipo, resultados }],
    }))
    const resumen: Pantalla = { id: 'resumen', resultados, tipo }
    setPantalla(tipo === 'rutina' ? { id: 'respiracion', alTerminar: resumen } : resumen)
  }

  switch (pantalla.id) {
    case 'inicio':
      return (
        <Inicio
          estado={estado}
          avisoRecuperado={carga.recuperado}
          hoy={hoy}
          onRutina={() =>
            setPantalla({ id: 'sesion', plan: planRutina(Math.random), tipo: 'rutina' })
          }
          onLibre={() => setPantalla({ id: 'libre' })}
          onStats={() => setPantalla({ id: 'stats' })}
          onPorQue={() => setPantalla({ id: 'porque' })}
        />
      )
    case 'sesion':
      return (
        <SesionView
          key={pantalla.plan.join(',')}
          plan={pantalla.plan}
          niveles={estado.niveles}
          onFin={(resultados, niveles) => finalizarSesion(pantalla.tipo, resultados, niveles)}
        />
      )
    case 'respiracion':
      return <Respiracion onFin={() => setPantalla(pantalla.alTerminar)} />
    case 'resumen':
      return (
        <Resumen
          resultados={pantalla.resultados}
          racha={estado.racha.actual}
          tipo={pantalla.tipo}
          onInicio={() => setPantalla({ id: 'inicio' })}
        />
      )
    case 'libre':
      return (
        <SesionLibre
          onElegir={(id) => setPantalla({ id: 'sesion', plan: [id], tipo: 'libre' })}
          onRespiracion={() => setPantalla({ id: 'respiracion', alTerminar: { id: 'inicio' } })}
          onVolver={() => setPantalla({ id: 'inicio' })}
        />
      )
    case 'stats':
      return (
        <Estadisticas
          estado={estado}
          hoy={hoy}
          onImportar={(importado) => {
            setEstado(importado)
            setPantalla({ id: 'inicio' })
          }}
          onVolver={() => setPantalla({ id: 'inicio' })}
        />
      )
    case 'porque':
      return <PorQue onVolver={() => setPantalla({ id: 'inicio' })} />
  }
}
