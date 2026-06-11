import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => localStorage.clear())

  it('muestra la pantalla de inicio con el botón de rutina', () => {
    render(<StrictMode><App /></StrictMode>)
    expect(screen.getByRole('button', { name: 'Rutina de la mañana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sesión libre' })).toBeInTheDocument()
  })

  it('muestra aviso cuando los datos guardados están corruptos', () => {
    localStorage.setItem('flowos-estado', '{{{corrupto')
    render(<StrictMode><App /></StrictMode>)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron leer tus datos')
  })

  it('al pulsar Rutina de la mañana entra a una sesión con bloques', async () => {
    const usuario = userEvent.setup()
    render(<StrictMode><App /></StrictMode>)
    await usuario.click(screen.getByRole('button', { name: 'Rutina de la mañana' }))
    expect(screen.getByText('Bloque 1 / 4')).toBeInTheDocument()
  })

  it('navega a sesión libre y arranca un ejercicio individual', async () => {
    const usuario = userEvent.setup()
    render(<StrictMode><App /></StrictMode>)
    await usuario.click(screen.getByRole('button', { name: 'Sesión libre' }))
    await usuario.click(screen.getByRole('button', { name: 'Stroop' }))
    expect(screen.getByText('Bloque 1 / 1')).toBeInTheDocument()
  })

  it('navega a estadísticas y vuelve', async () => {
    const usuario = userEvent.setup()
    render(<StrictMode><App /></StrictMode>)
    await usuario.click(screen.getByRole('button', { name: 'Estadísticas' }))
    expect(screen.getByText(/Racha actual/)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Volver' }))
    expect(screen.getByRole('button', { name: 'Rutina de la mañana' })).toBeInTheDocument()
  })

  it('completa una sesión libre: resumen sin respiración y racha intacta', async () => {
    // NOTE: vi.useFakeTimers() + await act(...) deadlocks in React 19 / Vitest 4 because
    // React's scheduler flushes via MessageChannel (macrotask) which is not driven by the
    // act-internal microtask drain.  Instead we spy on Date.now() to make msEnBloque
    // overflow DURACION_BLOQUE_MS on the very first trial answer, then drive the session
    // through a real userEvent click (which wraps in act internally).
    const usuario = userEvent.setup()
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    await usuario.click(screen.getByRole('button', { name: 'Sesión libre' }))
    await usuario.click(screen.getByRole('button', { name: 'Stroop' }))
    expect(screen.getByText('Bloque 1 / 1')).toBeInTheDocument()
    // inicioBloque.current is now set to Date.now() (real time T0).
    // Mock Date.now() to return T0 + 100 s so msEnBloque = 100 000 >= 75 000 on the next answer.
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 100_000)
    // Click any trial button (Stroop shows ROJO / AZUL / VERDE / AMARILLO).
    // All non-trial buttons have been replaced by SesionView; the first button on screen
    // is one of the colour options.
    const [primerBoton] = screen.getAllByRole('button')
    await usuario.click(primerBoton)
    expect(screen.getByText('Resumen')).toBeInTheDocument()
    // sesión libre: sin pantalla de respiración y sin racha
    expect(screen.queryByText('Cierre opcional')).not.toBeInTheDocument()
    expect(screen.queryByText(/Racha/)).not.toBeInTheDocument()
    const guardado = JSON.parse(localStorage.getItem('flowos-estado')!)
    expect(guardado.sesiones).toHaveLength(1)
    expect(guardado.sesiones[0].tipo).toBe('libre')
    expect(guardado.racha.actual).toBe(0)
    vi.restoreAllMocks()
  })
})
