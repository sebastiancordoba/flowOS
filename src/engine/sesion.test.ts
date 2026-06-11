import { describe, expect, it } from 'vitest'
import { mulberry32 } from './rng'
import { DURACION_BLOQUE_MS } from './rutina'
import { crearSesion, responder } from './sesion'

describe('crearSesion', () => {
  it('arranca en el bloque 0 con un trial del primer ejercicio y el nivel guardado', () => {
    const s = crearSesion(['calculo', 'stroop'], { calculo: 4 }, mulberry32(42))
    expect(s.bloque).toBe(0)
    expect(s.escalera).toEqual({ nivel: 4, aciertosSeguidos: 0 })
    expect(s.trial).not.toBeNull()
    expect(s.terminada).toBe(false)
  })

  it('usa nivel 1 para ejercicios sin nivel guardado', () => {
    const s = crearSesion(['stroop'], {}, mulberry32(1))
    expect(s.escalera.nivel).toBe(1)
  })

  it('lanza con un plan vacío', () => {
    expect(() => crearSesion([], {}, mulberry32(1))).toThrow('plan vacío')
  })
})

describe('responder', () => {
  it('un acierto suma y genera el siguiente trial', () => {
    const rng = mulberry32(42)
    const s0 = crearSesion(['calculo'], {}, rng)
    const s1 = responder(s0, s0.trial!.correcta, 1000, rng)
    expect(s1.aciertos).toBe(1)
    expect(s1.total).toBe(1)
    expect(s1.trial).not.toBe(s0.trial)
    expect(s1.historial).toHaveLength(1)
  })

  it('un error no suma aciertos y baja el nivel', () => {
    const rng = mulberry32(42)
    const s0 = crearSesion(['calculo'], { calculo: 5 }, rng)
    const mala = s0.trial!.opciones.find((o) => o !== s0.trial!.correcta)!
    const s1 = responder(s0, mala, 1000, rng)
    expect(s1.aciertos).toBe(0)
    expect(s1.escalera.nivel).toBe(4)
  })

  it('al agotarse el tiempo del bloque cierra el bloque y abre el siguiente', () => {
    const rng = mulberry32(42)
    const s0 = crearSesion(['calculo', 'stroop'], { calculo: 3, stroop: 2 }, rng)
    const s1 = responder(s0, s0.trial!.correcta, DURACION_BLOQUE_MS, rng)
    expect(s1.bloque).toBe(1)
    expect(s1.resultados).toHaveLength(1)
    expect(s1.resultados[0]).toMatchObject({ id: 'calculo', aciertos: 1, total: 1 })
    expect(s1.escalera.nivel).toBe(2) // nivel guardado de stroop
    expect(s1.aciertos).toBe(0)
    expect(s1.historial).toHaveLength(0)
    expect(s1.trial).not.toBeNull()
  })

  it('al cerrar el último bloque la sesión termina', () => {
    const rng = mulberry32(42)
    const s0 = crearSesion(['calculo'], {}, rng)
    const s1 = responder(s0, s0.trial!.correcta, DURACION_BLOQUE_MS, rng)
    expect(s1.terminada).toBe(true)
    expect(s1.trial).toBeNull()
    expect(s1.resultados).toHaveLength(1)
  })

  it('persiste el nivel alcanzado en niveles', () => {
    const rng = mulberry32(42)
    let s = crearSesion(['calculo'], { calculo: 5 }, rng)
    const mala = s.trial!.opciones.find((o) => o !== s.trial!.correcta)!
    s = responder(s, mala, 1000, rng)
    expect(s.niveles.calculo).toBe(4)
  })

  it('ignora respuestas cuando ya terminó', () => {
    const rng = mulberry32(42)
    let s = crearSesion(['calculo'], {}, rng)
    s = responder(s, s.trial!.correcta, DURACION_BLOQUE_MS, rng)
    expect(responder(s, 'x', 0, rng)).toBe(s)
  })

  it('no muta el estado anterior', () => {
    const rng = mulberry32(42)
    const s0 = crearSesion(['calculo'], {}, rng)
    const copia = JSON.parse(JSON.stringify(s0))
    responder(s0, s0.trial!.correcta, 1000, rng)
    expect(JSON.parse(JSON.stringify(s0))).toEqual(copia)
  })

  it('n-atrás recibe el historial presentado, incluido el trial recién respondido', () => {
    // contrato crítico: generar(k+1) ve t0..tk; correcta = comparación con N atrás
    const rng = mulberry32(9)
    let s = crearSesion(['nback'], { nback: 4 }, rng) // nivel 4 → N=2
    const presentados: string[] = []
    for (let i = 0; i < 200 && !s.terminada; i++) {
      const trial = s.trial!
      presentados.push(trial.estimulo.texto)
      const n = trial.estimulo.regla === '1 atrás' ? 1 : trial.estimulo.regla === '2 atrás' ? 2 : 3
      const idx = presentados.length - 1 - n
      const esperada = idx >= 0 && presentados[idx] === trial.estimulo.texto ? 'Igual' : 'Distinto'
      expect(trial.correcta).toBe(esperada)
      s = responder(s, trial.correcta, 1000, rng)
    }
    expect(presentados.length).toBeGreaterThan(50)
  })
})
