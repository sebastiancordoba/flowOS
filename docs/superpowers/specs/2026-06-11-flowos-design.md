# flowOS — Calentamiento cognitivo matutino

**Fecha:** 2026-06-11
**Estado:** Aprobado

## Resumen

Web app estática que reemplaza el scroll matutino con 5–10 minutos de ejercicios cognitivos generados aleatoriamente, con dificultad adaptativa. Uso personal pero compartible: sin cuentas ni backend, pero con calidad visual y explicaciones suficientes para pasar el link a cualquiera. Interfaz y contenido en español. Hosting en GitHub Pages.

## Posicionamiento (honestidad científica)

La evidencia sobre brain-training es clara: hay *near transfer* (mejoras en lo que practicas) pero el *far transfer* (volverte más inteligente en general) es débil o nulo (Simons et al. 2016). La app **no promete** inteligencia ni "reparar el cerebro". Promete tres beneficios con respaldo real:

1. **Calentamiento cognitivo agudo:** el esfuerzo mental eleva el arousal/alerta vía el sistema locus coeruleus–noradrenalina. Efecto inmediato, ideal antes de trabajo intelectual.
2. **Dopamina a cambio de esfuerzo:** usa los mismos ganchos del scroll (rachas, progreso, recompensa) redirigidos a la actividad mental activa en vez de pasiva.
3. **Reentrenamiento del hábito de atención:** práctica directa de sostener el foco en tareas exigentes (near transfer honesto a la conducta de concentrarse).

Este posicionamiento debe reflejarse en los textos de la app (pantalla "¿Por qué funciona?" breve y honesta).

## Ejercicios (MVP: 6)

Cada ejercicio implementa la interfaz común `Exercise` y genera sus trials proceduralmente (nunca se repite una sesión).

| # | Ejercicio | Dominio | Mecánica | Ejes de dificultad |
|---|-----------|---------|----------|--------------------|
| 1 | Cálculo rápido | Velocidad de procesamiento | Operaciones aritméticas contra reloj (suma, resta, multiplicación) con selección múltiple (4 opciones; funciona igual de bien en móvil y escritorio) | Magnitud de operandos, tipo de operación, tiempo límite |
| 2 | Stroop | Inhibición | Palabra de color pintada en tinta de otro color; el usuario responde el color de la tinta | Proporción de trials incongruentes, tiempo límite |
| 3 | N-back | Memoria de trabajo | Secuencia de estímulos (letras/figuras); ¿el actual es igual al de hace N posiciones? | N (empieza en 1), velocidad de presentación |
| 4 | Atención sostenida (SART) | Vigilancia | Aparecen dígitos; responder a todos EXCEPTO al objetivo (ej. el 3) | Frecuencia del objetivo, ritmo de presentación |
| 5 | Cambio de tarea | Flexibilidad cognitiva | La regla a aplicar cambia según una señal (ej. fondo azul → ¿par o impar?; fondo naranja → ¿mayor o menor que 5?) | Frecuencia de cambio, tiempo límite |
| 6 | Respiración guiada | Control atencional | Animación de respiración guiada (~3 min), cierre opcional de la rutina | Sin dificultad; duración configurable simple |

**Futuro (v2, fuera de alcance):** reading span y lectura cronometrada, montados sobre el mismo motor.

## Modos de uso

### Rutina de la mañana
- Un solo botón principal al abrir la app. Cero decisiones al despertar.
- La app arma una secuencia automática de 4–5 ejercicios variados (~75 segundos cada uno) + respiración opcional al final. Total: 6–8 minutos.
- El orden y la mezcla varían cada día (aleatorización entre dominios para evitar habituación).
- Al terminar: pantalla de resumen con puntajes, racha actualizada y un cierre motivacional ("cerebro encendido — ve a hacer algo difícil").
- Completar la rutina diaria alimenta la **racha**. Saltarse un día no destruye el progreso histórico (la racha se reinicia pero las estadísticas y niveles persisten); comunicar esto para reducir abandono por culpa.

### Sesión libre
- Lista de ejercicios; el usuario juega cualquiera individualmente, cuando quiera.
- No afecta la racha; sí alimenta estadísticas y nivel de dificultad.

## Dificultad adaptativa

- **Escalera adaptativa (staircase)** por ejercicio apuntando a ~80% de aciertos (zona de flow): acierto → sube dificultad; error → baja.
- Cada ejercicio define sus propios ejes de dificultad (ver tabla) mapeados a un nivel escalar persistente.
- El nivel por ejercicio **persiste entre sesiones**: la app siempre recibe al usuario en su zona justa.

## Arquitectura

- **Stack:** Vite + React + TypeScript. SPA 100% estática, sin backend, funciona offline una vez cargada.
- **Separación núcleo/UI:**
  - `src/engine/` — lógica pura en TypeScript, sin React: interfaz `Exercise` (generar trial, validar respuesta, ajustar dificultad), staircase, scoring, generadores de trials, lógica de racha y rutina. 100% testeable sin DOM.
  - `src/exercises/` — un módulo por ejercicio: implementación del engine + componente React de presentación.
  - `src/components/` — shell común (HUD: timer, progreso, feedback de acierto/error), pantallas (Home, RoutineRunner, FreeSession, Summary, Stats).
  - `src/storage/` — capa de persistencia sobre localStorage con esquema versionado.
- **Datos en localStorage:** racha, historial de sesiones, nivel de dificultad por ejercicio, estadísticas. Esquema con campo `version` para migraciones.
- **Export/import JSON** del estado completo como respaldo manual (localStorage es frágil).

## Manejo de errores

- localStorage corrupto o versión desconocida → intento de migración; si falla, reset a estado inicial con aviso claro al usuario (nunca pantalla blanca).
- Sin dependencias de red en runtime: no hay estados de error de red.

## Testing

- **Vitest** para el motor: generadores de trials (propiedades: rangos válidos, no repetición inmediata), staircase (converge a ~80%), scoring, lógica de racha (incluye cambio de día, día saltado), migraciones de storage.
- **React Testing Library** para flujos clave: completar una rutina de inicio a fin, persistencia de progreso, recuperación ante storage corrupto.

## Deploy

- Repositorio público en GitHub.
- GitHub Actions: build de Vite → deploy a GitHub Pages en cada push a `main`.
- `base` de Vite configurada para la ruta del repo en Pages.

## Fuera del alcance (v1)

- Cuentas de usuario y sincronización entre dispositivos
- Más idiomas (solo español)
- Notificaciones push / recordatorios
- Ejercicios 7 y 8 (reading span, lectura cronometrada)
- Tema configurable (un solo tema bien diseñado)

## Referencias clave

- Simons et al. (2016), *Psychological Science in the Public Interest* — consenso sobre near vs far transfer en brain-training
- Gloria Mark (UC Irvine) — declive de la atención frente a pantallas (~47 s)
- Revisión sistemática 2026 (Tandfonline) — video corto asociado a peor atención sostenida y autocontrol
- Au et al. / Redick et al. — n-back y la desaparición del far transfer con controles activos
- Ensayo ACTIVE — velocidad de procesamiento, único dominio con transferencia a largo plazo
- Metaanálisis de 111 RCTs — mindfulness mejora atención ejecutiva y sostenida
- Lally et al. (2010) — ~66 días para automatizar un hábito; el ancla contextual es el mayor predictor
