import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionView } from './SesionView'

describe('SesionView', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('muestra el ejercicio del bloque actual', () => {
    render(<SesionView plan={['stroop']} niveles={{}} onFin={() => {}} />)
    expect(screen.getByText('Stroop')).toBeInTheDocument()
    expect(screen.getByText('Bloque 1 / 1')).toBeInTheDocument()
  })

  it('completa el bloque por timeouts y llama onFin con resultados', () => {
    const onFin = vi.fn()
    render(<SesionView plan={['stroop']} niveles={{}} onFin={onFin} />)
    // dejar vencer trials hasta superar los 75 s del bloque
    for (let i = 0; i < 60 && !onFin.mock.calls.length; i++) {
      act(() => {
        vi.advanceTimersByTime(4000)
      })
    }
    expect(onFin).toHaveBeenCalledTimes(1)
    const [resultados, niveles] = onFin.mock.calls[0]
    expect(resultados).toHaveLength(1)
    expect(resultados[0].id).toBe('stroop')
    expect(resultados[0].total).toBeGreaterThan(0)
    expect(niveles.stroop).toBeGreaterThanOrEqual(1)
  })
})
