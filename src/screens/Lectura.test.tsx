import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Lectura } from './Lectura'

describe('Lectura', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('muestra el objetivo propuesto según el nivel y permite ajustarlo', () => {
    render(<Lectura nivel={1} racha={0} onCompletar={() => {}} onVolver={() => {}} />)
    expect(screen.getByText('5 min')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Más un minuto' }))
    expect(screen.getByText('6 min')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Menos un minuto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Menos un minuto' }))
    expect(screen.getByText('4 min')).toBeInTheDocument()
  })

  it('al agotarse el tiempo registra la lectura una sola vez y muestra el resumen', () => {
    const onCompletar = vi.fn()
    render(<Lectura nivel={1} racha={0} onCompletar={onCompletar} onVolver={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }))
    act(() => {
      vi.advanceTimersByTime(5 * 60_000 + 600) // margen para el último tick del intervalo
    })
    expect(onCompletar).toHaveBeenCalledTimes(1)
    expect(onCompletar).toHaveBeenCalledWith(5, 5)
    expect(screen.getByText(/Completaste 5 min/)).toBeInTheDocument()
  })

  it('terminar antes de tiempo no registra nada', () => {
    const onCompletar = vi.fn()
    const onVolver = vi.fn()
    render(<Lectura nivel={1} racha={0} onCompletar={onCompletar} onVolver={onVolver} />)
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }))
    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Terminar' }))
    expect(onVolver).toHaveBeenCalledTimes(1)
    expect(onCompletar).not.toHaveBeenCalled()
  })

  it('muestra la racha de lectura vigente si la hay', () => {
    render(<Lectura nivel={3} racha={4} onCompletar={() => {}} onVolver={() => {}} />)
    expect(screen.getByText(/Racha de lectura: 4 días/)).toBeInTheDocument()
    expect(screen.getByText('7 min')).toBeInTheDocument()
  })
})
