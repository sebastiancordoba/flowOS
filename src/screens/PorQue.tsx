interface Props {
  onVolver: () => void
}

export function PorQue({ onVolver }: Props) {
  return (
    <main className="pantalla porque" style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
      <h2>¿Por qué funciona?</h2>
      <p>
        Seamos honestos: ninguna app de ejercicios mentales te hace más inteligente. La ciencia es
        clara en que mejoras en lo que practicas (transferencia cercana), pero eso rara vez se
        generaliza. flowOS no promete eso. Promete tres cosas con respaldo real:
      </p>
      <p>
        <strong>1. Calentamiento cognitivo.</strong> El esfuerzo mental eleva tu estado de alerta
        de inmediato (vía el sistema de noradrenalina). Unos minutos de ejercicio exigente te dejan
        más despierto para leer, estudiar o trabajar.
      </p>
      <p>
        <strong>2. Dopamina a cambio de esfuerzo.</strong> El scroll matutino usa recompensas
        variables para engancharte en consumo pasivo. Aquí el mismo mecanismo (racha, progreso,
        niveles) está al servicio del esfuerzo activo.
      </p>
      <p>
        <strong>3. Reentrenar el hábito de concentrarte.</strong> Cada bloque es práctica directa
        de sostener la atención en algo exigente. Y la respiración guiada del cierre es la parte
        con mejor evidencia: el entrenamiento de atención plena mejora la atención ejecutiva y
        sostenida.
      </p>
      <p className="subtitulo">
        Un hábito tarda en promedio ~66 días en automatizarse. Saltarte un día no arruina nada:
        solo vuelve mañana.
      </p>
      <button className="enlace" onClick={onVolver}>
        Volver
      </button>
    </main>
  )
}
